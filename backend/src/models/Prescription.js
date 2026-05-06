import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  patientId: {
    type: String,
    required: true,
    index: true,
  },
  doctorId: {
    type: String,
    required: true,
    index: true,
  },
  appointmentId: {
    type: String,
    required: false,
  },
  diagnosis: {
    type: String,
    default: "",
  },
  medication: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    default: "",
  },
  duration: {
    type: String,
    default: "",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
})

const Prescription = mongoose.model("Prescription", prescriptionSchema)

export default Prescription
