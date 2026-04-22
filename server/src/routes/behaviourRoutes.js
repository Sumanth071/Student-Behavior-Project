import express from "express";
import {
  createBehaviourLog,
  deleteBehaviourLog,
  getBehaviourLogs,
  getStudentBehaviourReport,
  updateBehaviourLog,
} from "../controllers/behaviourController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/student/:studentId", getStudentBehaviourReport);

router
  .route("/")
  .get(getBehaviourLogs)
  .post(authorize("Admin", "Teacher"), createBehaviourLog);

router
  .route("/:id")
  .put(authorize("Admin", "Teacher"), updateBehaviourLog)
  .delete(authorize("Admin", "Teacher"), deleteBehaviourLog);

export default router;
