import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Calendar, Clock, User, MapPin, FileText, X, AlertCircle } from "lucide-react"

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState("upcoming") // upcoming, past, all
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))
      
      const params = new URLSearchParams({
        patientId: user.userId,
      })
      
      if (filter !== "all") {
        params.append("past_or_upcoming", filter)
      }

      const response = await axios.get(
        `http://localhost:5000/api/appointments?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setAppointments(response.data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return

    try {
      setCancellingId(appointmentId)
      const token = localStorage.getItem("token")
      
      await axios.patch(
        `http://localhost:5000/api/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      alert("Appointment cancelled successfully")
      fetchAppointments()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to cancel appointment")
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-green-100 text-green-700"
      case "Completed":
        return "bg-blue-100 text-blue-700"
      case "Cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              My Appointments
            </span>
          </h1>
          <p className="text-gray-600">View and manage your appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === "upcoming"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === "past"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === "all"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No {filter !== "all" ? filter : ""} appointments
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "upcoming" 
                ? "You don't have any upcoming appointments"
                : filter === "past"
                ? "You don't have any past appointments"
                : "You haven't booked any appointments yet"}
            </p>
            {filter === "upcoming" && (
              <Link to="/patient/search-book" className="btn-primary inline-block">
                Book an Appointment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.appointmentId} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Doctor Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">
                        {apt.doctor_info?.name?.charAt(0) || "D"}
                      </span>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">
                            Dr. {apt.doctor_info?.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {apt.doctor_info?.specialization || "General Physician"}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-5 h-5 text-pink-500" />
                          <span>
                            {new Date(apt.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5 text-purple-500" />
                          <span>{apt.time}</span>
                        </div>
                      </div>

                      {apt.notes && (
                        <div className="p-3 bg-blue-50 rounded-lg mb-4">
                          <div className="flex items-start gap-2">
                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900 mb-1">Notes</p>
                              <p className="text-sm text-blue-700">{apt.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {apt.status === "Scheduled" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleCancelAppointment(apt.appointmentId)}
                            disabled={cancellingId === apt.appointmentId}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            {cancellingId === apt.appointmentId ? "Cancelling..." : "Cancel"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Action */}
        {appointments.length > 0 && filter === "upcoming" && (
          <div className="mt-8 text-center">
            <Link to="/patient/search-book" className="btn-primary inline-block">
              Book Another Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
