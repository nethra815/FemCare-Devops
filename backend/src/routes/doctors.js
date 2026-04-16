import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"
import Doctor from "../models/Doctor.js"
import DoctorSchedule from "../models/DoctorSchedule.js"
import User from "../models/User.js"

const router = express.Router()

router.get("/", async (req, res, next) => {
  try {
    const { specialization, location, available_date, includeUnapproved } = req.query
    const filter = {}
    
    // Only show approved doctors by default, unless includeUnapproved is true
    if (includeUnapproved !== "true") {
      filter.is_approved = true
    }

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" }
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" }
    }

    const doctors = await Doctor.find(filter)

    const doctorsWithDetails = await Promise.all(
      doctors.map(async (doctor) => {
        const user = await User.findOne({ userId: doctor.doctorId }).select("-password")
        const schedules = await DoctorSchedule.find({
          doctor_id: doctor.doctorId,
          is_booked: false,
        })

        let availableSlots = schedules.length

        if (available_date) {
          const targetDate = new Date(available_date)
          availableSlots = schedules.filter((s) => {
            const scheduleDate = new Date(s.date)
            return (
              scheduleDate.getFullYear() === targetDate.getFullYear() &&
              scheduleDate.getMonth() === targetDate.getMonth() &&
              scheduleDate.getDate() === targetDate.getDate()
            )
          }).length
        }

        return {
          ...doctor.toObject(),
          user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
          available_slots: availableSlots,
        }
      }),
    )

    res.json(doctorsWithDetails)
  } catch (error) {
    next(error)
  }
})

router.get("/:id", async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ doctorId: req.params.id })
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" })
    }

    const user = await User.findOne({ userId: doctor.doctorId }).select("-password")

    res.json({
      ...doctor.toObject(),
      user,
    })
  } catch (error) {
    next(error)
  }
})

router.get("/:id/schedule", async (req, res, next) => {
  try {
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ error: "Date parameter required" })
    }

    const targetDate = new Date(date)
    const startDate = new Date(targetDate)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(targetDate)
    endDate.setHours(23, 59, 59, 999)

    const schedules = await DoctorSchedule.find({
      doctor_id: req.params.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ start_time: 1 })

    res.json(schedules)
  } catch (error) {
    next(error)
  }
})

router.get("/:id/availability", async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "Start and end date required" })
    }

    const startDate = new Date(start_date)
    const endDate = new Date(end_date)

    const schedules = await DoctorSchedule.find({
      doctor_id: req.params.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1, start_time: 1 })

    const availability = {}
    schedules.forEach((schedule) => {
      const dateKey = schedule.date.toISOString().split("T")[0]
      if (!availability[dateKey]) {
        availability[dateKey] = []
      }
      availability[dateKey].push({
        time: schedule.start_time,
        available: !schedule.is_booked,
      })
    })

    res.json(availability)
  } catch (error) {
    next(error)
  }
})

router.post("/:id/schedule", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    const { date, start_time, end_time } = req.body

    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (!date || !start_time || !end_time) {
      return res.status(400).json({ error: "Date, start_time, and end_time required" })
    }

    const existingSchedule = await DoctorSchedule.findOne({
      doctor_id: req.params.id,
      date: new Date(date),
      start_time,
    })

    if (existingSchedule) {
      return res.status(409).json({ error: "Schedule slot already exists" })
    }

    const schedule = new DoctorSchedule({
      doctor_id: req.params.id,
      date: new Date(date),
      start_time,
      end_time,
      is_booked: false,
    })

    await schedule.save()
    res.status(201).json(schedule)
  } catch (error) {
    next(error)
  }
})

router.post("/:id/schedule/bulk", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    const { schedules } = req.body

    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ error: "Schedules array required" })
    }

    const createdSchedules = []
    for (const schedule of schedules) {
      const { date, start_time, end_time } = schedule

      if (!date || !start_time || !end_time) {
        continue
      }

      const existingSchedule = await DoctorSchedule.findOne({
        doctor_id: req.params.id,
        date: new Date(date),
        start_time,
      })

      if (!existingSchedule) {
        const newSchedule = new DoctorSchedule({
          doctor_id: req.params.id,
          date: new Date(date),
          start_time,
          end_time,
          is_booked: false,
        })
        await newSchedule.save()
        createdSchedules.push(newSchedule)
      }
    }

    res.status(201).json({
      message: `${createdSchedules.length} schedules created`,
      schedules: createdSchedules,
    })
  } catch (error) {
    next(error)
  }
})

router.delete("/:id/schedule/:scheduleId", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const schedule = await DoctorSchedule.findByIdAndDelete(req.params.scheduleId)

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" })
    }

    res.json({ message: "Schedule deleted" })
  } catch (error) {
    next(error)
  }
})

router.patch("/:id", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { specialization, experience, location } = req.body

    const doctor = await Doctor.findOneAndUpdate(
      { doctorId: req.params.id },
      {
        specialization,
        experience,
        location,
      },
      { new: true },
    )

    res.json(doctor)
  } catch (error) {
    next(error)
  }
})

export default router
