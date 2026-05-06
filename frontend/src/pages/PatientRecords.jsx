import { useState, useEffect } from "react"
import axios from "axios"
import { FileText, Calendar, User, Activity } from "lucide-react"

export default function PatientRecords() {
  const [appointments, setAppointments] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const [appointmentsRes, cyclesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/appointments?patientId=${user.userId}`, config),
        axios.get("http://localhost:5000/api/cycles", config),
      ])

      setAppointments(appointmentsRes.data.filter((a) => a.notes))
      setCycles(cyclesRes.data)
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Medical Records
            </span>
          </h1>
          <p className="text-gray-600">Your health history and records</p>
        </div>

        {/* Appointment Notes */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-pink-600" />
            Appointment Notes
          </h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointment notes yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.appointmentId} className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Dr. {apt.doctor_info?.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(apt.date).toLocaleDateString()} at {apt.time}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {apt.status}
                    </span>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-700">{apt.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cycle Summary */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Cycle History Summary
          </h2>

          {cycles.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No cycle data yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                <p className="text-sm font-semibold text-pink-700 mb-2">Total Cycles Tracked</p>
                <p className="text-3xl font-bold text-pink-900">{cycles.length}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <p className="text-sm font-semibold text-purple-700 mb-2">Last Cycle</p>
                <p className="text-lg font-bold text-purple-900">
                  {new Date(cycles[0].startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
