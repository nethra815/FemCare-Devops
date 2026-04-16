import express from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Patient from "../models/Patient.js"
import Doctor from "../models/Doctor.js"
import Administrator from "../models/Administrator.js"
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateAge,
  validateHeight,
  validateWeight,
} from "../utils/validation.js"
import { generateToken } from "../utils/jwt.js"

const router = express.Router()

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, phone, age, gender, weight, height } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters with uppercase, lowercase, and number",
      })
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: "Invalid phone format" })
    }

    if (age && !validateAge(age)) {
      return res.status(400).json({ error: "Age must be between 18 and 120" })
    }

    if (height && !validateHeight(height)) {
      return res.status(400).json({ error: "Height must be between 100 and 250 cm" })
    }

    if (weight && !validateWeight(weight)) {
      return res.status(400).json({ error: "Weight must be between 30 and 500 kg" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" })
    }

    const patient = new Patient({
      name,
      email,
      password,
      phone,
      role: "patient",
      age: age || null,
      gender: gender || null,
      weight: weight || null,
      height: height || null,
    })

    await patient.save()

    const token = generateToken(patient)

    res.status(201).json({
      token,
      user: {
        userId: patient.userId,
        name: patient.name,
        email: patient.email,
        role: patient.role,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = generateToken(user)

    res.json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/register-doctor", async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, experience, location } = req.body

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ error: "Name, email, password, and specialization are required" })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters with uppercase, lowercase, and number",
      })
    }

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
      specialization,
      experience: experience || 0,
      location: location || "",
      is_approved: false,
    })

    await doctor.save()

    res.status(201).json({
      message: "Doctor registration submitted. Awaiting admin approval.",
      user: {
        userId: doctor.userId,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post("/verify", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ userId: decoded.userId })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      valid: true,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
})

export default router
