import express from "express";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../controllers/studentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getStudents)
  .post(authorize("Admin", "Teacher"), createStudent);

router
  .route("/:id")
  .get(getStudentById)
  .put(authorize("Admin", "Teacher"), updateStudent)
  .delete(authorize("Admin", "Teacher"), deleteStudent);

export default router;
