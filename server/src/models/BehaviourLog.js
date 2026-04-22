import mongoose from "mongoose";

const behaviourLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    participation: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    discipline: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    assignmentSubmitted: {
      type: Number,
      required: true,
      min: 0,
    },
    assignmentTotal: {
      type: Number,
      required: true,
      min: 1,
    },
    incidentSeverity: {
      type: String,
      enum: ["None", "Low", "Medium", "High"],
      default: "None",
    },
    observation: {
      type: String,
      default: "",
      trim: true,
    },
    counselorNote: {
      type: String,
      default: "",
      trim: true,
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

const BehaviourLog = mongoose.model("BehaviourLog", behaviourLogSchema);

export default BehaviourLog;
