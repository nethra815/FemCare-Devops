import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}
