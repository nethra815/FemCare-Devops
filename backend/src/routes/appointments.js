import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"
import Appointment from "../models/Appointment.js"
import DoctorSchedule from "../models/DoctorSchedule.js"
import Doctor from "../models/Doctor.js"
import User from "../models/User.js"
import Notification from "../models/Notification.js"

const router = express.Router()

router.post("/", authenticate, authorize("patient"), async (req, res, next) => {
  try {
    const { doctorId, date, time } = req.body

    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: "Doctor ID, date, and time required" })
    }

    // Validation: Cannot book appointments in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      return res.status(400).json({ error: "Cannot book appointments for past dates" })
    }

    const doctor = await Doctor.findOne({ doctorId })
    if (!doctor || !doctor.is_approved) {
      return res.status(400).json({ error: "Doctor not available or not approved" })
    }

    const targetDate = new Date(date)
    const schedule = await DoctorSchedule.findOne({
      doctor_id: doctorId,
      date: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
      start_time: time,
      is_booked: false,
    })

    if (!schedule) {
      return res.status(409).json({ error: "Slot not available or already booked" })
    }

    const patientConflict = await Appointment.findOne({
      patientId: req.user.userId,
      date: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
      time,
      status: { $ne: "Cancelled" },
    })

    if (patientConflict) {
      return res.status(409).json({ error: "You already have an appointment at this time" })
    }

    const doctorConflict = await Appointment.findOne({
      doctorId,
      date: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
      time,
      status: { $ne: "Cancelled" },
    })

    if (doctorConflict) {
      return res.status(409).json({ error: "Doctor is not available at this time" })
    }

    const appointment = new Appointment({
      patientId: req.user.userId,
      doctorId,
      date: new Date(date),
      time,
      status: "Scheduled",
    })

    await appointment.save()

    schedule.is_booked = true
    await schedule.save()

    const doctorUser = await User.findOne({ userId: doctorId })
    const patientUser = await User.findOne({ userId: req.user.userId })

    await Notification.create([
      {
        userId: req.user.userId,
        type: "appointment_booked",
        message: `Appointment booked with Dr. ${doctorUser.name} on ${new Date(date).toLocaleDateString()} at ${time}`,
      },
      {
        userId: doctorId,
        type: "appointment_booked",
        message: `New appointment with ${patientUser.name} on ${new Date(date).toLocaleDateString()} at ${time}`,
      },
    ])

    res.status(201).json({
      appointment,
      message: "Appointment booked successfully",
    })
  } catch (error) {
    next(error)
  }
})

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { patientId, doctorId, status, past_or_upcoming } = req.query
    const filter = {}

    if (patientId && patientId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (doctorId && doctorId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (patientId) filter.patientId = patientId
    if (doctorId) filter.doctorId = doctorId
    if (status) filter.status = status

    if (past_or_upcoming === "upcoming") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filter.date = { $gte: today }
    } else if (past_or_upcoming === "past") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filter.date = { $lt: today }
    }

    const appointments = await Appointment.find(filter).sort({ date: -1 })

    const enrichedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        const doctor = await User.findOne({ userId: apt.doctorId }).select("-password")
        const patient = await User.findOne({ userId: apt.patientId }).select("-password")

        return {
          ...apt.toObject(),
          doctor_info: doctor,
          patient_info: patient,
        }
      }),
    )

    res.json(enrichedAppointments)
  } catch (error) {
    next(error)
  }
})

router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ appointmentId: req.params.id })

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    if (
      appointment.patientId !== req.user.userId &&
      appointment.doctorId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const doctor = await User.findOne({ userId: appointment.doctorId }).select("-password")
    const patient = await User.findOne({ userId: appointment.patientId }).select("-password")

    res.json({
      ...appointment.toObject(),
      doctor_info: doctor,
      patient_info: patient,
    })
  } catch (error) {
    next(error)
  }
})

