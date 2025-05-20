import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../../api/auth"
import { userService } from "../../api/users"
import Sidebar from "../../components/common/Sidebar"
import "../Dashboard/DashboardStyles.css"
import "./AdminStyles.css"

const AdminPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("pending") // 'pending' или 'managers'

  // Состояние для списков пользователей
  const [pendingUsers, setPendingUsers] = useState([])
  const [managers, setManagers] = useState([])

  // Состояние для загрузки и ошибок
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Состояние для модальных окон
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [approvalMessage, setApprovalMessage] = useState("")

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser && currentUser.role === "ADMIN") {
      setUser(currentUser)
      if (activeTab === "pending") {
        fetchPendingUsers()
      } else {
        fetchManagers()
      }
    } else {
      navigate("/dashboard")
    }
  }, [navigate, activeTab])

  // Загрузка списка заявок на регистрацию
  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await userService.getPendingUsers()
      setPendingUsers(data || [])
      setLoading(false)
    } catch (err) {
      console.error("Ошибка при получении заявок на регистрацию:", err)
      setError(
        "Не удалось загрузить заявки на регистрацию. Пожалуйста, попробуйте позже."
      )
      setLoading(false)
    }
  }

  // Загрузка списка менеджеров
  const fetchManagers = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await userService.getManagers()
      setManagers(data || [])
      setLoading(false)
    } catch (err) {
      console.error("Ошибка при получении списка менеджеров:", err)
      setError(
        "Не удалось загрузить список менеджеров. Пожалуйста, попробуйте позже."
      )
      setLoading(false)
    }
  }

  // Открытие модального окна для одобрения
  const openApproveModal = user => {
    setSelectedUser(user)
    setApprovalMessage("")
    setShowApproveModal(true)
  }

  // Открытие модального окна для отклонения
  const openRejectModal = user => {
    setSelectedUser(user)
    setShowRejectModal(true)
  }

  // Открытие модального окна для удаления
  const openDeleteModal = user => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  // Закрытие всех модальных окон
  const closeModals = () => {
    setShowApproveModal(false)
    setShowRejectModal(false)
    setShowDeleteModal(false)
    setSelectedUser(null)
    setApprovalMessage("")
  }

  // Одобрение заявки на регистрацию
  const handleApproveUser = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      const result = await userService.approveUser({
        userId: selectedUser.id,
        message: approvalMessage.trim() || undefined,
      })

      setSuccess(
        `Пользователь ${
          selectedUser.username || selectedUser.email
        } успешно одобрен`
      )
      closeModals()
      fetchPendingUsers() // Обновляем список заявок

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при одобрении пользователя:", err)
      setError(
        "Не удалось одобрить пользователя. Пожалуйста, попробуйте позже."
      )
      setLoading(false)
    }
  }

  // Отклонение заявки на регистрацию
  const handleRejectUser = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      await userService.rejectUser(selectedUser.id)

      setSuccess(
        `Заявка пользователя ${
          selectedUser.username || selectedUser.email
        } отклонена`
      )
      closeModals()
      fetchPendingUsers() // Обновляем список заявок

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при отклонении пользователя:", err)
      setError("Не удалось отклонить заявку. Пожалуйста, попробуйте позже.")
      setLoading(false)
    }
  }

  // Удаление менеджера
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      await userService.deleteUser(selectedUser.id)

      setSuccess(
        `Пользователь ${
          selectedUser.username || selectedUser.email
        } успешно удален`
      )
      closeModals()
      fetchManagers() // Обновляем список менеджеров

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при удалении пользователя:", err)
      setError("Не удалось удалить пользователя. Пожалуйста, попробуйте позже.")
      setLoading(false)
    }
  }

  // Форматирование даты
  const formatDate = dateString => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="admin-content">
        <h2 className="page-title">Панель администратора</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Заявки на регистрацию
          </button>
          <button
            className={`tab-button ${activeTab === "managers" ? "active" : ""}`}
            onClick={() => setActiveTab("managers")}
          >
            Управление менеджерами
          </button>
        </div>

        {loading ? (
          <div className="loading-indicator">Загрузка...</div>
        ) : (
          <div className="admin-tab-content">
            {activeTab === "pending" ? (
              <div className="pending-users-section">
                <h3>Заявки на регистрацию</h3>

                {pendingUsers.length === 0 ? (
                  <div className="empty-state">
                    Нет ожидающих заявок на регистрацию
                  </div>
                ) : (
                  <div className="users-table-container">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Имя пользователя</th>
                          <th>Email</th>
                          <th>Дата регистрации</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username || "—"}</td>
                            <td>{user.email}</td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td className="action-buttons">
                              <button
                                className="approve-button"
                                onClick={() => openApproveModal(user)}
                              >
                                Одобрить
                              </button>
                              <button
                                className="reject-button"
                                onClick={() => openRejectModal(user)}
                              >
                                Отклонить
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="managers-section">
                <h3>Управление менеджерами</h3>

                {managers.length === 0 ? (
                  <div className="empty-state">Нет активных менеджеров</div>
                ) : (
                  <div className="users-table-container">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Имя пользователя</th>
                          <th>Email</th>
                          <th>Дата регистрации</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {managers.map(manager => (
                          <tr key={manager.id}>
                            <td>{manager.id}</td>
                            <td>{manager.username || "—"}</td>
                            <td>{manager.email}</td>
                            <td>{formatDate(manager.createdAt)}</td>
                            <td className="action-buttons">
                              <button
                                className="delete-button"
                                onClick={() => openDeleteModal(manager)}
                              >
                                Удалить
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Модальное окно для одобрения пользователя */}
        {showApproveModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Одобрение пользователя</h3>
              <p>
                Вы уверены, что хотите одобрить регистрацию пользователя{" "}
                <strong>{selectedUser?.username || selectedUser?.email}</strong>
                ?
              </p>

              <div className="form-group">
                <label htmlFor="approvalMessage">
                  Сообщение (необязательно):
                </label>
                <textarea
                  id="approvalMessage"
                  value={approvalMessage}
                  onChange={e => setApprovalMessage(e.target.value)}
                  placeholder="Добавьте сообщение, которое будет отправлено пользователю"
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  className="primary-button"
                  onClick={handleApproveUser}
                  disabled={loading}
                >
                  Одобрить
                </button>
                <button
                  className="secondary-button"
                  onClick={closeModals}
                  disabled={loading}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно для отклонения пользователя */}
        {showRejectModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Отклонение заявки</h3>
              <p>
                Вы уверены, что хотите отклонить заявку на регистрацию
                пользователя{" "}
                <strong>{selectedUser?.username || selectedUser?.email}</strong>
                ?
              </p>
              <p className="warning-text">Это действие нельзя отменить.</p>

              <div className="modal-actions">
                <button
                  className="delete-button"
                  onClick={handleRejectUser}
                  disabled={loading}
                >
                  Отклонить
                </button>
                <button
                  className="secondary-button"
                  onClick={closeModals}
                  disabled={loading}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно для удаления менеджера */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Удаление пользователя</h3>
              <p>
                Вы уверены, что хотите удалить пользователя{" "}
                <strong>{selectedUser?.username || selectedUser?.email}</strong>
                ?
              </p>
              <p className="warning-text">
                Это действие нельзя отменить. Все данные пользователя будут
                удалены.
              </p>

              <div className="modal-actions">
                <button
                  className="delete-button"
                  onClick={handleDeleteUser}
                  disabled={loading}
                >
                  Удалить
                </button>
                <button
                  className="secondary-button"
                  onClick={closeModals}
                  disabled={loading}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
