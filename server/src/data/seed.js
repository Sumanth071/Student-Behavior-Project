import dotenv from "dotenv";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import BehaviourLog from "../models/BehaviourLog.js";
import Mark from "../models/Mark.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const daysAgo = (days) => {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
};

const studentSeeds = [
  {
    admissionNo: "CSE23001",
    fullName: "Aarav Sharma",
    email: "aarav.sharma@campus.edu",
    department: "Computer Science",
    semester: 6,
    section: "A",
    mentorName: "Dr. Meera Joshi",
    parentName: "Rohan Sharma",
    parentPhone: "9876543210",
    gender: "Male",
    status: "Active",
    address: "Pune, Maharashtra",
  },
  {
    admissionNo: "CSE23002",
    fullName: "Nisha Verma",
    email: "nisha.verma@campus.edu",
    department: "Computer Science",
    semester: 6,
    section: "A",
    mentorName: "Dr. Meera Joshi",
    parentName: "Sunita Verma",
    parentPhone: "9823045671",
    gender: "Female",
    status: "Active",
    address: "Nagpur, Maharashtra",
  },
  {
    admissionNo: "ECE23003",
    fullName: "Karan Patel",
    email: "karan.patel@campus.edu",
    department: "Electronics",
    semester: 4,
    section: "B",
    mentorName: "Prof. Anand Kulkarni",
    parentName: "Ritu Patel",
    parentPhone: "9811155511",
    gender: "Male",
    status: "Active",
    address: "Ahmedabad, Gujarat",
  },
  {
    admissionNo: "ECE23004",
    fullName: "Sara Khan",
    email: "sara.khan@campus.edu",
    department: "Electronics",
    semester: 4,
    section: "B",
    mentorName: "Prof. Anand Kulkarni",
    parentName: "Imran Khan",
    parentPhone: "9800044400",
    gender: "Female",
    status: "At Risk",
    address: "Bhopal, Madhya Pradesh",
  },
  {
    admissionNo: "BBA23005",
    fullName: "Ishaan Roy",
    email: "ishaan.roy@campus.edu",
    department: "Business Analytics",
    semester: 2,
    section: "C",
    mentorName: "Dr. Kavya Sen",
    parentName: "Mitali Roy",
    parentPhone: "9797979797",
    gender: "Male",
    status: "Active",
    address: "Kolkata, West Bengal",
  },
  {
    admissionNo: "BBA23006",
    fullName: "Pooja Nair",
    email: "pooja.nair@campus.edu",
    department: "Business Analytics",
    semester: 2,
    section: "C",
    mentorName: "Dr. Kavya Sen",
    parentName: "Suresh Nair",
    parentPhone: "9787878787",
    gender: "Female",
    status: "At Risk",
    address: "Kochi, Kerala",
  },
];

const studentProfiles = [
  {
    subjects: ["AI", "DBMS", "Cloud"],
    attendance: ["Present", "Present", "Late", "Present", "Present", "Present", "Present", "Excused"],
    marks: [88, 92, 85],
    participation: [90, 94],
    discipline: [89, 92],
    assignments: [
      [5, 5],
      [4, 5],
    ],
    severity: ["None", "None"],
    observations: [
      "Shows leadership during collaborative lab activities.",
      "Maintains strong attendance and responds well to advanced tasks.",
    ],
  },
  {
    subjects: ["AI", "DBMS", "Networks"],
    attendance: ["Present", "Present", "Present", "Late", "Present", "Absent", "Present", "Present"],
    marks: [78, 74, 80],
    participation: [76, 72],
    discipline: [82, 84],
    assignments: [
      [4, 5],
      [5, 5],
    ],
    severity: ["Low", "None"],
    observations: [
      "Needs a little more confidence during technical presentations.",
      "Good potential with occasional gaps in classroom interaction.",
    ],
  },
  {
    subjects: ["Signals", "Microcontrollers", "Circuits"],
    attendance: ["Present", "Late", "Present", "Present", "Present", "Present", "Late", "Present"],
    marks: [71, 69, 75],
    participation: [68, 70],
    discipline: [79, 76],
    assignments: [
      [3, 4],
      [4, 5],
    ],
    severity: ["Low", "Low"],
    observations: [
      "Practical understanding is good, but theory revision needs consistency.",
      "Shows improvement when given structured follow-up tasks.",
    ],
  },
  {
    subjects: ["Signals", "Microcontrollers", "Digital Systems"],
    attendance: ["Absent", "Late", "Present", "Absent", "Present", "Late", "Absent", "Present"],
    marks: [58, 61, 55],
    participation: [54, 58],
    discipline: [66, 62],
    assignments: [
      [2, 4],
      [2, 5],
    ],
    severity: ["Medium", "High"],
    observations: [
      "Requires close monitoring after repeated late arrivals and missed submissions.",
      "Needs a mentor-parent intervention plan to stabilize progress.",
    ],
  },
  {
    subjects: ["Business Stats", "Excel Analytics", "Economics"],
    attendance: ["Present", "Present", "Present", "Present", "Late", "Present", "Present", "Present"],
    marks: [82, 79, 84],
    participation: [80, 85],
    discipline: [86, 88],
    assignments: [
      [4, 5],
      [5, 5],
    ],
    severity: ["None", "None"],
    observations: [
      "Participates well in group case studies and completes tasks on time.",
      "Maintains a steady upward trend in academic consistency.",
    ],
  },
  {
    subjects: ["Business Stats", "Excel Analytics", "Communication"],
    attendance: ["Absent", "Present", "Late", "Absent", "Present", "Absent", "Late", "Present"],
    marks: [49, 57, 53],
    participation: [51, 56],
    discipline: [60, 58],
    assignments: [
      [2, 4],
      [1, 5],
    ],
    severity: ["Medium", "High"],
    observations: [
      "Low assignment completion is affecting confidence and classroom readiness.",
      "Requires weekly review meetings and deadline reminders.",
    ],
  },
];

