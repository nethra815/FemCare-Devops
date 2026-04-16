import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Search, MapPin, Briefcase, Star, Calendar, Clock, User, CheckCircle, X } from "lucide-react"

export default function SearchAndBook() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Search, 2: Select Time, 3: Confirm
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [filters, setFilters] = useState({ specialization: "", location: "" })
  const [formData, setFormData] = useState({ date: "", time: "" })
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchDoctors()
  }, [filters])

  useEffect(() => {
    if (selectedDoctor && formData.date) {
      fetchAvailableSlots()
    }
  }, [selectedDoctor, formData.date])

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.specialization) params.append("specialization", filters.specialization)
      if (filters.location) params.append("location", filters.location)

      const response = await axios.get(`http://localhost:5000/api/doctors?${params}`)
      setDoctors(response.data)
    } catch (error) {
      console.error("Error fetching doctors:", error)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/doctors/${selectedDoctor.doctorId}/schedule?date=${formData.date}`
      )
      setAvailableSlots(response.data.filter(slot => !slot.is_booked))
    } catch (error) {
      console.error("Error fetching slots:", error)
      setAvailableSlots([])
    }
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setStep(2)
  }

  const handleBooking = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        "http://localhost:5000/api/appointments",
        {
          doctorId: selectedDoctor.doctorId,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
        <div className="card text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment with Dr. {selectedDoctor.user?.name} has been confirmed.
          </p>
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
              {step === 1 ? "Find Your Doctor" : step === 2 ? "Select Time" : "Confirm Booking"}
            </span>
          </h1>
          <p className="text-gray-600">
            {step === 1 ? "Search and select a healthcare professional" : 
             step === 2 ? "Choose your preferred date and time" : 
             "Review and confirm your appointment"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-semibold hidden sm:inline">Search</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-semibold hidden sm:inline">Time</span>
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-pink-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-semibold hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Search Doctors */}
        {step === 1 && (
          <>
            <div className="card mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="input-field pl-11"
                      placeholder="e.g., Gynecologist"
                      value={filters.specialization}
                      onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="input-field pl-11"
                      placeholder="City or area"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.doctorId} className="card hover:scale-105 transition-transform">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">
                        {doctor.user?.name?.charAt(0) || "D"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        Dr. {doctor.user?.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    {doctor.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{doctor.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{doctor.available_slots} slots available</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDoctorSelect(doctor)}
                    className="btn-primary w-full"
                  >
                    Select Doctor
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && selectedDoctor && (
          <div className="max-w-3xl mx-auto">
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {selectedDoctor.user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Dr. {selectedDoctor.user?.name}</h3>
                    <p className="text-gray-600">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    className="input-field"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                  />
                </div>

                {formData.date && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time</label>
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
              </div>

              {formData.time && (
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary w-full mt-6"
                >
                  Continue to Confirmation
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedDoctor && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Your Appointment</h2>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Doctor</p>
                  <p className="text-lg font-semibold text-gray-800">Dr. {selectedDoctor.user?.name}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(formData.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{formData.time}</p>
                </div>

                {selectedDoctor.location && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedDoctor.location}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
