import { useState, useEffect } from "react"
import axios from "axios"
import { Bell, Calendar, CheckCircle, X, Check } from "lucide-react"

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(response.data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, is_read: true } : n))
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read)
    await Promise.all(unread.map((n) => markAsRead(n.notificationId)))
  }

  const getIcon = (type) => {
    switch (type) {
      case "appointment_booked":
        return <Calendar className="w-5 h-5 text-green-600" />
      case "appointment_cancelled":
        return <X className="w-5 h-5 text-red-600" />
      case "appointment_completed":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "doctor_approved":
        return <CheckCircle className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getIconBg = (type) => {
    switch (type) {
      case "appointment_booked": return "bg-green-100"
      case "appointment_cancelled": return "bg-red-100"
      case "appointment_completed": return "bg-blue-100"
      case "doctor_approved": return "bg-purple-100"
      default: return "bg-gray-100"
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Notifications
              </span>
            </h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors font-semibold text-sm"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.notificationId}
                className={`card flex items-start gap-4 transition-all ${
                  !n.is_read ? "border-l-4 border-pink-500 bg-pink-50/30" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(n.type)}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-gray-800 ${!n.is_read ? "font-semibold" : ""}`}>{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.notificationId)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