router.patch("/:id/cancel", authenticate, async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ appointmentId: req.params.id })

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    if (appointment.patientId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (appointment.status === "Cancelled") {
      return res.status(400).json({ error: "Appointment is already cancelled" })
    }

    if (appointment.status === "Completed") {
      return res.status(400).json({ error: "Cannot cancel a completed appointment" })
    }

    appointment.status = "Cancelled"
    await appointment.save()

    const targetDate = new Date(appointment.date)
    await DoctorSchedule.findOneAndUpdate(
      {
        doctor_id: appointment.doctorId,
        date: {
          $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
        start_time: appointment.time,
      },
      { is_booked: false },
    )

    const doctorUser = await User.findOne({ userId: appointment.doctorId })
    const patientUser = await User.findOne({ userId: appointment.patientId })

    await Notification.create([
      {
        userId: appointment.doctorId,
        type: "appointment_cancelled",
        message: `Appointment with ${patientUser.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been cancelled`,
      },
      {
        userId: appointment.patientId,
        type: "appointment_cancelled",
        message: `Your appointment with Dr. ${doctorUser.name} has been cancelled`,
      },
    ])

    res.json({
      appointment,
      message: "Appointment cancelled successfully",
    })
  } catch (error) {
    next(error)
  }
})

router.patch("/:id/status", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    const { status } = req.body

    if (!["Scheduled", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const appointment = await Appointment.findOne({ appointmentId: req.params.id })

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    if (appointment.doctorId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    appointment.status = status
    await appointment.save()

    const statusMessage = status === "Completed" ? "completed" : "cancelled"

    await Notification.create({
      userId: appointment.patientId,
      type: `appointment_${statusMessage}`,
      message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} has been ${statusMessage}`,
    })

    res.json({
      appointment,
      message: `Appointment status updated to ${status}`,
    })
  } catch (error) {
    next(error)
  }
})

router.patch("/:id/notes", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    const { notes } = req.body

    const appointment = await Appointment.findOne({ appointmentId: req.params.id })

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    if (appointment.doctorId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    appointment.notes = notes
    await appointment.save()

    res.json(appointment)
  } catch (error) {
    next(error)
  }
})

router.patch("/:id/reschedule", authenticate, async (req, res, next) => {
  try {
    const { new_date, new_time } = req.body

    if (!new_date || !new_time) {
      return res.status(400).json({ error: "New date and time required" })
    }

    // Validation: Cannot reschedule to past dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(new_date)
    selectedDate.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      return res.status(400).json({ error: "Cannot reschedule to past dates" })
    }

    const appointment = await Appointment.findOne({ appointmentId: req.params.id })

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    if (appointment.patientId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (appointment.status !== "Scheduled") {
      return res.status(400).json({ error: "Can only reschedule scheduled appointments" })
    }

    const targetDate = new Date(new_date)
    const newSchedule = await DoctorSchedule.findOne({
      doctor_id: appointment.doctorId,
      date: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
      start_time: new_time,
      is_booked: false,
    })

    if (!newSchedule) {
      return res.status(409).json({ error: "New slot not available" })
    }

    const oldTargetDate = new Date(appointment.date)
    await DoctorSchedule.findOneAndUpdate(
      {
        doctor_id: appointment.doctorId,
        date: {
          $gte: new Date(oldTargetDate.setHours(0, 0, 0, 0)),
          $lt: new Date(oldTargetDate.setHours(23, 59, 59, 999)),
        },
        start_time: appointment.time,
      },
      { is_booked: false },
    )

    appointment.date = new Date(new_date)
    appointment.time = new_time
    await appointment.save()

    newSchedule.is_booked = true
    await newSchedule.save()

    await Notification.create({
      userId: appointment.doctorId,
      type: "appointment_booked",
      message: `Appointment rescheduled to ${new Date(new_date).toLocaleDateString()} at ${new_time}`,
    })

    res.json({
      appointment,
      message: "Appointment rescheduled successfully",
    })
  } catch (error) {
    next(error)
  }
})

export default router
