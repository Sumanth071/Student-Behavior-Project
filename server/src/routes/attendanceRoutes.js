import express from "express";
import {
  createAttendanceRecord,
  deleteAttendanceRecord,
  getAttendanceRecords,
  updateAttendanceRecord,
} from "../controllers/attendanceController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getAttendanceRecords)
  .post(authorize("Admin", "Teacher"), createAttendanceRecord);

router
  .route("/:id")
  .put(authorize("Admin", "Teacher"), updateAttendanceRecord)
  .delete(authorize("Admin", "Teacher"), deleteAttendanceRecord);

export default router;
