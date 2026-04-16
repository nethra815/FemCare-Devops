import { useState, useEffect } from "react"
import axios from "axios"
import { Users, Calendar, Activity, FileText, Eye, X } from "lucide-react"

export default function DoctorPatients() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientDetails, setPatientDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Get all appointments for this doctor
      const appointmentsRes = await axios.get(
        `http://localhost:5000/api/appointments?doctorId=${user.userId}`,
        config
      )

      // Extract unique patients
      const uniquePatients = []
      const patientIds = new Set()

      for (const apt of appointmentsRes.data) {
        if (!patientIds.has(apt.patientId)) {
          patientIds.add(apt.patientId)
          uniquePatients.push({
            patientId: apt.patientId,
            name: apt.patient_info?.name,
            email: apt.patient_info?.email,
            lastAppointment: apt.date,
          })
        }
      }

      setPatients(uniquePatients)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientDetails = async (patientId) => {
    try {
      const token = localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const [cyclesRes, recordsRes, appointmentsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/cycles`, config).catch(() => ({ data: [] })),
        axios.get(`http://localhost:5000/api/medical-records?patientId=${patientId}`, config).catch(() => ({ data: [] })),
        axios.get(`http://localhost:5000/api/appointments?patientId=${patientId}`, config),
      ])

      setPatientDetails({
        cycles: cyclesRes.data,
        records: recordsRes.data,
        appointments: appointmentsRes.data,
      })
    } catch (error) {
      console.error("Error fetching patient details:", error)
    }
  }

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    fetchPatientDetails(patient.patientId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
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
              My Patients
            </span>
          </h1>
          <p className="text-gray-600">View patient information and history</p>
        </div>

        {/* Patients List */}
        {patients.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No patients yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div key={patient.patientId} className="card hover:scale-105 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {patient.name?.charAt(0) || "P"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewPatient(patient)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{patient.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{patient.email}</p>

                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Last visit: {new Date(patient.lastAppointment).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && patientDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="card max-w-4xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                <button
                  onClick={() => {
                    setSelectedPatient(null)
                    setPatientDetails(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Appointments */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  Appointments ({patientDetails.appointments.length})
                </h3>
                <div className="space-y-3">
                  {patientDetails.appointments.slice(0, 5).map((apt) => (
                    <div key={apt.appointmentId} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </p>
                          {apt.notes && <p className="text-sm text-gray-600 mt-1">{apt.notes}</p>}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Cycle Data */}
              {patientDetails.cycles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Cycle History ({patientDetails.cycles.length})
                  </h3>
                  <div className="space-y-3">
                    {patientDetails.cycles.slice(0, 3).map((cycle) => (
                      <div key={cycle.cycleId} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            {new Date(cycle.startDate).toLocaleDateString()}
                            {cycle.endDate && ` - ${new Date(cycle.endDate).toLocaleDateString()}`}
                          </p>
                          {cycle.flowLevel && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                cycle.flowLevel === "light"
                                  ? "bg-blue-100 text-blue-700"
                                  : cycle.flowLevel === "medium"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {cycle.flowLevel}
                            </span>
                          )}
                        </div>
                        {cycle.symptoms && cycle.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {cycle.symptoms.map((symptom, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Records */}
              {patientDetails.records.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Medical Records ({patientDetails.records.length})
                  </h3>
                  <div className="space-y-3">
                    {patientDetails.records.map((record) => (
                      <div key={record.recordId} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">{record.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{record.recordData}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(record.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
