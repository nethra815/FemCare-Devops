import mongoose from "mongoose"
import User from "./User.js"

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    sparse: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    default: 0
  },
  location: String,
  is_approved: {
    type: Boolean,
    default: false,
  },
})

// Set doctorId to userId after save
doctorSchema.post('save', async function(doc) {
  if (!doc.doctorId && doc.userId) {
    doc.doctorId = doc.userId
    await doc.save()
  }
})

// Methods specific to Doctor
doctorSchema.methods.viewPatientRecords = async function(patientId) {
  const MedicalRecord = mongoose.model('MedicalRecord')
  return MedicalRecord.find({ patientId })
}

doctorSchema.methods.updateAppointmentStatus = async function(appointmentId, status) {
  const Appointment = mongoose.model('Appointment')
  return Appointment.findOneAndUpdate(
    { appointmentId },
    { status },
    { new: true }
  )
}

doctorSchema.methods.addPrescription = async function(prescriptionData) {
  const Prescription = mongoose.model('Prescription')
  return Prescription.create({ ...prescriptionData, doctorId: this.doctorId })
}

const Doctor = User.discriminator("doctor", doctorSchema)

export default Doctor
