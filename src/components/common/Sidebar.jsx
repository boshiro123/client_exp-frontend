import React from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { authService } from "../../api/auth"
import "./Sidebar.css"

// Иконки для пунктов меню (используем Unicode-символы для простоты)
const icons = {
  dashboard: "📊",
  segment: "🔍",
  statistics: "📈",
  distribution: "📧",
  settings: "⚙️",
  admin: "👑",
  logout: "🚪",
  questions: "❓",
  issues: "⚠️",
}

const Sidebar = ({ user }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Определяем активный пункт меню на основе текущего пути
  const isActive = path => {
    if (path === "/dashboard" && location.pathname === "/dashboard") {
      return true
    }
    if (path !== "/dashboard" && location.pathname.startsWith(path)) {
      return true
    }
    return false
  }

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">ClientExp</div>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user?.username || "Пользователь"}
            </div>
            <div className="sidebar-user-role">{user?.role || "Менеджер"}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={`sidebar-nav-item ${
            isActive("/dashboard") ? "active" : ""
          }`}
        >
          <span className="sidebar-nav-icon">{icons.dashboard}</span>
          <span className="sidebar-nav-text">Главная</span>
        </NavLink>

        <NavLink
          to="/statistics"
          className={`sidebar-nav-item ${
            isActive("/statistics") ? "active" : ""
          }`}
        >
          <span className="sidebar-nav-icon">{icons.statistics}</span>
          <span className="sidebar-nav-text">Статистика</span>
        </NavLink>

        <NavLink
          to="/distribution"
          className={`sidebar-nav-item ${
            isActive("/distribution") ? "active" : ""
          }`}
        >
          <span className="sidebar-nav-icon">{icons.distribution}</span>
          <span className="sidebar-nav-text">Рассылки</span>
        </NavLink>

        {user && user.role === "ADMIN" && (
          <NavLink
            to="/admin"
            className={`sidebar-nav-item ${isActive("/admin") ? "active" : ""}`}
          >
            <span className="sidebar-nav-icon">{icons.admin}</span>
            <span className="sidebar-nav-text">Управление пользователями</span>
          </NavLink>
        )}

        <NavLink
          to="/dashboard/segments"
          className={`sidebar-nav-item ${
            isActive("/dashboard/segments") ? "active" : ""
          }`}
        >
          <span className="sidebar-nav-icon">{icons.segment}</span>
          <span className="sidebar-nav-text">Сегменты</span>
        </NavLink>

        <NavLink
          to="/questions"
          className={`sidebar-nav-item ${
            isActive("/questions") ? "active" : ""
          }`}
        >
          <span className="sidebar-nav-icon">{icons.questions}</span>
          <span className="sidebar-nav-text">База вопросов</span>
        </NavLink>

        <NavLink
          to="/issues"
          className={`sidebar-nav-item ${isActive("/issues") ? "active" : ""}`}
        >
          <span className="sidebar-nav-icon">{icons.issues}</span>
          <span className="sidebar-nav-text">Проблемные места</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/dashboard/settings"
          className={`sidebar-nav-item ${
            isActive("/dashboard/settings") ? "active" : ""
          }`}
        >
          <span className="sidebar-nav-icon">{icons.settings}</span>
          <span className="sidebar-nav-text">Настройки</span>
        </NavLink>

        <button className="sidebar-nav-item logout-item" onClick={handleLogout}>
          <span className="sidebar-nav-icon">{icons.logout}</span>
          <span className="sidebar-nav-text">Выйти</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
