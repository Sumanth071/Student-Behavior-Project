import Attendance from "../models/Attendance.js";
import BehaviourLog from "../models/BehaviourLog.js";
import Mark from "../models/Mark.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getStudentVisibilityFilter,
  isPrivilegedUser,
} from "../utils/accessScope.js";
import { buildStudentReport } from "../utils/behaviourAnalysis.js";
import {
  buildAnalyticsPayload,
  buildStudentReports,
} from "../utils/reportBuilder.js";

export const getAnalytics = asyncHandler(async (req, res) => {
  const students = await Student.find(getStudentVisibilityFilter(req.user)).sort({
    fullName: 1,
  });

  const studentIds = students.map((student) => student._id);
  const query = { student: { $in: studentIds.length ? studentIds : [] } };

  const [attendanceRecords, markRecords, behaviourLogs] = await Promise.all([
    Attendance.find(query),
    Mark.find(query),
    BehaviourLog.find(query),
  ]);

  const studentReports = buildStudentReports(
    students,
    attendanceRecords,
    markRecords,
    behaviourLogs,
  );

  res.json({
    overview: {
      totalStudents: studentReports.length,
      averageBehaviourScore: studentReports.length
        ? Math.round(
            studentReports.reduce(
              (total, student) => total + student.behaviourScore,
              0,
            ) / studentReports.length,
          )
        : 0,
      highRiskCount: studentReports.filter((student) => student.riskLevel === "High").length,
    },
    ...buildAnalyticsPayload({
      studentReports,
      attendanceRecords,
      markRecords,
    }),
  });
});

export const getStudentReport = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.studentId);

  if (!student) {
    res.status(404);
    throw new Error("Student not found.");
  }

  if (
    !isPrivilegedUser(req.user.role) &&
    String(req.user.linkedStudent?._id || req.user.linkedStudent) !== String(student._id)
  ) {
    res.status(403);
    throw new Error("You do not have access to this student.");
  }

  const [attendanceRecords, markRecords, behaviourLogs] = await Promise.all([
    Attendance.find({ student: student._id }).sort({ date: -1 }),
    Mark.find({ student: student._id }).sort({ createdAt: -1 }),
    BehaviourLog.find({ student: student._id }).sort({ date: -1 }),
  ]);

  res.json({
    student: buildStudentReport({
      student,
      attendanceRecords,
      markRecords,
      behaviourLogs,
    }),
    records: {
      attendance: attendanceRecords,
      marks: markRecords,
      behaviour: behaviourLogs,
    },
  });
});
