import express from "express";
import { getProfile, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

export default router;
