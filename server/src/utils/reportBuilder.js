import { buildStudentReport } from "./behaviourAnalysis.js";

const average = (values) =>
  values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;

const round = (value) => Math.round(value * 10) / 10;

const sortByDateDesc = (collection) =>
  [...collection].sort(
    (first, second) => new Date(second.createdAt || second.date) - new Date(first.createdAt || first.date),
  );

const toDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const groupByStudent = (records, studentField = "student") =>
  records.reduce((groups, record) => {
    const recordStudent = record[studentField];
    const studentId =
      typeof recordStudent === "object" && recordStudent !== null && recordStudent._id
        ? String(recordStudent._id)
        : String(recordStudent);

    if (!groups.has(studentId)) {
      groups.set(studentId, []);
    }

    groups.get(studentId).push(record);
    return groups;
  }, new Map());

export const buildStudentReports = (
  students,
  attendanceRecords,
  markRecords,
  behaviourLogs,
) => {
  const attendanceMap = groupByStudent(attendanceRecords);
  const markMap = groupByStudent(markRecords);
  const behaviourMap = groupByStudent(behaviourLogs);

  return students.map((student) =>
    buildStudentReport({
      student,
      attendanceRecords: attendanceMap.get(String(student._id)) || [],
      markRecords: markMap.get(String(student._id)) || [],
      behaviourLogs: behaviourMap.get(String(student._id)) || [],
    }),
  );
};

export const buildAttendanceTrend = (attendanceRecords, maxPoints = 10) => {
  const grouped = attendanceRecords.reduce((result, record) => {
    const key = toDateKey(record.date);

    if (!result.has(key)) {
      result.set(key, { date: key, present: 0, late: 0, absent: 0, excused: 0, total: 0 });
    }

    const entry = result.get(key);
    const statusKey = String(record.status).toLowerCase();

    if (statusKey in entry) {
      entry[statusKey] += 1;
    }

    entry.total += 1;
    return result;
  }, new Map());

  return [...grouped.values()]
    .sort((first, second) => new Date(first.date) - new Date(second.date))
    .slice(-maxPoints)
    .map((entry) => ({
      ...entry,
      attendanceRate: entry.total
        ? round(((entry.present + entry.excused + entry.late * 0.75) / entry.total) * 100)
        : 0,
      label: new Date(entry.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    }));
};

export const buildRiskDistribution = (studentReports) => [
  {
    name: "Low",
    value: studentReports.filter((student) => student.riskLevel === "Low").length,
  },
  {
    name: "Medium",
    value: studentReports.filter((student) => student.riskLevel === "Medium").length,
  },
  {
    name: "High",
    value: studentReports.filter((student) => student.riskLevel === "High").length,
  },
];

export const buildDepartmentPerformance = (studentReports) => {
  const grouped = studentReports.reduce((result, student) => {
    if (!result.has(student.department)) {
      result.set(student.department, []);
    }

    result.get(student.department).push(student);
    return result;
  }, new Map());

  return [...grouped.entries()].map(([department, students]) => ({
    department,
    averageBehaviourScore: round(average(students.map((student) => student.behaviourScore))),
    averageMarks: round(average(students.map((student) => student.averageMark))),
    averageAttendance: round(average(students.map((student) => student.attendanceRate))),
  }));
};

export const buildSubjectPerformance = (markRecords) => {
  const grouped = markRecords.reduce((result, record) => {
    if (!result.has(record.subject)) {
      result.set(record.subject, []);
    }

    const percentage = record.totalMarks
      ? (record.marksObtained / record.totalMarks) * 100
      : 0;

    result.get(record.subject).push(percentage);
    return result;
  }, new Map());

  return [...grouped.entries()].map(([subject, scores]) => ({
    subject,
    averageMarks: round(average(scores)),
  }));
};

export const buildSemesterPerformance = (studentReports) => {
  const grouped = studentReports.reduce((result, student) => {
    const key = `Semester ${student.semester}`;

    if (!result.has(key)) {
      result.set(key, []);
    }

    result.get(key).push(student);
    return result;
  }, new Map());

  return [...grouped.entries()].map(([semester, students]) => ({
    semester,
    averageBehaviourScore: round(average(students.map((student) => student.behaviourScore))),
    averageAttendance: round(average(students.map((student) => student.attendanceRate))),
  }));
};

export const buildDashboardSnapshot = ({
  studentReports,
  attendanceRecords,
  notifications,
}) => {
  const latestAttendanceDate = attendanceRecords.length
    ? sortByDateDesc(attendanceRecords)[0].date
    : null;

  const latestDayRecords = latestAttendanceDate
    ? attendanceRecords.filter(
        (record) => toDateKey(record.date) === toDateKey(latestAttendanceDate),
      )
    : [];

  const attendanceToday = latestDayRecords.length
    ? round(
        ((latestDayRecords.filter((record) =>
          ["Present", "Late", "Excused"].includes(record.status),
        ).length /
          latestDayRecords.length) *
          100),
      )
    : 0;

  const topConcernStudents = [...studentReports]
    .sort((first, second) => first.behaviourScore - second.behaviourScore)
    .slice(0, 5);

  const spotlightStudents = [...studentReports]
    .sort((first, second) => second.behaviourScore - first.behaviourScore)
    .slice(0, 4);

  return {
    metrics: {
      totalStudents: studentReports.length,
      averageAttendance: round(
        average(studentReports.map((student) => student.attendanceRate)),
      ),
      averageMarks: round(average(studentReports.map((student) => student.averageMark))),
      averageBehaviourScore: round(
        average(studentReports.map((student) => student.behaviourScore)),
      ),
      highRiskStudents: studentReports.filter((student) => student.riskLevel === "High").length,
      activeAlerts: notifications.filter((notification) => notification.isActive).length,
      attendanceToday,
    },
    attendanceTrend: buildAttendanceTrend(attendanceRecords, 8),
    riskDistribution: buildRiskDistribution(studentReports),
    departmentPerformance: buildDepartmentPerformance(studentReports),
    topConcernStudents,
    spotlightStudents,
    recommendations: topConcernStudents.flatMap((student) => student.suggestions).slice(0, 5),
    recentNotifications: sortByDateDesc(notifications).slice(0, 5),
  };
};

export const buildAnalyticsPayload = ({
  studentReports,
  attendanceRecords,
  markRecords,
}) => ({
  riskDistribution: buildRiskDistribution(studentReports),
  attendanceTrend: buildAttendanceTrend(attendanceRecords, 10),
  departmentPerformance: buildDepartmentPerformance(studentReports),
  semesterPerformance: buildSemesterPerformance(studentReports),
  subjectPerformance: buildSubjectPerformance(markRecords),
  performanceBands: [
    {
      name: "Excellent",
      value: studentReports.filter((student) => student.behaviourScore >= 85).length,
    },
    {
      name: "Steady",
      value: studentReports.filter(
        (student) => student.behaviourScore >= 65 && student.behaviourScore < 85,
      ).length,
    },
    {
      name: "Needs Support",
      value: studentReports.filter((student) => student.behaviourScore < 65).length,
    },
  ],
  topPerformers: [...studentReports]
    .sort((first, second) => second.behaviourScore - first.behaviourScore)
    .slice(0, 5),
  riskAlerts: [...studentReports]
    .filter((student) => student.riskLevel !== "Low")
    .sort((first, second) => first.behaviourScore - second.behaviourScore)
    .slice(0, 5),
});
