import mongoose from "mongoose"
import User from "./User.js"

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    sparse: true,
  },
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "female",
  },
  weight: Number,
  height: Number,
})

// Set patientId to userId after save
patientSchema.post('save', async function(doc) {
  if (!doc.patientId && doc.userId) {
    doc.patientId = doc.userId
    await doc.save()
  }
})

// Methods specific to Patient
patientSchema.methods.viewCycleHistory = async function() {
  const CycleData = mongoose.model('CycleData')
  return CycleData.find({ patientId: this.patientId }).sort({ startDate: -1 })
}

patientSchema.methods.viewFertilityPrediction = async function() {
  const CycleData = mongoose.model('CycleData')
  const cycles = await CycleData.find({ patientId: this.patientId })
    .sort({ startDate: -1 })
    .limit(3)
  
  if (cycles.length === 0) return null
  
  // Calculate average cycle length
  let totalDays = 0
  let count = 0
  for (let i = 0; i < cycles.length - 1; i++) {
    if (cycles[i].endDate) {
      const diff = Math.floor((cycles[i].endDate - cycles[i].startDate) / (1000 * 60 * 60 * 24))
      totalDays += diff
      count++
    }
  }
  
  const avgCycleLength = count > 0 ? Math.round(totalDays / count) : 28
  const lastCycle = cycles[0]
  const ovulationDay = new Date(lastCycle.startDate)
  ovulationDay.setDate(ovulationDay.getDate() + 14)
  
  return {
    averageCycleLength: avgCycleLength,
    predictedOvulation: ovulationDay,
    fertileWindow: {
      start: new Date(ovulationDay.getTime() - 5 * 24 * 60 * 60 * 1000),
      end: new Date(ovulationDay.getTime() + 1 * 24 * 60 * 60 * 1000)
    }
  }
}

patientSchema.methods.bookAppointment = async function(appointmentData) {
  const Appointment = mongoose.model('Appointment')
  return Appointment.create({ ...appointmentData, patientId: this.patientId })
}

patientSchema.methods.rescheduleAppointment = async function(appointmentId, newDate, newTime) {
  const Appointment = mongoose.model('Appointment')
  return Appointment.findOneAndUpdate(
    { appointmentId, patientId: this.patientId },
    { date: newDate, time: newTime },
    { new: true }
  )
}

patientSchema.methods.uploadMedicalReport = async function(reportData) {
  const MedicalRecord = mongoose.model('MedicalRecord')
  return MedicalRecord.create({ ...reportData, patientId: this.patientId })
}

const Patient = User.discriminator("patient", patientSchema)

export default Patient
