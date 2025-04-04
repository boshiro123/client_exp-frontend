import React from "react"
import { Navigate } from "react-router-dom"
import { authService } from "../../api/auth"

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = authService.isAuthenticated()
  const currentUser = authService.getCurrentUser()

  if (!isAuthenticated) {
    // Пользователь не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" replace />
  }

  if (adminOnly && currentUser?.role !== "admin") {
    // Если маршрут только для администраторов, а текущий пользователь не админ
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
