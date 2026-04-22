import Attendance from "../models/Attendance.js";
import BehaviourLog from "../models/BehaviourLog.js";
import Mark from "../models/Mark.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isPrivilegedUser, getStudentVisibilityFilter } from "../utils/accessScope.js";
import { buildStudentReport, calculateBehaviourSnapshot } from "../utils/behaviourAnalysis.js";
import { buildStudentReports } from "../utils/reportBuilder.js";

const getStudentWithAccessCheck = async (studentId, user) => {
  const student = await Student.findById(studentId);

  if (!student) {
    return null;
  }

  if (
    !isPrivilegedUser(user.role) &&
    (!user.linkedStudent || String(user.linkedStudent._id || user.linkedStudent) !== String(student._id))
  ) {
    const error = new Error("You do not have access to this student.");
    error.statusCode = 403;
    throw error;
  }

  return student;
};

export const getStudents = asyncHandler(async (req, res) => {
  const baseFilter = getStudentVisibilityFilter(req.user);
  const query = { ...baseFilter };

  if (req.query.department) {
    query.department = req.query.department;
  }

  if (req.query.section) {
    query.section = req.query.section;
  }

  if (req.query.semester) {
    query.semester = Number(req.query.semester);
  }

  if (req.query.search) {
    query.$or = [
      { fullName: { $regex: req.query.search, $options: "i" } },
      { admissionNo: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const students = await Student.find(query).sort({ fullName: 1 });

  const studentIds = students.map((student) => student._id);
  const recordQuery = { student: { $in: studentIds.length ? studentIds : [] } };

  const [attendanceRecords, markRecords, behaviourLogs] = await Promise.all([
    Attendance.find(recordQuery),
    Mark.find(recordQuery),
    BehaviourLog.find(recordQuery),
  ]);

  res.json(buildStudentReports(students, attendanceRecords, markRecords, behaviourLogs));
});

export const getStudentById = asyncHandler(async (req, res) => {
  let student;

  try {
    student = await getStudentWithAccessCheck(req.params.id, req.user);
  } catch (error) {
    res.status(error.statusCode || 500);
    throw error;
  }

  if (!student) {
    res.status(404);
    throw new Error("Student not found.");
  }

  const [attendanceRecords, markRecords, behaviourLogs] = await Promise.all([
    Attendance.find({ student: student._id }).sort({ date: -1 }),
    Mark.find({ student: student._id }).sort({ createdAt: -1 }),
    BehaviourLog.find({ student: student._id }).sort({ date: -1 }),
  ]);

  res.json(
    buildStudentReport({
      student,
      attendanceRecords,
      markRecords,
      behaviourLogs,
    }),
  );
});

export const createStudent = asyncHandler(async (req, res) => {
  const {
    admissionNo,
    fullName,
    email,
    department,
    semester,
    section,
    mentorName,
    parentName,
    parentPhone,
    gender,
    status,
    address,
  } = req.body;

  if (!admissionNo || !fullName || !email || !department || !semester || !section) {
    res.status(400);
    throw new Error("Admission number, name, email, department, semester, and section are required.");
  }

  const student = await Student.create({
    admissionNo,
    fullName,
    email: email.toLowerCase(),
    department,
    semester,
    section,
    mentorName,
    parentName,
    parentPhone,
    gender,
    status,
    address,
  });

  res.status(201).json({
    ...student.toObject(),
    ...calculateBehaviourSnapshot({}),
    latestObservation: "No behaviour observations have been recorded yet.",
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found.");
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      email: req.body.email ? req.body.email.toLowerCase() : student.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.json(updatedStudent);
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found.");
  }

  await Promise.all([
    Attendance.deleteMany({ student: req.params.id }),
    Mark.deleteMany({ student: req.params.id }),
    BehaviourLog.deleteMany({ student: req.params.id }),
    Notification.deleteMany({ student: req.params.id }),
    User.updateMany({ linkedStudent: req.params.id }, { $set: { linkedStudent: null } }),
    Student.findByIdAndDelete(req.params.id),
  ]);

  res.json({ message: "Student and related records deleted successfully." });
});
