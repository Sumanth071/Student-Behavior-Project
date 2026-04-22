import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isPrivilegedUser } from "../utils/accessScope.js";

const notificationPopulation = [
  { path: "student", select: "fullName admissionNo department semester section" },
  { path: "createdBy", select: "name role" },
];

export const getNotifications = asyncHandler(async (req, res) => {
  const query = isPrivilegedUser(req.user.role)
    ? {}
    : {
        audienceRoles: { $in: [req.user.role] },
        isActive: true,
      };

  const notifications = await Notification.find(query)
    .populate(notificationPopulation)
    .sort({ createdAt: -1 });

  res.json(notifications);
});

export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, type, audienceRoles, student, isActive, actionLabel } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error("Title and message are required.");
  }

  const notification = await Notification.create({
    title,
    message,
    type,
    audienceRoles,
    student,
    isActive,
    actionLabel,
    createdBy: req.user._id,
  });

  const populatedNotification = await Notification.findById(notification._id).populate(
    notificationPopulation,
  );
  res.status(201).json(populatedNotification);
});

export const updateNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  const updatedNotification = await Notification.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      createdBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate(notificationPopulation);

  res.json(updatedNotification);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  await notification.deleteOne();
  res.json({ message: "Notification deleted successfully." });
});