const teacherName = "Dr. Meera Joshi";

export const seedDatabase = async ({ reset = true, silent = false } = {}) => {
  if (reset) {
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Attendance.deleteMany({}),
      Mark.deleteMany({}),
      BehaviourLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);
  }

  const students = await Student.insertMany(studentSeeds);

  const adminUser = await User.create({
    name: "System Administrator",
    email: "admin@campusai.edu",
    password: "password123",
    role: "Admin",
    department: "Administration",
  });

  const teacherUser = await User.create({
    name: teacherName,
    email: "teacher@campusai.edu",
    password: "password123",
    role: "Teacher",
    department: "Computer Science",
  });

  const studentUser = await User.create({
    name: students[0].fullName,
    email: "student@campusai.edu",
    password: "password123",
    role: "Student",
    department: students[0].department,
    linkedStudent: students[0]._id,
  });

  const parentUser = await User.create({
    name: students[0].parentName,
    email: "parent@campusai.edu",
    password: "password123",
    role: "Parent",
    department: students[0].department,
    linkedStudent: students[0]._id,
  });

  await Student.findByIdAndUpdate(students[0]._id, { studentUser: studentUser._id });

  const attendanceEntries = students.flatMap((student, index) =>
    studentProfiles[index].attendance.map((status, dayIndex) => ({
      student: student._id,
      date: daysAgo(dayIndex),
      subject: studentProfiles[index].subjects[dayIndex % studentProfiles[index].subjects.length],
      status,
      recordedBy: teacherUser._id,
    })),
  );

  const markEntries = students.flatMap((student, index) =>
    studentProfiles[index].marks.map((marksObtained, scoreIndex) => ({
      student: student._id,
      subject: studentProfiles[index].subjects[scoreIndex],
      examType: ["Quiz", "Assignment", "Midterm"][scoreIndex],
      term: "2026 Semester Review",
      marksObtained,
      totalMarks: 100,
      recordedBy: teacherUser._id,
    })),
  );

  const behaviourEntries = students.flatMap((student, index) =>
    studentProfiles[index].participation.map((participation, logIndex) => ({
      student: student._id,
      date: daysAgo(logIndex * 5 + 1),
      participation,
      discipline: studentProfiles[index].discipline[logIndex],
      assignmentSubmitted: studentProfiles[index].assignments[logIndex][0],
      assignmentTotal: studentProfiles[index].assignments[logIndex][1],
      incidentSeverity: studentProfiles[index].severity[logIndex],
      observation: studentProfiles[index].observations[logIndex],
      counselorNote:
        studentProfiles[index].severity[logIndex] === "High"
          ? "Needs immediate mentor-parent review."
          : "Continue regular monitoring and feedback.",
      recordedBy: teacherUser._id,
    })),
  );

  await Attendance.insertMany(attendanceEntries);
  await Mark.insertMany(markEntries);
  await BehaviourLog.insertMany(behaviourEntries);

  await Notification.insertMany([
    {
      title: "High Risk Behaviour Alert",
      message: "Sara Khan requires a mentoring review because her behaviour score has dropped into the high-risk zone.",
      type: "critical",
      audienceRoles: ["Admin", "Teacher"],
      student: students[3]._id,
      actionLabel: "Open Report",
      createdBy: adminUser._id,
    },
    {
      title: "Assignment Delay Warning",
      message: "Pooja Nair has missed multiple assignment checkpoints this month.",
      type: "warning",
      audienceRoles: ["Admin", "Teacher", "Parent"],
      student: students[5]._id,
      actionLabel: "Review Assignments",
      createdBy: teacherUser._id,
    },
    {
      title: "Excellent Performance",
      message: "Aarav Sharma has maintained strong attendance, marks, and engagement across recent reviews.",
      type: "success",
      audienceRoles: ["Admin", "Teacher", "Student", "Parent"],
      student: students[0]._id,
      actionLabel: "View Profile",
      createdBy: teacherUser._id,
    },
    {
      title: "Attendance Improvement Needed",
      message: "Karan Patel should be monitored for recurring late attendance before it affects performance further.",
      type: "info",
      audienceRoles: ["Teacher", "Admin"],
      student: students[2]._id,
      actionLabel: "Track Attendance",
      createdBy: teacherUser._id,
    },
  ]);

  if (!silent) {
    console.log("Seed data inserted successfully.");
    console.log("Demo credentials:");
    console.log("Admin: admin@campusai.edu / password123");
    console.log("Teacher: teacher@campusai.edu / password123");
    console.log("Student: student@campusai.edu / password123");
    console.log("Parent: parent@campusai.edu / password123");
  }

  return {
    students: students.length,
    users: 4,
    createdBy: [adminUser._id, teacherUser._id, studentUser._id, parentUser._id],
  };
};

const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[1]?.includes("seed.js")) {
  runSeed();
}
