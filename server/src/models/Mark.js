import mongoose from "mongoose";

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    examType: {
      type: String,
      enum: ["Quiz", "Assignment", "Midterm", "Final"],
      required: true,
    },
    term: {
      type: String,
      default: "2026 Semester Review",
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Mark = mongoose.model("Mark", markSchema);

export default Mark;
