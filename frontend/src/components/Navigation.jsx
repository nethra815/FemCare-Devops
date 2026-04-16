import { Link, useNavigate, useLocation } from "react-router-dom"
import { Heart, Home, Calendar, Activity, User, LogOut, Bell, Search, FileText } from "lucide-react"

export default function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

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
    { path: "/patient/records", icon: FileText, label: "Records" },
    { path: "/patient/prescriptions", icon: User, label: "Prescriptions" },
  ]

  const doctorLinks = [
    { path: "/doctor/dashboard", icon: Home, label: "Dashboard" },
    { path: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    { path: "/doctor/patients", icon: User, label: "Patients" },
  ]

  const adminLinks = [
    { path: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { path: "/admin/doctors", icon: User, label: "Doctors" },
    { path: "/admin/users", icon: User, label: "Users" },
  ]

  const links = user.role === "patient" ? patientLinks : user.role === "doctor" ? doctorLinks : adminLinks

  return (
    <nav className="glass-effect border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={`/${user.role}/dashboard`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              FemCare
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
