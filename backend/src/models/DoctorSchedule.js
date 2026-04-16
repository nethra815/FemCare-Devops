import mongoose from "mongoose"

const doctorScheduleSchema = new mongoose.Schema({
  doctor_id: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true,
  },
  is_booked: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("DoctorSchedule", doctorScheduleSchema)
