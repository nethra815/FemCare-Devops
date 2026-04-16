import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Calendar, Heart, FileText, Pill, Activity, TrendingUp, Clock, User } from "lucide-react"

export default function PatientDashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    cycleData: null,
    recentRecords: 0,
    prescriptions: 0,
  })
  const [appointments, setAppointments] = useState([])
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

      const [appointmentsRes, cyclesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/appointments?patientId=${userId}&past_or_upcoming=upcoming`, config),
        axios.get("http://localhost:5000/api/cycles", config),
      ])

      setAppointments(appointmentsRes.data.slice(0, 3))
      setStats({
        upcomingAppointments: appointmentsRes.data.length,
        cycleData: cyclesRes.data[0] || null,
        recentRecords: 0,
        prescriptions: 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
              Welcome back, {user?.name}!
            </span>
          </h1>
          <p className="text-gray-600">Here's your health overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.upcomingAppointments}</span>
            </div>
            <p className="text-pink-100">Upcoming Appointments</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.cycleData ? "Active" : "Start"}</span>
            </div>
            <p className="text-purple-100">Cycle Tracking</p>
          </div>

          <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.recentRecords}</span>
            </div>
            <p className="text-indigo-100">Medical Records</p>
          </div>

          <div className="card bg-gradient-to-br from-pink-500 to-purple-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <Pill className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.prescriptions}</span>
            </div>
            <p className="text-pink-100">Prescriptions</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/patient/search-book" className="card hover:scale-105 transition-transform cursor-pointer group">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
              <Calendar className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Book Appointment</h3>
            <p className="text-sm text-gray-600">Search & book doctors</p>
          </Link>

          <Link to="/patient/cycle-tracker" className="card hover:scale-105 transition-transform cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Track Cycle</h3>
            <p className="text-sm text-gray-600">Log your period data</p>
          </Link>

          <Link to="/patient/records" className="card hover:scale-105 transition-transform cursor-pointer group">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">My Records</h3>
            <p className="text-sm text-gray-600">View health records</p>
          </Link>

          <Link to="/patient/prescriptions" className="card hover:scale-105 transition-transform cursor-pointer group">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
              <Pill className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Prescriptions</h3>
            <p className="text-sm text-gray-600">View medications</p>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-pink-600 hover:text-pink-700 font-semibold">
              View All
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No upcoming appointments</p>
              <Link to="/patient/search-book" className="btn-primary inline-block">
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.appointmentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Dr. {apt.doctor_info?.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(apt.date).toLocaleDateString()} at {apt.time}
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cycle Insights */}
        {stats.cycleData && (
          <div className="card bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Cycle Insights</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Last cycle started on {new Date(stats.cycleData.startDate).toLocaleDateString()}
            </p>
            <Link to="/patient/cycle-tracker" className="btn-primary inline-block">
              View Full History
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
