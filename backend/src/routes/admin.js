import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"
import User from "../models/User.js"
import Doctor from "../models/Doctor.js"
import Administrator from "../models/Administrator.js"
import Notification from "../models/Notification.js"

const router = express.Router()

router.post("/doctors", authenticate, authorize("admin", "doctor"), async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, experience, location } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" })
    }

    const doctor = new Doctor({
      name,
      email,
      password,
      phone,
      role: "doctor",
      doctorId: null,
      specialization,
      experience,
      location,
      is_approved: false,
    })

    await doctor.save()
    
    doctor.doctorId = doctor.userId
    await doctor.save()

    res.status(201).json({ user: doctor, doctor })
  } catch (error) {
    next(error)
  }
})

router.patch("/doctors/:id/approve", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate({ doctorId: req.params.id }, { is_approved: true }, { new: true })

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" })
    }

    await Notification.create({
      userId: req.params.id,
      type: "doctor_approved",
      message: "Your doctor profile has been approved",
    })

    res.json(doctor)
  } catch (error) {
    next(error)
  }
})

export default router
