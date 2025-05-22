import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/common/Sidebar"
import { authService } from "../../api/auth"
import "./IssuesPage.css"

const IssuesPage = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      navigate("/login")
      return
    }
    setCurrentUser(user)
  }, [navigate])

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} />
      <div className="dashboard-content">
        <div className="issues-header">
          <h1>Проблемные места</h1>
        </div>

        <div className="under-development">
          <div className="development-icon">🚧</div>
          <h2>Страница в разработке</h2>
          <p>
            Функционал анализа проблемных мест находится в разработке и будет
            доступен в ближайшее время.
          </p>
          <p>Здесь вы сможете просматривать:</p>
        </div>
      </div>
    </div>
  )
}

export default IssuesPage
