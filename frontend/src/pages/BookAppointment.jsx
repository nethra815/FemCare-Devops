import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import { Calendar, Clock, User, CheckCircle } from "lucide-react"

export default function BookAppointment() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(searchParams.get("doctorId") || "")
  const [formData, setFormData] = useState({
    date: "",
    time: "",
  })
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctor && formData.date) {
      fetchAvailableSlots()
    }
  }, [selectedDoctor, formData.date])

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/doctors")
      setDoctors(response.data)
    } catch (error) {
      console.error("Error fetching doctors:", error)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/doctors/${selectedDoctor}/schedule?date=${formData.date}`
      )
      setAvailableSlots(response.data.filter(slot => !slot.is_booked))
    } catch (error) {
      console.error("Error fetching slots:", error)
      setAvailableSlots([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:5000/api/appointments",
        {
          doctorId: selectedDoctor,
          date: formData.date,
          time: formData.time,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(true)
      setTimeout(() => navigate("/patient/dashboard"), 2000)
    } catch (error) {
      alert(error.response?.data?.error || "Failed to book appointment")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="card text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully scheduled. You'll receive a confirmation shortly.
          </p>
          <button onClick={() => navigate("/patient/dashboard")} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Book Appointment
            </span>
          </h1>
          <p className="text-gray-600">Schedule your consultation</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Doctor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  required
                  className="input-field pl-11"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctorId} value={doctor.doctorId}>
                      Dr. {doctor.user?.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  required
                  className="input-field pl-11"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                />
              </div>
            </div>

            {/* Select Time */}
            {formData.date && selectedDoctor && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time *</label>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No available slots for this date</p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => setFormData({ ...formData, time: slot.start_time })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.time === slot.start_time
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-sm font-semibold">{slot.start_time}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.time}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Booking..." : "Confirm Appointment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
