export const demoAccounts = [
  {
    label: "Admin",
    email: "admin@campusai.edu",
    password: "password123",
    note: "Full access to every module and analytics report.",
  },
  {
    label: "Teacher",
    email: "teacher@campusai.edu",
    password: "password123",
    note: "Can manage students, attendance, marks, behaviour, and alerts.",
  },
  {
    label: "Student",
    email: "student@campusai.edu",
    password: "password123",
    note: "View personal progress, score, insights, and reports.",
  },
  {
    label: "Parent",
    email: "parent@campusai.edu",
    password: "password123",
    note: "Track the linked student’s behaviour score and notifications.",
  },
];

export const audienceRoleOptions = ["Admin", "Teacher", "Student", "Parent"];

export const studentStatusOptions = ["Active", "At Risk", "On Leave"];

export const attendanceStatusOptions = ["Present", "Absent", "Late", "Excused"];

export const examTypeOptions = ["Quiz", "Assignment", "Midterm", "Final"];

export const incidentSeverityOptions = ["None", "Low", "Medium", "High"];
