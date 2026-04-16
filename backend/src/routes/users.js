import express from "express"
import { authenticate } from "../middleware/auth.js"
import User from "../models/User.js"
import Patient from "../models/Patient.js"
import Doctor from "../models/Doctor.js"
import { validatePhone, validateAge, validateHeight, validateWeight } from "../utils/validation.js"

const router = express.Router()

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    let profile = { ...user.toObject() }

    if (user.role === "patient") {
      const patient = await Patient.findOne({ patientId: user.userId })
      if (patient) {
        profile = { ...profile, ...patient.toObject() }
      }
    } else if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ doctorId: user.userId })
      if (doctor) {
        profile = { ...profile, ...doctor.toObject() }
      }
    }

    res.json(profile)
  } catch (error) {
    next(error)
  }
})


export default router
