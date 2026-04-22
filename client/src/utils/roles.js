import {
  BarChart3,
  BellRing,
  BookCheck,
  BrainCircuit,
  GraduationCap,
  LayoutDashboard,
  Users,
} from "lucide-react";

export const managerRoles = ["Admin", "Teacher"];

export const isManagerRole = (role) => managerRoles.includes(role);

const navigationConfig = {
  Admin: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/attendance", label: "Attendance", icon: BookCheck },
    { to: "/marks", label: "Marks", icon: GraduationCap },
    { to: "/behaviour", label: "Behaviour", icon: BrainCircuit },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: BellRing },
  ],
  Teacher: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/attendance", label: "Attendance", icon: BookCheck },
    { to: "/marks", label: "Marks", icon: GraduationCap },
    { to: "/behaviour", label: "Behaviour", icon: BrainCircuit },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: BellRing },
  ],
  Student: [
    { to: "/", label: "My Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "My Profile", icon: Users },
    { to: "/attendance", label: "My Attendance", icon: BookCheck },
    { to: "/marks", label: "My Marks", icon: GraduationCap },
    { to: "/behaviour", label: "My Behaviour", icon: BrainCircuit },
    { to: "/reports", label: "My Reports", icon: BarChart3 },
    { to: "/notifications", label: "My Alerts", icon: BellRing },
  ],
  Parent: [
    { to: "/", label: "Parent Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Child Profile", icon: Users },
    { to: "/attendance", label: "Child Attendance", icon: BookCheck },
    { to: "/marks", label: "Child Marks", icon: GraduationCap },
    { to: "/behaviour", label: "Behaviour Review", icon: BrainCircuit },
    { to: "/reports", label: "Child Reports", icon: BarChart3 },
    { to: "/notifications", label: "Parent Alerts", icon: BellRing },
  ],
};

export const getNavigationForRole = (role) =>
  navigationConfig[role] || navigationConfig.Student;

const pageCopy = {
  "/": {
    manager: {
      title: "AI Behaviour Dashboard",
      description:
        "Monitor behaviour score, risk trends, and academic health in one place.",
    },
    Student: {
      title: "My Behaviour Dashboard",
      description:
        "Review your academic progress, behaviour score, and improvement insights.",
    },
    Parent: {
      title: "Parent Monitoring Dashboard",
      description:
        "Track your child’s performance, behaviour risk, and recent alerts.",
    },
  },
  "/students": {
    manager: {
      title: "Student Management",
      description: "Manage student profiles, sections, and behaviour insights.",
    },
    Student: {
      title: "My Student Profile",
      description:
        "View your profile, academic status, and personalized behaviour insights.",
    },
    Parent: {
      title: "Student Profile Overview",
      description:
        "Review your child’s profile, class details, and current academic standing.",
    },
  },
  "/attendance": {
    manager: {
      title: "Attendance Management",
      description: "Track attendance patterns that influence behavioural risk.",
    },
    Student: {
      title: "My Attendance Overview",
      description:
        "Follow your attendance trend and identify where consistency can improve.",
    },
    Parent: {
      title: "Child Attendance Overview",
      description:
        "Check your child’s attendance history and identify early warning signals.",
    },
  },
  "/marks": {
    manager: {
      title: "Marks Management",
      description: "Record academic performance and compare subject-level progress.",
    },
    Student: {
      title: "My Marks Overview",
      description:
        "See your scores across subjects and understand how they affect your behaviour score.",
    },
    Parent: {
      title: "Child Marks Overview",
      description:
        "Review your child’s academic scores and identify subject-level support needs.",
    },
  },
  "/behaviour": {
    manager: {
      title: "Behaviour Tracking",
      description: "Review participation, discipline, and assignment behaviour logs.",
    },
    Student: {
      title: "My Behaviour Review",
      description:
        "Understand your participation, discipline, and submission patterns over time.",
    },
    Parent: {
      title: "Child Behaviour Review",
      description:
        "Monitor behaviour observations and follow the recommended support actions.",
    },
  },
  "/reports": {
    manager: {
      title: "Reports and Analytics",
      description: "Export professional student reports and presentation-ready analytics.",
    },
    Student: {
      title: "My Reports and Analytics",
      description:
        "Download your report and review the metrics that shape your overall score.",
    },
    Parent: {
      title: "Parent Reports and Analytics",
      description:
        "Download your child’s report and review the insights prepared for parent follow-up.",
    },
  },
  "/notifications": {
    manager: {
      title: "Notifications and Alerts",
      description: "Surface urgent student updates and targeted dashboard alerts.",
    },
    Student: {
      title: "My Notifications",
      description:
        "Stay updated with alerts, appreciation notes, and academic reminders.",
    },
    Parent: {
      title: "Parent Notifications",
      description:
        "Review alerts and follow-up messages related to your child’s progress.",
    },
  },
};

export const getPageCopyForRole = (pathname, role) => {
  const entry = pageCopy[pathname] || pageCopy["/"];

  if (isManagerRole(role)) {
    return entry.manager;
  }

  return entry[role] || entry.Student || entry.manager;
};
