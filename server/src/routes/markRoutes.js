import express from "express";
import {
  createMark,
  deleteMark,
  getMarks,
  updateMark,
} from "../controllers/markController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getMarks)
  .post(authorize("Admin", "Teacher"), createMark);

router
  .route("/:id")
  .put(authorize("Admin", "Teacher"), updateMark)
  .delete(authorize("Admin", "Teacher"), deleteMark);

export default router;
