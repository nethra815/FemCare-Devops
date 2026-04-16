import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, Users, Clock, CheckCircle, Pill } from "lucide-react"
import { getDoctorNameOnly } from "../utils/formatDoctorName"

export default function DoctorDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
  })
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: "",
    medication: "",
    dosage: "",
    duration: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"))
    setUser(userData)
    fetchDashboardData(userData.userId)
  }, [])

  const fetchDashboardData = async (userId) => {
    try {
      const token = localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const response = await axios.get(
        `http://localhost:5000/api/appointments?doctorId=${userId}&past_or_upcoming=upcoming`,
        config
      )

      const today = new Date().toDateString()
      const todayAppts = response.data.filter(
        (apt) => new Date(apt.date).toDateString() === today
      )

      setAppointments(response.data.slice(0, 5))
      setStats({
        todayAppointments: todayAppts.length,
        upcomingAppointments: response.data.length,
        totalPatients: new Set(response.data.map((apt) => apt.patientId)).size,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchDashboardData(user.userId)
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update status")
    }
  }

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault()
    
    // Store prescription data locally (since backend is disabled)
    const prescription = {
      id: Date.now(),
      patientId: selectedAppointment.patientId,
      patientName: selectedAppointment.patient_info?.name,
      doctorId: user.userId,
      ...prescriptionData,
      createdAt: new Date().toISOString(),
    }
    
    // Store in localStorage for demo purposes
    const existingPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    existingPrescriptions.push(prescription)
    localStorage.setItem("prescriptions", JSON.stringify(existingPrescriptions))
    
    setShowPrescriptionForm(false)
    setSelectedAppointment(null)
    setPrescriptionData({ diagnosis: "", medication: "", dosage: "", duration: "" })
    alert("Prescription created successfully!")
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Welcome, Dr. {getDoctorNameOnly(user?.name)}!
            </span>
          </h1>
          <p className="text-gray-600">Here's your practice overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.todayAppointments}</span>
            </div>
            <p className="text-pink-100">Today's Appointments</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.upcomingAppointments}</span>
            </div>
            <p className="text-purple-100">Upcoming Appointments</p>
          </div>

          <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalPatients}</span>
            </div>
            <p className="text-indigo-100">Total Patients</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.appointmentId} className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {apt.patient_info?.name?.charAt(0) || "P"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{apt.patient_info?.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(apt.date).toLocaleDateString()} at {apt.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                        apt.status === "Scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : apt.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  {apt.status === "Scheduled" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleStatusUpdate(apt.appointmentId, "Completed")}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt)
                          setShowPrescriptionForm(true)
                        }}
                        className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <Pill className="w-4 h-4" />
                        Add Prescription
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Prescription Form Modal */}
        {showPrescriptionForm && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Prescription</h2>

              <div className="p-4 bg-gray-50 rounded-xl mb-6">
                <p className="text-sm text-gray-600 mb-1">Patient</p>
                <p className="font-semibold text-gray-800">{selectedAppointment.patient_info?.name}</p>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                  <textarea
                    rows="3"
                    className="input-field"
                    placeholder="Enter diagnosis..."
                    value={prescriptionData.diagnosis}
                    onChange={(e) =>
                      setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medication *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g., Ibuprofen 400mg"
                    value={prescriptionData.medication}
                    onChange={(e) =>
                      setPrescriptionData({ ...prescriptionData, medication: e.target.value })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., 1 tablet twice daily"
                      value={prescriptionData.dosage}
                      onChange={(e) =>
                        setPrescriptionData({ ...prescriptionData, dosage: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., 7 days"
                      value={prescriptionData.duration}
                      onChange={(e) =>
                        setPrescriptionData({ ...prescriptionData, duration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    Create Prescription
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrescriptionForm(false)
                      setSelectedAppointment(null)
                      setPrescriptionData({ diagnosis: "", medication: "", dosage: "", duration: "" })
                    }}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
