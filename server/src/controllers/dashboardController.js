import Attendance from "../models/Attendance.js";
import BehaviourLog from "../models/BehaviourLog.js";
import Mark from "../models/Mark.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  isPrivilegedUser,
  getStudentVisibilityFilter,
} from "../utils/accessScope.js";
import {
  buildDashboardSnapshot,
  buildStudentReports,
} from "../utils/reportBuilder.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const students = await Student.find(getStudentVisibilityFilter(req.user)).sort({
    createdAt: -1,
  });

  const studentIds = students.map((student) => student._id);
  const studentQuery = {
    student: { $in: studentIds.length ? studentIds : [] },
  };

  const notificationQuery = isPrivilegedUser(req.user.role)
    ? {}
    : {
        audienceRoles: { $in: [req.user.role] },
        isActive: true,
      };

  const [attendanceRecords, markRecords, behaviourLogs, notifications] =
    await Promise.all([
      Attendance.find(studentQuery).sort({ date: -1 }),
      Mark.find(studentQuery).sort({ createdAt: -1 }),
      BehaviourLog.find(studentQuery).sort({ date: -1 }),
      Notification.find(notificationQuery)
        .populate("student", "fullName admissionNo department")
        .sort({ createdAt: -1 }),
    ]);

  const studentReports = buildStudentReports(
    students,
    attendanceRecords,
    markRecords,
    behaviourLogs,
  );

  res.json({
    currentRole: req.user.role,
    ...buildDashboardSnapshot({
      studentReports,
      attendanceRecords,
      notifications,
    }),
  });
});
