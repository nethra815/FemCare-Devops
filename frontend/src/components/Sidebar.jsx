import { Link, useLocation, useNavigate } from "react-router-dom"
import { Heart, Home, Calendar, Activity, FileText, Pill, Search, Users, LogOut, Bell, User, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path

  const patientLinks = [
    { path: "/patient/dashboard", icon: Home, label: "Dashboard" },
    { path: "/patient/search-book", icon: Calendar, label: "Book Appointment" },
    { path: "/patient/cycle-tracker", icon: Activity, label: "Cycle Tracker" },
    { path: "/patient/records", icon: FileText, label: "Medical Records", disabled: true },
    { path: "/patient/prescriptions", icon: Pill, label: "Prescriptions", disabled: true },
  ]

  const doctorLinks = [
    { path: "/doctor/dashboard", icon: Home, label: "Dashboard" },
    { path: "/doctor/patients", icon: Users, label: "My Patients" },
  ]

  const adminLinks = [
    { path: "/admin/dashboard", icon: Home, label: "Dashboard" },
  ]

  const links = user.role === "patient" ? patientLinks : user.role === "doctor" ? doctorLinks : adminLinks

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to={`/${user.role}/dashboard`} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent block">
                  FemCare
                </span>
                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon
                const active = isActive(link.path)
                
                if (link.disabled) {
                  return (
                    <div
                      key={link.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-50"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{user.name?.charAt(0) || "U"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600 mx-auto" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
