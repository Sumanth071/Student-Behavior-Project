import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    mentorName: {
      type: String,
      default: "",
      trim: true,
    },
    parentName: {
      type: String,
      default: "",
      trim: true,
    },
    parentPhone: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Active", "At Risk", "On Leave"],
      default: "Active",
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    studentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
