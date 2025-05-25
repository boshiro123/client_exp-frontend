import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { surveyService } from "../../api/survey"
import "./SurveyStyles.css"

const SurveysListPage = () => {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPublicSurveys()
  }, [])

  const fetchPublicSurveys = async () => {
    try {
      setLoading(true)
      // Получаем только активные опросники
      const response = await surveyService.getAllSurveysPublic()
      setSurveys(Array.isArray(response) ? response : response.content || [])
      setLoading(false)
    } catch (err) {
      console.error("Ошибка при загрузке опросников:", err)
      setError("Не удалось загрузить список доступных опросников")
      setLoading(false)
    }
  }

  const handleSurveyClick = id => {
    navigate(`/survey/${id}`)
  }

  const formatDate = dateString => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  }

  if (loading) {
    return (
      <div className="surveys-list-container">
        <div className="loading-indicator">Загрузка опросников...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surveys-list-container">
        <div className="error-message">
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button className="back-button" onClick={() => navigate("/")}>
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="surveys-list-container">
      <header className="surveys-list-header">
        <h1>Доступные опросники</h1>
        <p className="surveys-list-description">
          Выберите опросник, чтобы принять участие
        </p>
        <div className="surveys-list-header-actions">
          <button
            className="secondary-button"
            onClick={() => navigate("/login")}
          >
            Вернуться в систему
          </button>
        </div>
      </header>

      <main className="surveys-list-content">
        {surveys.length === 0 ? (
          <div className="empty-surveys-message">
            <p>На данный момент нет доступных опросников</p>
            <button className="primary-button" onClick={() => navigate("/")}>
              На главную
            </button>
          </div>
        ) : (
          <div className="surveys-cards">
            {surveys.map(survey => (
              <div
                key={survey.id}
                className="survey-card"
                onClick={() => handleSurveyClick(survey.id)}
              >
                <h2 className="survey-card-title">{survey.title}</h2>
                {survey.description && (
                  <p className="survey-card-description">
                    {survey.description}
                  </p>
                )}
                <div className="survey-card-meta">
                  <span className="survey-card-questions">
                    Вопросов: {survey.questions ? survey.questions.length : "—"}
                  </span>
                  <span className="survey-card-date">
                    Активен до: {formatDate(survey.endDate)}
                  </span>
                </div>
                <button className="survey-card-button">Пройти опрос</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default SurveysListPage
