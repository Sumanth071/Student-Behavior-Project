import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. Token missing.");
  }

  res.status(401);
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId)
    .populate("linkedStudent", "fullName admissionNo department semester section")
    .select("-password");

  if (!user) {
    res.status(401);
    throw new Error("Not authorized. User not found.");
  }

  req.user = user;
  res.status(200);
  next();
});

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error("You do not have permission to perform this action.");
  }

  next();
};
