import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Search, MapPin, Briefcase, Star, Calendar } from "lucide-react"

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([])
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [filters])

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.specialization) params.append("specialization", filters.specialization)
      if (filters.location) params.append("location", filters.location)

      const response = await axios.get(`http://localhost:5000/api/doctors?${params}`)
      setDoctors(response.data)
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Find Your Doctor
            </span>
          </h1>
          <p className="text-gray-600">Connect with verified healthcare professionals</p>
        </div>

        {/* Search Filters */}
        <div className="card mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="input-field pl-11"
                  placeholder="e.g., Gynecologist, Obstetrician"
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

        {/* Doctors List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Finding doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="card text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No doctors found</p>
            <p className="text-sm text-gray-400">Try adjusting your search filters</p>
          </div>
        ) : (
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

                <Link
                  to={`/patient/book-appointment?doctorId=${doctor.doctorId}`}
                  className="btn-primary w-full text-center block"
                >
                  Book Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
