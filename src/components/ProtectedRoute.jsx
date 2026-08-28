import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, apenasAdmin = false }) {
  const { usuario, isAdmin } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (apenasAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
