import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  notes: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
})

// Methods
appointmentSchema.methods.viewAppointment = function() {
  return {
    appointmentId: this.appointmentId,
    patientId: this.patientId,
    doctorId: this.doctorId,
    date: this.date,
    time: this.time,
    status: this.status
  }
}

appointmentSchema.methods.cancelAppointment = async function() {
  this.status = "Cancelled"
  return this.save()
}

export default mongoose.model("Appointment", appointmentSchema)
