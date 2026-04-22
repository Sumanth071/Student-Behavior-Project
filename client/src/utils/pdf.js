import { formatDate, formatPercent } from "./format.js";

export const exportStudentReportToPDF = async (report) => {
  if (!report?.student) {
    return;
  }

  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const { student, records } = report;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Student Behaviour Analysis Report", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Name: ${student.fullName}`, 14, 30);
  doc.text(`Admission No: ${student.admissionNo}`, 14, 37);
  doc.text(`Department: ${student.department}`, 14, 44);
  doc.text(`Semester / Section: ${student.semester} / ${student.section}`, 14, 51);
  doc.text(`Behaviour Score: ${student.behaviourScore}`, 14, 58);
  doc.text(`Risk Level: ${student.riskLevel}`, 14, 65);

  autoTable(doc, {
    startY: 74,
    head: [["Metric", "Value"]],
    body: [
      ["Attendance Rate", formatPercent(student.attendanceRate)],
      ["Average Marks", formatPercent(student.averageMark)],
      ["Participation", formatPercent(student.participation)],
      ["Discipline", formatPercent(student.discipline)],
      ["Assignment Submission", formatPercent(student.assignmentRate)],
    ],
    theme: "grid",
    headStyles: { fillColor: [8, 145, 178] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Insights", "Suggestions"]],
    body: [
      [
        student.insights?.join(" | ") || "No insights available",
        student.suggestions?.join(" | ") || "No suggestions available",
      ],
    ],
    styles: { cellWidth: "wrap", fontSize: 10 },
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Date", "Subject", "Status"]],
    body:
      records?.attendance?.slice(0, 8).map((entry) => [
        formatDate(entry.date),
        entry.subject,
        entry.status,
      ]) || [],
    theme: "grid",
    headStyles: { fillColor: [34, 197, 94] },
  });

  const filename = `${student.fullName.replace(/\s+/g, "-").toLowerCase()}-report.pdf`;
  doc.save(filename);
};
