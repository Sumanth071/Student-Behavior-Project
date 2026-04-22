import express from "express";
import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from "../controllers/notificationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getNotifications)
  .post(authorize("Admin", "Teacher"), createNotification);

router
  .route("/:id")
  .put(authorize("Admin", "Teacher"), updateNotification)
  .delete(authorize("Admin", "Teacher"), deleteNotification);

export default router;
