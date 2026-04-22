const statusWeights = {
  Present: 1,
  Late: 0.75,
  Excused: 0.85,
  Absent: 0,
};

const average = (values) =>
  values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;

const round = (value) => Math.round(value * 10) / 10;

const getRiskLevel = (score) => {
  if (score >= 75) {
    return "Low";
  }

  if (score >= 50) {
    return "Medium";
  }

  return "High";
};

const buildInsights = ({
  attendanceRate,
  averageMark,
  participation,
  discipline,
  assignmentRate,
  riskLevel,
}) => {
  const insights = [];

  if (attendanceRate < 75) {
    insights.push("Attendance is below the recommended threshold for consistent progress.");
  }

  if (averageMark < 65) {
    insights.push("Academic scores indicate the student may need structured revision support.");
  }

  if (participation < 70) {
    insights.push("Class participation is limited and classroom engagement should be improved.");
  }

  if (discipline < 70) {
    insights.push("Discipline observations show a need for better classroom conduct and focus.");
  }

  if (assignmentRate < 75) {
    insights.push("Assignment submission consistency is affecting overall behaviour analysis.");
  }

  if (!insights.length) {
    insights.push("The student is maintaining a balanced academic and behavioural profile.");
  }

  if (riskLevel === "High") {
    insights.push("Immediate mentoring attention is recommended due to multiple weak indicators.");
  }

  return insights.slice(0, 4);
};

const buildSuggestions = ({
  attendanceRate,
  averageMark,
  participation,
  discipline,
  assignmentRate,
  riskLevel,
}) => {
  const suggestions = [];

  if (attendanceRate < 75) {
    suggestions.push("Schedule a mentor check-in and track attendance weekly.");
  }

  if (averageMark < 65) {
    suggestions.push("Provide targeted remedial classes for low-scoring subjects.");
  }

  if (participation < 70) {
    suggestions.push("Encourage the student to join presentations, clubs, or discussion rounds.");
  }

  if (discipline < 70) {
    suggestions.push("Create a conduct improvement plan with teacher and parent involvement.");
  }

  if (assignmentRate < 75) {
    suggestions.push("Use assignment reminders and small milestone deadlines to improve submissions.");
  }

  if (!suggestions.length && riskLevel === "Low") {
    suggestions.push("Continue the current mentoring approach and recognize strong performance.");
  }

  return suggestions.slice(0, 4);
};

export const calculateBehaviourSnapshot = ({
  attendanceRecords = [],
  markRecords = [],
  behaviourLogs = [],
}) => {
  const attendanceRate =
    average(
      attendanceRecords.map(
        (record) => (statusWeights[record.status] ?? 0) * 100,
      ),
    ) || 0;

  const averageMark =
    average(
      markRecords.map((record) =>
        record.totalMarks ? (record.marksObtained / record.totalMarks) * 100 : 0,
      ),
    ) || 0;

  const participation =
    average(behaviourLogs.map((record) => Number(record.participation) || 0)) || 0;

  const discipline =
    average(behaviourLogs.map((record) => Number(record.discipline) || 0)) || 0;

  const totalAssignments = behaviourLogs.reduce(
    (total, record) => total + (Number(record.assignmentTotal) || 0),
    0,
  );

  const submittedAssignments = behaviourLogs.reduce(
    (total, record) => total + (Number(record.assignmentSubmitted) || 0),
    0,
  );

  const assignmentRate = totalAssignments
    ? (submittedAssignments / totalAssignments) * 100
    : 0;

  const behaviourScore = Math.round(
    attendanceRate * 0.25 +
      averageMark * 0.35 +
      participation * 0.15 +
      discipline * 0.15 +
      assignmentRate * 0.1,
  );

  const riskLevel = getRiskLevel(behaviourScore);
  const insightInput = {
    attendanceRate,
    averageMark,
    participation,
    discipline,
    assignmentRate,
    riskLevel,
  };

  return {
    attendanceRate: round(attendanceRate),
    averageMark: round(averageMark),
    participation: round(participation),
    discipline: round(discipline),
    assignmentRate: round(assignmentRate),
    behaviourScore,
    riskLevel,
    insights: buildInsights(insightInput),
    suggestions: buildSuggestions(insightInput),
  };
};

export const buildStudentReport = ({
  student,
  attendanceRecords = [],
  markRecords = [],
  behaviourLogs = [],
}) => {
  const snapshot = calculateBehaviourSnapshot({
    attendanceRecords,
    markRecords,
    behaviourLogs,
  });

  const latestBehaviourLog = [...behaviourLogs].sort(
    (first, second) => new Date(second.date) - new Date(first.date),
  )[0];

  const baseStudent = student.toObject ? student.toObject() : student;

  return {
    ...baseStudent,
    ...snapshot,
    attendanceCount: attendanceRecords.length,
    marksCount: markRecords.length,
    behaviourLogCount: behaviourLogs.length,
    latestObservation:
      latestBehaviourLog?.observation ||
      "No behaviour observations have been recorded yet.",
    latestIncidentSeverity: latestBehaviourLog?.incidentSeverity || "None",
  };
};
