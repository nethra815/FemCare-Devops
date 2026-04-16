import express from "express"
import { authenticate } from "../middleware/auth.js"
import Notification from "../models/Notification.js"

const router = express.Router()

router.get("/", authenticate, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId }).sort({ created_at: -1 })
    res.json(notifications)
  } catch (error) {
    next(error)
  }
})

router.patch("/:id/read", authenticate, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { notificationId: req.params.id },
      { is_read: true },
      { new: true },
    )

    res.json(notification)
  } catch (error) {
    next(error)
  }
})

export default router
