import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getStudentRecordFilter, isPrivilegedUser } from "../utils/accessScope.js";

const attendancePopulation = [
  { path: "student", select: "fullName admissionNo department semester section" },
  { path: "recordedBy", select: "name role" },
];

export const getAttendanceRecords = asyncHandler(async (req, res) => {
  const query = getStudentRecordFilter(req.user);

  if (req.query.studentId && isPrivilegedUser(req.user.role)) {
    query.student = req.query.studentId;
  }

  const records = await Attendance.find(query)
    .populate(attendancePopulation)
    .sort({ date: -1, createdAt: -1 });

  res.json(records);
});

export const createAttendanceRecord = asyncHandler(async (req, res) => {
  const { student, date, subject, status } = req.body;

  if (!student || !date || !subject || !status) {
    res.status(400);
    throw new Error("Student, date, subject, and status are required.");
  }

  const studentExists = await Student.findById(student);

  if (!studentExists) {
    res.status(404);
    throw new Error("Student not found.");
  }

  const record = await Attendance.create({
    student,
    date,
    subject,
    status,
    recordedBy: req.user._id,
  });

  const populatedRecord = await Attendance.findById(record._id).populate(attendancePopulation);
  res.status(201).json(populatedRecord);
});

export const updateAttendanceRecord = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Attendance record not found.");
  }

  const updatedRecord = await Attendance.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      recordedBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(attendancePopulation);

  res.json(updatedRecord);
});

export const deleteAttendanceRecord = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Attendance record not found.");
  }

  await record.deleteOne();
  res.json({ message: "Attendance record deleted successfully." });
});
