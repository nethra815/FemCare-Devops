import mongoose from "mongoose"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

import User from "../models/User.js"
import Patient from "../models/Patient.js"
import Doctor from "../models/Doctor.js"
import Administrator from "../models/Administrator.js"
import Appointment from "../models/Appointment.js"
import CycleData from "../models/CycleData.js"
import Notification from "../models/Notification.js"
import DoctorSchedule from "../models/DoctorSchedule.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, "../../.env") })

const APPOINTMENT_SLOTS = [
  ["09:00", "09:30"],
  ["09:30", "10:00"],
  ["10:00", "10:30"],
  ["10:30", "11:00"],
  ["11:00", "11:30"],
  ["11:30", "12:00"],
  ["14:00", "14:30"],
  ["14:30", "15:00"],
  ["15:00", "15:30"],
  ["15:30", "16:00"],
  ["16:00", "16:30"],
  ["16:30", "17:00"],
]

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const startOfDay = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const endOfDay = (date) => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6

const firstWorkingDayOffset = (baseDate, minOffset = 1) => {
  let offset = minOffset
  while (isWeekend(addDays(baseDate, offset))) {
    offset += 1
  }
  return offset
}

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error("MONGODB_URI is missing in backend/.env")
    process.exit(1)
  }

  const connectionCandidates = [mongoUri]
  if (mongoUri.includes("mongo:27017")) {
    connectionCandidates.push(mongoUri.replace("mongo:27017", "localhost:27017"))
  }

  try {
    let connectedUri = null
    let lastError = null

    for (const uri of connectionCandidates) {
      try {
        await mongoose.connect(uri)
        connectedUri = uri
        break
      } catch (error) {
        lastError = error
      }
    }

    if (!connectedUri) {
      throw lastError
    }

    console.log(`Connected to MongoDB: ${connectedUri}`)

    console.log("\nClearing existing data...")
    await User.deleteMany({})
    await Appointment.deleteMany({})
    await CycleData.deleteMany({})
    await Notification.deleteMany({})
    await DoctorSchedule.deleteMany({})
    console.log("Existing data cleared")

    const admin = await Administrator.create({
      name: "Ananya Menon",
      email: "admin@femcare.in",
      password: "demo123",
      phone: "+91-9000011111",
      role: "admin",
      adminId: "TEMP_ADMIN",
    })
    admin.adminId = admin.userId
    await admin.save()

    const doctorsSeed = [
      {
        name: "Dr. Meera Nair",
        email: "meera.nair@femcare.in",
        password: "demo123",
        phone: "+91-9000010001",
        specialization: "Gynecologist",
        experience: 14,
        location: "Kochi, Kerala",
        is_approved: true,
      },
      {
        name: "Dr. Priyanka Sharma",
        email: "priyanka.sharma@femcare.in",
        password: "demo123",
        phone: "+91-9000010002",
        specialization: "Obstetrician",
        experience: 11,
        location: "New Delhi, Delhi",
        is_approved: true,
      },
      {
        name: "Dr. Kavita Kulkarni",
        email: "kavita.kulkarni@femcare.in",
        password: "demo123",
        phone: "+91-9000010003",
        specialization: "Reproductive Endocrinologist",
        experience: 9,
        location: "Pune, Maharashtra",
        is_approved: true,
      },
      {
        name: "Dr. Rhea Choudhury",
        email: "rhea.choudhury@femcare.in",
        password: "demo123",
        phone: "+91-9000010004",
        specialization: "Maternal-Fetal Medicine",
        experience: 6,
        location: "Kolkata, West Bengal",
        is_approved: false,
      },
    ]

    const doctors = []
    for (const entry of doctorsSeed) {
      const doctor = await Doctor.create({
        name: entry.name,
        email: entry.email,
        password: entry.password,
        phone: entry.phone,
        role: "doctor",
        specialization: entry.specialization,
        experience: entry.experience,
        location: entry.location,
        is_approved: entry.is_approved,
      })

      doctor.doctorId = doctor.userId
      await doctor.save()
      doctors.push(doctor)
    }

    const patientsSeed = [
      {
        name: "Nisha Verma",
        email: "nisha.verma@femcare.in",
        password: "demo123",
        phone: "+91-9000020001",
        age: 29,
        gender: "female",
        weight: 57,
        height: 160,
      },
      {
        name: "Aditi Rao",
        email: "aditi.rao@femcare.in",
        password: "demo123",
        phone: "+91-9000020002",
        age: 33,
        gender: "female",
        weight: 61,
        height: 164,
      },
      {
        name: "Pooja Iyer",
        email: "pooja.iyer@femcare.in",
        password: "demo123",
        phone: "+91-9000020003",
        age: 26,
        gender: "female",
        weight: 54,
        height: 157,
      },
      {
        name: "Ritika Gupta",
        email: "ritika.gupta@femcare.in",
        password: "demo123",
        phone: "+91-9000020004",
        age: 31,
        gender: "female",
        weight: 59,
        height: 162,
      },
    ]

    const patients = []
    for (const entry of patientsSeed) {
      const patient = await Patient.create({
        name: entry.name,
        email: entry.email,
        password: entry.password,
        phone: entry.phone,
        role: "patient",
        age: entry.age,
        gender: entry.gender,
        weight: entry.weight,
        height: entry.height,
      })

      patient.patientId = patient.userId
      await patient.save()
      patients.push(patient)
    }

    const approvedDoctors = doctors.filter((doctor) => doctor.is_approved)
    const today = startOfDay(new Date())

    let scheduleCount = 0
    for (const doctor of approvedDoctors) {
      for (let dayOffset = 1; dayOffset <= 14; dayOffset += 1) {
        const date = addDays(today, dayOffset)
        if (isWeekend(date)) {
          continue
        }

        for (const [start, end] of APPOINTMENT_SLOTS) {
          await DoctorSchedule.create({
            doctor_id: doctor.doctorId,
            date,
            start_time: start,
            end_time: end,
            is_booked: false,
          })
          scheduleCount += 1
        }
      }
    }

    const firstBusinessOffset = firstWorkingDayOffset(today, 1)
    const secondBusinessOffset = firstWorkingDayOffset(today, firstBusinessOffset + 1)
    const thirdBusinessOffset = firstWorkingDayOffset(today, secondBusinessOffset + 1)
    const fourthBusinessOffset = firstWorkingDayOffset(today, thirdBusinessOffset + 1)

    const appointmentsSeed = [
      {
        patient: patients[0],
        doctor: approvedDoctors[0],
        daysFromNow: firstBusinessOffset,
        time: "09:00",
        status: "Scheduled",
        notes: "Follow-up for irregular cycle",
      },
      {
        patient: patients[1],
        doctor: approvedDoctors[1],
        daysFromNow: firstBusinessOffset,
        time: "10:30",
        status: "Scheduled",
        notes: "Preconception counseling",
      },
      {
        patient: patients[2],
        doctor: approvedDoctors[2],
        daysFromNow: secondBusinessOffset,
        time: "14:00",
        status: "Scheduled",
        notes: "PCOS symptom review",
      },
      {
        patient: patients[3],
        doctor: approvedDoctors[0],
        daysFromNow: thirdBusinessOffset,
        time: "15:30",
        status: "Scheduled",
        notes: "Thyroid-related menstrual concerns",
      },
      {
        patient: patients[0],
        doctor: approvedDoctors[1],
        daysFromNow: -5,
        time: "11:00",
        status: "Completed",
        notes: "Medication adjusted after consultation",
      },
      {
        patient: patients[2],
        doctor: approvedDoctors[0],
        daysFromNow: -12,
        time: "09:30",
        status: "Completed",
        notes: "Routine gynecology check completed",
      },
      {
        patient: patients[1],
        doctor: approvedDoctors[2],
        daysFromNow: fourthBusinessOffset,
        time: "16:00",
        status: "Cancelled",
        notes: "Patient requested reschedule",
      },
    ]

    let appointmentCount = 0
    for (const entry of appointmentsSeed) {
      const appointmentDate = addDays(today, entry.daysFromNow)

      await Appointment.create({
        patientId: entry.patient.patientId,
        doctorId: entry.doctor.doctorId,
        date: appointmentDate,
        time: entry.time,
        status: entry.status,
        notes: entry.notes,
      })
      appointmentCount += 1

      if (entry.status === "Scheduled") {
        await DoctorSchedule.findOneAndUpdate(
          {
            doctor_id: entry.doctor.doctorId,
            date: {
              $gte: startOfDay(appointmentDate),
              $lte: endOfDay(appointmentDate),
            },
            start_time: entry.time,
          },
          { is_booked: true }
        )
      }
    }

    const flowLevels = ["light", "medium", "heavy"]
    const symptomPatterns = [
      ["Cramps", "Fatigue"],
      ["Mood Swings", "Bloating"],
      ["Back Pain", "Headache"],
    ]

    let cycleCount = 0
    for (const [index, patient] of patients.entries()) {
      for (let cycleNumber = 0; cycleNumber < 4; cycleNumber += 1) {
        const startDate = addDays(today, -(cycleNumber * 29 + 6 + index))
        const endDate = addDays(startDate, 4 + ((cycleNumber + index) % 2))

        await CycleData.create({
          patientId: patient.patientId,
          startDate,
          endDate,
          flowLevel: flowLevels[(cycleNumber + index) % flowLevels.length],
          symptoms: symptomPatterns[(cycleNumber + index) % symptomPatterns.length],
        })
        cycleCount += 1
      }
    }

    const notificationsSeed = [
      {
        userId: patients[0].userId,
        type: "appointment_booked",
        message: "Appointment confirmed with Dr. Meera Nair.",
      },
      {
        userId: patients[1].userId,
        type: "cycle_reminder",
        message: "Cycle reminder: please log symptoms for better prediction.",
      },
      {
        userId: doctors[0].userId,
        type: "appointment_booked",
        message: "New patient appointment added to your schedule.",
      },
      {
        userId: doctors[3].userId,
        type: "doctor_approved",
        message: "Your profile is under review by admin.",
      },
    ]

    await Notification.insertMany(notificationsSeed)

    console.log("\nDatabase seeded successfully with Indian demo data")
    console.log("------------------------------------------------------------")
    console.log(`Admin users      : 1`)
    console.log(`Doctors          : ${doctors.length} (${approvedDoctors.length} approved)`)
    console.log(`Patients         : ${patients.length}`)
    console.log(`Schedule slots   : ${scheduleCount}`)
    console.log(`Appointments     : ${appointmentCount}`)
    console.log(`Cycle entries    : ${cycleCount}`)
    console.log(`Notifications    : ${notificationsSeed.length}`)

    console.log("\nDemo credentials (all passwords are demo123)")
    console.log("Admin   : admin@femcare.in")
    console.log("Doctor  : meera.nair@femcare.in")
    console.log("Patient : nisha.verma@femcare.in")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
