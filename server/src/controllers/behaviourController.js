import Attendance from "../models/Attendance.js";
import BehaviourLog from "../models/BehaviourLog.js";
import Mark from "../models/Mark.js";
import Student from "../models/Student.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getStudentRecordFilter,
  isPrivilegedUser,
} from "../utils/accessScope.js";
import { buildStudentReport } from "../utils/behaviourAnalysis.js";

const behaviourPopulation = [
  { path: "student", select: "fullName admissionNo department semester section" },
  { path: "recordedBy", select: "name role" },
];

export const getBehaviourLogs = asyncHandler(async (req, res) => {
  const query = getStudentRecordFilter(req.user);

  if (req.query.studentId && isPrivilegedUser(req.user.role)) {
    query.student = req.query.studentId;
  }

  const logs = await BehaviourLog.find(query)
    .populate(behaviourPopulation)
    .sort({ date: -1, createdAt: -1 });

  res.json(logs);
});

export const getStudentBehaviourReport = asyncHandler(async (req, res) => {
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
    BehaviourLog.find({ student: student._id })
      .populate(behaviourPopulation)
      .sort({ date: -1 }),
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

export const createBehaviourLog = asyncHandler(async (req, res) => {
  const {
    student,
    date,
    participation,
    discipline,
    assignmentSubmitted,
    assignmentTotal,
    incidentSeverity,
    observation,
    counselorNote,
  } = req.body;

  if (
    !student ||
    !date ||
    participation === undefined ||
    discipline === undefined ||
    assignmentSubmitted === undefined ||
    assignmentTotal === undefined
  ) {
    res.status(400);
    throw new Error("Student, date, participation, discipline, and assignment details are required.");
  }

  const studentExists = await Student.findById(student);

  if (!studentExists) {
    res.status(404);
    throw new Error("Student not found.");
  }

  const log = await BehaviourLog.create({
    student,
    date,
    participation,
    discipline,
    assignmentSubmitted,
    assignmentTotal,
    incidentSeverity,
    observation,
    counselorNote,
    recordedBy: req.user._id,
  });

  const populatedLog = await BehaviourLog.findById(log._id).populate(behaviourPopulation);
  res.status(201).json(populatedLog);
});

export const updateBehaviourLog = asyncHandler(async (req, res) => {
  const log = await BehaviourLog.findById(req.params.id);

  if (!log) {
    res.status(404);
    throw new Error("Behaviour log not found.");
  }

  const updatedLog = await BehaviourLog.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      recordedBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(behaviourPopulation);

  res.json(updatedLog);
});

export const deleteBehaviourLog = asyncHandler(async (req, res) => {
  const log = await BehaviourLog.findById(req.params.id);

  if (!log) {
    res.status(404);
    throw new Error("Behaviour log not found.");
  }

  await log.deleteOne();
  res.json({ message: "Behaviour log deleted successfully." });
});
