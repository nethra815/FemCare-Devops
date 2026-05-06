import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"
import Prescription from "../models/Prescription.js"
import User from "../models/User.js"
import Notification from "../models/Notification.js"

const router = express.Router()

// Create prescription (doctor only)
router.post("/", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    const { patientId, appointmentId, diagnosis, medication, dosage, duration } = req.body

    if (!patientId || !medication) {
      return res.status(400).json({ error: "Patient ID and medication are required" })
    }

    const prescription = new Prescription({
      patientId,
      doctorId: req.user.userId,
      appointmentId: appointmentId || null,
      diagnosis: diagnosis || "",
      medication,
      dosage: dosage || "",
      duration: duration || "",
    })

    await prescription.save()

    // Create notification for patient
    const doctor = await User.findOne({ userId: req.user.userId })
    await Notification.create({
      userId: patientId,
      type: "prescription_created",
      message: `Dr. ${doctor?.name || "Your doctor"} has created a new prescription for you`,
    })

    res.status(201).json(prescription)
  } catch (error) {
    next(error)
  }
})

// Get prescriptions (patient sees their own, doctor sees their created ones)
router.get("/", authenticate, async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.query
    const filter = {}

    if (req.user.role === "patient") {
      // Patients can only see their own prescriptions
      filter.patientId = req.user.userId
    } else if (req.user.role === "doctor") {
      // Doctors can see prescriptions they created
      if (patientId) {
        filter.patientId = patientId
      }
      filter.doctorId = req.user.userId
    } else if (req.user.role === "admin") {
      // Admin can filter by patient or doctor
      if (patientId) filter.patientId = patientId
      if (doctorId) filter.doctorId = doctorId
    }

    const prescriptions = await Prescription.find(filter).sort({ created_at: -1 })

    // Enrich with doctor and patient info
    const enriched = await Promise.all(
      prescriptions.map(async (p) => {
        const doctor = await User.findOne({ userId: p.doctorId }).select("name email")
        const patient = await User.findOne({ userId: p.patientId }).select("name email")
        return {
          ...p.toObject(),
          doctor_info: doctor,
          patient_info: patient,
        }
      })
    )

    res.json(enriched)
  } catch (error) {
    next(error)
  }
})

// Get single prescription
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ prescriptionId: req.params.id })

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" })
    }

    // Authorization check
    if (
      prescription.patientId !== req.user.userId &&
      prescription.doctorId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const doctor = await User.findOne({ userId: prescription.doctorId }).select("name email")
    const patient = await User.findOne({ userId: prescription.patientId }).select("name email")

    res.json({
      ...prescription.toObject(),
      doctor_info: doctor,
      patient_info: patient,
    })
  } catch (error) {
    next(error)
  }
})

// Update prescription (doctor only, their own prescriptions)
router.patch("/:id", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    const { diagnosis, medication, dosage, duration } = req.body

    const prescription = await Prescription.findOne({ prescriptionId: req.params.id })

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" })
    }

    if (prescription.doctorId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    if (diagnosis !== undefined) prescription.diagnosis = diagnosis
    if (medication !== undefined) prescription.medication = medication
    if (dosage !== undefined) prescription.dosage = dosage
    if (duration !== undefined) prescription.duration = duration

    await prescription.save()
    res.json(prescription)
  } catch (error) {
    next(error)
  }
})

// Delete prescription (doctor only, their own prescriptions)
router.delete("/:id", authenticate, authorize("doctor"), async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ prescriptionId: req.params.id })

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" })
    }

    if (prescription.doctorId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    await Prescription.deleteOne({ prescriptionId: req.params.id })
    res.json({ message: "Prescription deleted" })
  } catch (error) {
    next(error)
  }
})

export default router
