import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"

const cycleDataSchema = new mongoose.Schema({
  cycleId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  flowLevel: {
    type: String,
    enum: ["light", "medium", "heavy"],
  },
  symptoms: [String],
  created_at: {
    type: Date,
    default: Date.now,
  },
})

// Methods
cycleDataSchema.methods.calculateFertilityWindow = function() {
  if (!this.startDate) return null
  
  const ovulationDay = new Date(this.startDate)
  ovulationDay.setDate(ovulationDay.getDate() + 14)
  
  return {
    ovulationDate: ovulationDay,
    fertileStart: new Date(ovulationDay.getTime() - 5 * 24 * 60 * 60 * 1000),
    fertileEnd: new Date(ovulationDay.getTime() + 1 * 24 * 60 * 60 * 1000)
  }
}

cycleDataSchema.methods.trackCycleHealth = function() {
  const cycleLength = this.endDate && this.startDate 
    ? Math.floor((this.endDate - this.startDate) / (1000 * 60 * 60 * 24))
    : null
  
  return {
    cycleId: this.cycleId,
    cycleLength,
    flowLevel: this.flowLevel,
    symptoms: this.symptoms,
    isRegular: cycleLength ? (cycleLength >= 21 && cycleLength <= 35) : null
  }
}

export default mongoose.model("CycleData", cycleDataSchema)
