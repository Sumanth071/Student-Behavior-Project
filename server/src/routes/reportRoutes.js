import express from "express";
import {
  getAnalytics,
  getStudentReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/analytics", getAnalytics);
router.get("/students/:studentId", getStudentReport);

export default router;
