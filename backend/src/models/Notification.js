import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["appointment_booked", "appointment_cancelled", "appointment_completed", "doctor_approved", "cycle_reminder"],
  },
  message: {
    type: String,
    required: true,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
})

// Methods
notificationSchema.methods.sendNotification = async function() {
  // In a real app, this would send push notification, email, etc.
  return {
    notificationId: this.notificationId,
    userId: this.userId,
    message: this.message,
    sent: true
  }
}

export default mongoose.model("Notification", notificationSchema)
