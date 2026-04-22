import Mark from "../models/Mark.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getStudentRecordFilter, isPrivilegedUser } from "../utils/accessScope.js";

const markPopulation = [
  { path: "student", select: "fullName admissionNo department semester section" },
  { path: "recordedBy", select: "name role" },
];

export const getMarks = asyncHandler(async (req, res) => {
  const query = getStudentRecordFilter(req.user);

  if (req.query.studentId && isPrivilegedUser(req.user.role)) {
    query.student = req.query.studentId;
  }

  const marks = await Mark.find(query)
    .populate(markPopulation)
    .sort({ createdAt: -1 });

  res.json(marks);
});

export const createMark = asyncHandler(async (req, res) => {
  const { student, subject, examType, term, marksObtained, totalMarks } = req.body;

  if (!student || !subject || !examType || marksObtained === undefined || !totalMarks) {
    res.status(400);
    throw new Error("Student, subject, exam type, obtained marks, and total marks are required.");
  }

  const studentExists = await Student.findById(student);

  if (!studentExists) {
    res.status(404);
    throw new Error("Student not found.");
  }

  const mark = await Mark.create({
    student,
    subject,
    examType,
    term,
    marksObtained,
    totalMarks,
    recordedBy: req.user._id,
  });

  const populatedMark = await Mark.findById(mark._id).populate(markPopulation);
  res.status(201).json(populatedMark);
});

export const updateMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findById(req.params.id);

  if (!mark) {
    res.status(404);
    throw new Error("Marks entry not found.");
  }

  const updatedMark = await Mark.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      recordedBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(markPopulation);

  res.json(updatedMark);
});

export const deleteMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findById(req.params.id);

  if (!mark) {
    res.status(404);
    throw new Error("Marks entry not found.");
  }

  await mark.deleteOne();
  res.json({ message: "Marks entry deleted successfully." });
});
