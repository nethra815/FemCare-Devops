import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"
import Patient from "../models/Patient.js"
import Doctor from "../models/Doctor.js"
import Administrator from "../models/Administrator.js"
import Appointment from "../models/Appointment.js"
import CycleData from "../models/CycleData.js"
import Notification from "../models/Notification.js"
import DoctorSchedule from "../models/DoctorSchedule.js"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    console.log("\n🗑️  Clearing existing data...")
    await User.deleteMany({})
    await Appointment.deleteMany({})
    await CycleData.deleteMany({})
    await Notification.deleteMany({})
    await DoctorSchedule.deleteMany({})
    console.log("✅ Existing data cleared")

    // Create Demo Admin
    console.log("\n👤 Creating Demo Admin...")
    const admin = new Administrator({
      name: "Demo Admin",
      email: "demo@admin.com",
      password: "demo123",
      phone: "+91-9999999999",
      role: "admin",
    })
    await admin.save()
    admin.adminId = admin.userId
    await admin.save()
    console.log("✅ Demo Admin created: demo@admin.com / demo123")

    // Create Demo Doctor
    console.log("\n👨‍⚕️ Creating Demo Doctor...")
    const doctorsData = [
      {
        name: "Demo Doctor",
        email: "demo@doctor.com",
        password: "demo123",
        phone: "+91-9999999998",
        specialization: "Gynecologist",
        experience: 10,
        location: "Mumbai, Maharashtra",
        is_approved: true,
      },
      {
        name: "Priya Sharma",
        email: "priya@femcare.com",
        password: "priya123",
        phone: "+91-9876543211",
        specialization: "Obstetrician",
        experience: 12,
        location: "Delhi, NCR",
        is_approved: true,
      },
      {
        name: "Anjali Patel",
        email: "anjali@femcare.com",
        password: "anjali123",
        phone: "+91-9876543212",
        specialization: "Reproductive Endocrinologist",
        experience: 8,
        location: "Bangalore, Karnataka",
        is_approved: true,
      },
      {
        name: "Sneha Gupta",
        email: "sneha@femcare.com",
        password: "sneha123",
        phone: "+91-9876543213",
        specialization: "Maternal-Fetal Medicine",
        experience: 6,
        location: "Pune, Maharashtra",
        is_approved: false,
      },
    ]

    const doctors = []
    for (const docData of doctorsData) {
      const doctor = new Doctor({
        name: docData.name,
        email: docData.email,
        password: docData.password,
        phone: docData.phone,
        role: "doctor",
        specialization: docData.specialization,
        experience: docData.experience,
        location: docData.location,
        is_approved: docData.is_approved,
      })
      await doctor.save()
      doctor.doctorId = doctor.userId
      await doctor.save()
      doctors.push(doctor)
      console.log(`✅ Dr. ${doctor.name} (${doctor.email} / ${docData.password}) - ${doctor.is_approved ? "Approved" : "Pending"}`)
    }

    // Create Demo Patient
    console.log("\n👩 Creating Demo Patient...")
    const patientsData = [
      {
        name: "Demo Patient",
        email: "demo@patient.com",
        password: "demo123",
        phone: "+91-9999999997",
        age: 28,
        gender: "female",
        weight: 58,
        height: 162,
      },
      {
        name: "Aarti Singh",
        email: "aarti@example.com",
        password: "aarti123",
        phone: "+91-9876543221",
        age: 32,
        gender: "female",
        weight: 55,
        height: 158,
      },
      {
        name: "Divya Kumar",
        email: "divya@example.com",
        password: "divya123",
        phone: "+91-9876543222",
        age: 25,
        gender: "female",
        weight: 62,
        height: 165,
      },
    ]

    const patients = []
    for (const patData of patientsData) {
      const patient = new Patient({
        name: patData.name,
        email: patData.email,
        password: patData.password,
        phone: patData.phone,
        role: "patient",
        age: patData.age,
        gender: patData.gender,
        weight: patData.weight,
        height: patData.height,
      })
      await patient.save()
      patient.patientId = patient.userId
      await patient.save()
      patients.push(patient)
      console.log(`✅ ${patient.name} (${patient.email} / ${patData.password})`)
    }

    // Create Doctor Schedules
    console.log("\n📅 Creating Doctor Schedules...")
    const today = new Date()
    const scheduleCount = { total: 0 }

    for (const doctor of doctors.filter((d) => d.is_approved)) {
      // Create schedules for next 14 days
      for (let i = 0; i < 14; i++) {
        const scheduleDate = new Date(today)
        scheduleDate.setDate(today.getDate() + i)

        // Skip weekends
        if (scheduleDate.getDay() === 0 || scheduleDate.getDay() === 6) continue

        // Create time slots from 9 AM to 5 PM
        const timeSlots = [
          { start: "09:00", end: "09:30" },
          { start: "09:30", end: "10:00" },
          { start: "10:00", end: "10:30" },
          { start: "10:30", end: "11:00" },
          { start: "11:00", end: "11:30" },
          { start: "11:30", end: "12:00" },
          { start: "14:00", end: "14:30" },
          { start: "14:30", end: "15:00" },
          { start: "15:00", end: "15:30" },
          { start: "15:30", end: "16:00" },
          { start: "16:00", end: "16:30" },
          { start: "16:30", end: "17:00" },
        ]

        for (const slot of timeSlots) {
          const schedule = new DoctorSchedule({
            doctor_id: doctor.doctorId,
            date: scheduleDate,
            start_time: slot.start,
            end_time: slot.end,
            is_booked: false,
          })
          await schedule.save()
          scheduleCount.total++
        }
      }
    }
    console.log(`✅ Created ${scheduleCount.total} schedule slots`)

    // Create Appointments
    console.log("\n📋 Creating Appointments...")
    const appointmentsData = [
      // Tomorrow's appointments
      {
        patient: patients[0],
        doctor: doctors[0],
        daysFromNow: 1,
        time: "09:00",
        status: "Scheduled",
      },
      {
        patient: patients[0],
        doctor: doctors[1],
        daysFromNow: 1,
        time: "14:30",
        status: "Scheduled",
      },
      {
        patient: patients[1],
        doctor: doctors[2],
        daysFromNow: 1,
        time: "10:30",
        status: "Scheduled",
      },
      // Day after tomorrow's appointments
      {
        patient: patients[0],
        doctor: doctors[0],
        daysFromNow: 2,
        time: "10:00",
        status: "Scheduled",
      },
      {
        patient: patients[2],
        doctor: doctors[1],
        daysFromNow: 2,
        time: "11:00",
        status: "Scheduled",
      },
      {
        patient: patients[1],
        doctor: doctors[0],
        daysFromNow: 2,
        time: "15:00",
        status: "Scheduled",
      },
      // Future appointments
      {
        patient: patients[0],
        doctor: doctors[1],
        daysFromNow: 5,
        time: "14:00",
        status: "Scheduled",
      },
      {
        patient: patients[1],
        doctor: doctors[0],
        daysFromNow: 3,
        time: "11:30",
        status: "Scheduled",
      },
      {
        patient: patients[2],
        doctor: doctors[2],
        daysFromNow: 4,
        time: "09:30",
        status: "Scheduled",
      },
      // Past appointments
      {
        patient: patients[0],
        doctor: doctors[0],
        daysFromNow: -5,
        time: "15:00",
        status: "Completed",
      },
      {
        patient: patients[1],
        doctor: doctors[1],
        daysFromNow: -10,
        time: "10:30",
        status: "Completed",
      },
      {
        patient: patients[2],
        doctor: doctors[0],
        daysFromNow: -3,
        time: "09:00",
        status: "Completed",
      },
    ]

    for (const aptData of appointmentsData) {
      const aptDate = new Date(today)
      aptDate.setDate(today.getDate() + aptData.daysFromNow)

      const appointment = new Appointment({
        patientId: aptData.patient.patientId,
        doctorId: aptData.doctor.doctorId,
        date: aptDate,
        time: aptData.time,
        status: aptData.status,
        notes: aptData.status === "Completed" ? "Consultation completed successfully" : "",
      })
      await appointment.save()
      console.log(`✅ ${aptData.patient.name} with ${aptData.doctor.name} (${aptData.status})`)

      // Mark schedule as booked if scheduled
      if (aptData.status === "Scheduled") {
        await DoctorSchedule.findOneAndUpdate(
          {
            doctor_id: aptData.doctor.doctorId,
            date: {
              $gte: new Date(aptDate.setHours(0, 0, 0, 0)),
              $lt: new Date(aptDate.setHours(23, 59, 59, 999)),
            },
            start_time: aptData.time,
          },
          { is_booked: true }
        )
      }
    }

    // Create Cycle Data
    console.log("\n🔄 Creating Cycle Data...")
    const cyclePatients = [patients[0], patients[1], patients[2]]

    for (const patient of cyclePatients) {
      // Create 3 past cycles
      for (let i = 0; i < 3; i++) {
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - (28 * (i + 1)))

        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 5)

        const flowLevels = ["light", "medium", "heavy"]
        const symptoms = [
          ["Cramps", "Fatigue"],
          ["Headache", "Mood Swings", "Bloating"],
          ["Back Pain", "Cramps"],
        ]

        const cycle = new CycleData({
          patientId: patient.patientId,
          startDate,
          endDate,
          flowLevel: flowLevels[i % 3],
          symptoms: symptoms[i % 3],
        })
        await cycle.save()
      }
      console.log(`✅ Created 3 cycles for ${patient.name}`)
    }

    // Medical Records and Prescriptions removed - features disabled

    // Create Notifications
    console.log("\n🔔 Creating Notifications...")
    const notificationsData = [
      {
        user: patients[0],
        type: "appointment_booked",
        message: `Appointment booked with ${doctors[0].name} on ${new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      },
      {
        user: doctors[0],
        type: "appointment_booked",
        message: `New appointment with ${patients[0].name}`,
      },
      {
        user: patients[1],
        type: "cycle_reminder",
        message: "Time to log your cycle data",
      },
    ]

    for (const notifData of notificationsData) {
      const notification = new Notification({
        userId: notifData.user.userId,
        type: notifData.type,
        message: notifData.message,
        is_read: false,
      })
      await notification.save()
    }
    console.log(`✅ Created ${notificationsData.length} notifications`)

    // Summary
    console.log("\n" + "=".repeat(70))
    console.log("✅ DATABASE SEEDED SUCCESSFULLY WITH INDIAN DATA!")
    console.log("=".repeat(70))
    console.log("\n📊 Summary:")
    console.log(`   👤 Admin: 1`)
    console.log(`   👨‍⚕️ Doctors: ${doctors.length} (${doctors.filter((d) => d.is_approved).length} approved, ${doctors.filter((d) => !d.is_approved).length} pending)`)
    console.log(`   👩 Patients: ${patients.length}`)
    console.log(`   📅 Appointments: ${appointmentsData.length}`)
    console.log(`   🔄 Cycle Records: ${cyclePatients.length * 3}`)
    console.log(`   🔔 Notifications: ${notificationsData.length}`)
    console.log(`   📋 Schedule Slots: ${scheduleCount.total}`)

    console.log("\n" + "=".repeat(70))
    console.log("🔑 EASY LOGIN CREDENTIALS (All passwords are simple!)")
    console.log("=".repeat(70))

    console.log("\n" + "=".repeat(70))
    console.log("🎓 DEMO ACCOUNTS FOR PROFESSOR (All use password: demo123)")
    console.log("=".repeat(70))
    
    console.log("\n� ADMIN:T")
    console.log("   Email: demo@admin.com")
    console.log("   Password: demo123")

    console.log("\n👨‍⚕️ DOCTOR:")
    console.log("   Email: demo@doctor.com")
    console.log("   Password: demo123")

    console.log("\n👩 PATIENT:")
    console.log("   Email: demo@patient.com")
    console.log("   Password: demo123")

    console.log("\n" + "=".repeat(70))
    console.log("💡 QUICK DEMO LOGIN (Copy & Paste):")
    console.log("=".repeat(70))
    console.log("\n   Admin:   demo@admin.com   / demo123")
    console.log("   Doctor:  demo@doctor.com  / demo123")
    console.log("   Patient: demo@patient.com / demo123")
    console.log("\n" + "=".repeat(70))

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
