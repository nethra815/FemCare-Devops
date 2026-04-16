import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Users, UserCheck, UserX, CheckCircle, X, Mail, Phone, Briefcase, LogOut, Heart } from "lucide-react"

export default function AdminDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [approvedDoctors, setApprovedDoctors] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [activeTab, setActiveTab] = useState("pending") // pending, approved, users
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Fetch all doctors (including unapproved ones)
      // We need to fetch from a different endpoint or modify the doctors endpoint
      const response = await axios.get("http://localhost:5000/api/doctors?includeUnapproved=true", config)
      
      // Separate pending and approved
      const pending = []
      const approved = []
      
      for (const doctor of response.data) {
        if (doctor.is_approved) {
          approved.push(doctor)
        } else {
          pending.push(doctor)
        }
      }

      setPendingDoctors(pending)
      setApprovedDoctors(approved)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `http://localhost:5000/api/admin/doctors/${doctorId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert("Doctor approved successfully!")
      fetchData()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to approve doctor")
    }
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logo and Logout */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-gray-600">Manage doctors and users</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-8 h-8" />
              <span className="text-3xl font-bold">{pendingDoctors.length}</span>
            </div>
            <p className="text-pink-100">Pending Approvals</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <span className="text-3xl font-bold">{approvedDoctors.length}</span>
            </div>
            <p className="text-purple-100">Approved Doctors</p>
          </div>

          <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" />
              <span className="text-3xl font-bold">{allUsers.length}</span>
            </div>
            <p className="text-indigo-100">Total Users</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="flex gap-2 border-b border-gray-200 pb-4 mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "pending"
                  ? "bg-pink-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Pending Approvals ({pendingDoctors.length})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === "approved"
                  ? "bg-pink-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Approved Doctors ({approvedDoctors.length})
            </button>
          </div>

          {/* Pending Doctors */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              ) : (
                pendingDoctors.map((doctor) => (
                  <div key={doctor.doctorId} className="p-5 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-white">
                            {doctor.user?.name?.charAt(0) || "D"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Dr. {doctor.user?.name}
                          </h3>
                          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{doctor.specialization}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              <span>{doctor.experience} years experience</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{doctor.user?.email}</span>
                            </div>
                            {doctor.user?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{doctor.user?.phone}</span>
                              </div>
                            )}
                          </div>
                          {doctor.location && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Location:</strong> {doctor.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleApproveDoctor(doctor.doctorId)}
                        className="btn-primary flex items-center gap-2 ml-4"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Approved Doctors */}
          {activeTab === "approved" && (
            <div className="space-y-4">
              {approvedDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No approved doctors yet</p>
                </div>
              ) : (
                approvedDoctors.map((doctor) => (
                  <div key={doctor.doctorId} className="p-5 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-white">
                          {doctor.user?.name?.charAt(0) || "D"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            Dr. {doctor.user?.name}
                          </h3>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Approved
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            <span>{doctor.specialization}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            <span>{doctor.experience} years experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{doctor.user?.email}</span>
                          </div>
                          {doctor.location && (
                            <div className="flex items-center gap-2">
                              <span>{doctor.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
