import { Navigate, Outlet, useLocation } from "react-router-dom"
import { authService } from "../../api/auth"

/**
 * Компонент для защищенных маршрутов, требующих аутентификации
 * Если пользователь не авторизован, перенаправляет на страницу входа
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.adminOnly=false] - Требуется ли роль администратора для доступа
 */
const ProtectedRoute = ({ adminOnly = false }) => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()
  const currentUser = authService.getCurrentUser()

  // Если пользователь не авторизован, перенаправляем на страницу входа
  // с сохранением URL, на который он пытался попасть
  if (!isAuthenticated) {
    // Сохраняем путь, чтобы перенаправить пользователя после входа
    localStorage.setItem("redirectAfterLogin", location.pathname)

    // Перенаправляем на страницу входа
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Проверяем, если маршрут только для администраторов, то пользователь должен иметь роль ADMIN
  if (adminOnly && (!currentUser || currentUser.role !== "ADMIN")) {
    // Если у пользователя нет доступа, перенаправляем на дашборд
    return <Navigate to="/dashboard" replace />
  }

  // Если пользователь авторизован и имеет необходимые права, отображаем защищенный маршрут
  return <Outlet />
}

export default ProtectedRoute
