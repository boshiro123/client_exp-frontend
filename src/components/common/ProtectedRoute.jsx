import { Navigate, Outlet, useLocation } from "react-router-dom"
import { authService } from "../../api/auth"

/**
 * Компонент для защищенных маршрутов, требующих аутентификации
 * Если пользователь не авторизован, перенаправляет на страницу входа
 */
const ProtectedRoute = () => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()

  // Если пользователь не авторизован, перенаправляем на страницу входа
  // с сохранением URL, на который он пытался попасть
  if (!isAuthenticated) {
    // Сохраняем путь, чтобы перенаправить пользователя после входа
    localStorage.setItem("redirectAfterLogin", location.pathname)

    // Перенаправляем на страницу входа
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Если пользователь авторизован, отображаем защищенный маршрут
  return <Outlet />
}

export default ProtectedRoute
