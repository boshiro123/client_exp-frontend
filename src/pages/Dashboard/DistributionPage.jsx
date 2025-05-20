import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../../api/auth"
import { surveyService } from "../../api/survey"
import { distributionService } from "../../api/distribution"
import Sidebar from "../../components/common/Sidebar"
import "./DashboardStyles.css"

const DistributionPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Состояния для рассылки опросника
  const [selectedSurveyId, setSelectedSurveyId] = useState("")
  const [surveySubject, setSurveySubject] = useState(
    "Приглашение пройти опрос о качестве обслуживания"
  )

  // Состояния для отправки сообщения
  const [messageSubject, setMessageSubject] = useState(
    "Важная информация для наших клиентов"
  )
  const [messageText, setMessageText] = useState("")

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      fetchSurveys()
    } else {
      navigate("/login")
    }
  }, [navigate])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      const response = await surveyService.getAllSurveys()

      // Получаем список опросников
      let surveysData = []
      if (response && response.content && Array.isArray(response.content)) {
        surveysData = response.content
      } else if (Array.isArray(response)) {
        surveysData = response
      }

      // Фильтруем только активные опросники
      const activeSurveys = surveysData.filter(
        survey => survey.status === "ACTIVE"
      )
      setSurveys(activeSurveys)

      // Если есть активные опросники, выбираем первый по умолчанию
      if (activeSurveys.length > 0) {
        setSelectedSurveyId(activeSurveys[0].id.toString())
      }

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при получении опросников:", err)
      setError("Не удалось загрузить опросники. Пожалуйста, попробуйте позже.")
      setLoading(false)
    }
  }

  const handleSendSurvey = async e => {
    e.preventDefault()

    if (!selectedSurveyId) {
      setError("Необходимо выбрать опросник для рассылки")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const result = await distributionService.sendSurveyToClients({
        surveyId: parseInt(selectedSurveyId),
        subject: surveySubject,
      })

      if (result.success) {
        setSuccess(
          `Опросник успешно отправлен ${result.totalRecipients} клиентам`
        )
      } else {
        setError(result.message || "Произошла ошибка при отправке опросника")
      }

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при рассылке опросника:", err)
      setError(
        err.message ||
          "Не удалось отправить опросник. Пожалуйста, попробуйте позже."
      )
      setLoading(false)
    }
  }

  const handleSendMessage = async e => {
    e.preventDefault()

    if (!messageText.trim()) {
      setError("Необходимо ввести текст сообщения")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const result = await distributionService.sendMessageToClients({
        message: messageText,
        subject: messageSubject,
      })

      if (result.success) {
        setSuccess(
          `Сообщение успешно отправлено ${result.totalRecipients} клиентам`
        )
        setMessageText("") // Очищаем поле после успешной отправки
      } else {
        setError(result.message || "Произошла ошибка при отправке сообщения")
      }

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err)
      setError(
        err.message ||
          "Не удалось отправить сообщение. Пожалуйста, попробуйте позже."
      )
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="dashboard-content">
        <h2 className="page-title">Рассылка клиентам</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {loading ? (
          <div className="loading-indicator">Загрузка...</div>
        ) : (
          <div className="distribution-container">
            <div className="distribution-section">
              <h3>Рассылка опросника</h3>
              <form onSubmit={handleSendSurvey} className="distribution-form">
                <div className="form-group">
                  <label htmlFor="surveySelect">Выберите опросник:</label>
                  <select
                    id="surveySelect"
                    value={selectedSurveyId}
                    onChange={e => setSelectedSurveyId(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="">-- Выберите опросник --</option>
                    {surveys.map(survey => (
                      <option key={survey.id} value={survey.id}>
                        {survey.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="surveySubject">Тема письма:</label>
                  <input
                    type="text"
                    id="surveySubject"
                    value={surveySubject}
                    onChange={e => setSurveySubject(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading || !selectedSurveyId}
                >
                  Отправить опросник клиентам
                </button>
              </form>
            </div>

            <div className="distribution-section">
              <h3>Отправка тематического письма</h3>
              <form onSubmit={handleSendMessage} className="distribution-form">
                <div className="form-group">
                  <label htmlFor="messageSubject">Тема письма:</label>
                  <input
                    type="text"
                    id="messageSubject"
                    value={messageSubject}
                    onChange={e => setMessageSubject(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="messageText">Текст сообщения:</label>
                  <textarea
                    id="messageText"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    className="form-control"
                    rows="8"
                    required
                    placeholder="Введите текст сообщения для клиентов..."
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading || !messageText.trim()}
                >
                  Отправить сообщение клиентам
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DistributionPage
