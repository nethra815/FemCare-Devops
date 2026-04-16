import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import RegisterDoctor from "./pages/RegisterDoctor"
import PatientDashboard from "./pages/PatientDashboard"
import PatientAppointments from "./pages/PatientAppointments"
import DoctorDashboard from "./pages/DoctorDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import SearchAndBook from "./pages/SearchAndBook"
import CycleTracker from "./pages/CycleTracker"
import DoctorPatients from "./pages/DoctorPatients"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-doctor" element={<RegisterDoctor />} />

      {/* Patient Routes with Layout */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute user={user} requiredRole="patient">
            <Layout>
              <PatientDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/search-book"
        element={
          <ProtectedRoute user={user} requiredRole="patient">
            <Layout>
              <SearchAndBook />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/cycle-tracker"
        element={
          <ProtectedRoute user={user} requiredRole="patient">
            <Layout>
              <CycleTracker />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute user={user} requiredRole="patient">
            <Layout>
              <PatientAppointments />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes with Layout */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute user={user} requiredRole="doctor">
            <Layout>
              <DoctorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute user={user} requiredRole="doctor">
            <Layout>
              <DoctorPatients />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes without Layout */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute user={user} requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
