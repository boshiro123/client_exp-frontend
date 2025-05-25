import React from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { authService } from "../../api/auth"
import "./Sidebar.css"

// SVG иконки для пунктов меню
const icons = {
  dashboard: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
        fill="currentColor"
      />
    </svg>
  ),
  segment: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        fill="currentColor"
      />
    </svg>
  ),
  statistics: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z"
        fill="currentColor"
      />
    </svg>
  ),
  distribution: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        fill="currentColor"
      />
    </svg>
  ),
  settings: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
        fill="currentColor"
      />
    </svg>
  ),
  admin: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="currentColor"
      />
    </svg>
  ),
  logout: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
        fill="currentColor"
      />
    </svg>
  ),
  questions: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
        fill="currentColor"
      />
    </svg>
  ),
  issues: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
        fill="currentColor"
      />
    </svg>
  ),
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
          <span className="sidebar-nav-text">Опросники</span>
        </NavLink>

        <NavLink
          to="/statistics"
          className={`sidebar-nav-item ${
            isActive("/statistics") ? "active" : ""
          }`}
        >
          <span className="sidebar-nav-icon">{icons.statistics}</span>
          <span className="sidebar-nav-text">Результаты опросников</span>
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
          {/* <span className="sidebar-nav-icon">{icons.settings}</span>
          <span className="sidebar-nav-text">Настройки</span> */}
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
