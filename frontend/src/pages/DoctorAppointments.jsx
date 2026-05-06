import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, Clock, CheckCircle, X, FileText, Pill } from "lucide-react"
import { getDoctorNameOnly } from "../utils/formatDoctorName"

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState("upcoming")
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [notesText, setNotesText] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [prescriptionData, setPrescriptionData] = useState({ diagnosis: "", medication: "", dosage: "", duration: "" })
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({ doctorId: user.userId })
      if (filter !== "all") params.append("past_or_upcoming", filter)

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

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchAppointments()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update status")
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return
    try {
      setSavingNotes(true)
      const token = localStorage.getItem("token")
      await axios.patch(
        `http://localhost:5000/api/appointments/${selectedAppointment.appointmentId}/notes`,
        { notes: notesText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedAppointment(null)
      setNotesText("")
      fetchAppointments()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save notes")
    } finally {
      setSavingNotes(false)
    }
  }

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:5000/api/prescriptions",
        {
          patientId: selectedAppointment.patientId,
          appointmentId: selectedAppointment.appointmentId,
          ...prescriptionData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setShowPrescriptionForm(false)
      setSelectedAppointment(null)
      setPrescriptionData({ diagnosis: "", medication: "", dosage: "", duration: "" })
      alert("Prescription created successfully!")
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create prescription")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "bg-blue-100 text-blue-700"
      case "Completed": return "bg-green-100 text-green-700"
      case "Cancelled": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              All Appointments
            </span>
          </h1>
          <p className="text-gray-600">Manage your patient appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex gap-2">
            {["upcoming", "past", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
                  filter === f ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No {filter !== "all" ? filter : ""} appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.appointmentId} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {apt.patient_info?.name?.charAt(0) || "P"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{apt.patient_info?.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(apt.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {apt.time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>

                {apt.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Notes</p>
                    <p className="text-sm text-blue-700">{apt.notes}</p>
                  </div>
                )}

                {apt.status === "Scheduled" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusUpdate(apt.appointmentId, "Completed")}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                    <button
                      onClick={() => { setSelectedAppointment(apt); setNotesText(apt.notes || "") }}
                      className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Add Notes
                    </button>
                    <button
                      onClick={() => { setSelectedAppointment(apt); setShowPrescriptionForm(true) }}
                      className="btn-outline text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <Pill className="w-4 h-4" />
                      Prescription
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {selectedAppointment && !showPrescriptionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Notes for {selectedAppointment.patient_info?.name}
            </h2>
            <textarea
              rows="5"
              className="input-field mb-4"
              placeholder="Enter consultation notes..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={handleSaveNotes} disabled={savingNotes} className="btn-primary flex-1">
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
              <button onClick={() => { setSelectedAppointment(null); setNotesText("") }} className="btn-outline flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Prescription</h2>
            <div className="p-3 bg-gray-50 rounded-lg mb-5">
              <p className="text-sm text-gray-600">Patient: <span className="font-semibold">{selectedAppointment.patient_info?.name}</span></p>
            </div>
            <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                <textarea rows="2" className="input-field" placeholder="Enter diagnosis..."
                  value={prescriptionData.diagnosis}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medication *</label>
                <input type="text" required className="input-field" placeholder="e.g., Ibuprofen 400mg"
                  value={prescriptionData.medication}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, medication: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage</label>
                  <input type="text" className="input-field" placeholder="e.g., 1 tablet twice daily"
                    value={prescriptionData.dosage}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, dosage: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <input type="text" className="input-field" placeholder="e.g., 7 days"
                    value={prescriptionData.duration}
                    onChange={(e) => setPrescriptionData({ ...prescriptionData, duration: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Create Prescription</button>
                <button type="button" onClick={() => { setShowPrescriptionForm(false); setSelectedAppointment(null) }} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
