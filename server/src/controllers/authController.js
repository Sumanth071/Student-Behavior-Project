import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const shapeUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  linkedStudent: user.linkedStudent,
  isActive: user.isActive,
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+password")
    .populate("linkedStudent", "fullName admissionNo department semester section");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.json({
    message: "Login successful.",
    token: generateToken(user._id),
    user: shapeUserResponse(user),
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    user: shapeUserResponse(req.user),
  });
});
