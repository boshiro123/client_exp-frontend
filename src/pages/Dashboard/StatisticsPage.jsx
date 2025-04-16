import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { surveyService } from "../../api/survey"
import { authService } from "../../api/auth"
import Sidebar from "../../components/common/Sidebar"
import "./DashboardStyles.css"

const StatisticsPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [surveys, setSurveys] = useState([])
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [responseDetails, setResponseDetails] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      fetchSurveys()
    } else {
      navigate("/login")
      return
    }
  }, [navigate])

  useEffect(() => {
    // Проверяем наличие параметра survey в URL
    const params = new URLSearchParams(location.search)
    const surveyId = params.get("survey")

    if (surveyId && surveys.length > 0) {
      const survey = surveys.find(s => s.id === parseInt(surveyId))
      if (survey) {
        handleSurveySelect(survey)
      }
    }
  }, [surveys, location.search])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      const response = await surveyService.getAllSurveys()

      let surveysData = []
      if (response && response.content && Array.isArray(response.content)) {
        surveysData = response.content
      } else if (Array.isArray(response)) {
        surveysData = response
      }

      setSurveys(surveysData)
      setLoading(false)
      console.log("Опросники:", surveysData)
    } catch (error) {
      console.error("Ошибка при получении опросников:", error)
      setError("Не удалось загрузить опросники. Пожалуйста, попробуйте позже.")
      setLoading(false)
    }
  }

  const fetchResponses = async surveyId => {
    try {
      setLoading(true)
      setError("")
      // Предполагаем, что в API есть метод для получения ответов по ID опросника
      const response = await surveyService.getSurveyResponses(surveyId)
      // Убедимся, что responses всегда массив
      setResponses(Array.isArray(response) ? response : [])
      console.log("Ответы:", response)
      setLoading(false)
    } catch (error) {
      console.error("Ошибка при получении ответов:", error)
      setError("Не удалось загрузить ответы. Пожалуйста, попробуйте позже.")
      setResponses([])
      setLoading(false)
    }
  }

  const handleSurveySelect = survey => {
    setSelectedSurvey(survey)
    setResponseDetails(null)
    fetchResponses(survey.id)
  }

  const handleResponseSelect = response => {
    setResponseDetails(response)
  }

  const formatDate = dateString => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Функция для группировки вопросов по категориям (сегментациям)
  const getQuestionsByCategory = () => {
    if (!selectedSurvey || !selectedSurvey.questions) return {}

    const categories = {}

    selectedSurvey.questions.forEach(question => {
      const category = question.category || "Без категории"

      if (!categories[category]) {
        categories[category] = []
      }

      categories[category].push(question)
    })

    return categories
  }

  // Заглушка для отображения статистики по вопросу
  const renderQuestionStats = questionId => {
    if (
      !selectedSurvey ||
      !responses ||
      !Array.isArray(responses) ||
      !responses.length
    )
      return null

    const question = selectedSurvey.questions.find(q => q.id === questionId)
    if (!question) return null

    // Собираем ответы на этот вопрос
    const answersForQuestion = Array.isArray(responses)
      ? responses
          .filter(r => r && r.answers)
          .flatMap(r => r.answers)
          .filter(a => a && a.questionId === questionId)
      : []

    if (!answersForQuestion.length) {
      return <div className="no-data">Нет данных для анализа</div>
    }

    // Для вопросов с вариантами ответа показываем статистику
    if (
      question.type === "SINGLE_CHOICE" ||
      question.type === "MULTIPLE_CHOICE"
    ) {
      // Считаем количество каждого варианта ответа
      const answerCounts = {}

      answersForQuestion.forEach(answer => {
        if (Array.isArray(answer.answer)) {
          // Для multiple choice
          answer.answer.forEach(option => {
            answerCounts[option] = (answerCounts[option] || 0) + 1
          })
        } else if (question.type === "MULTIPLE_CHOICE" && answer.answer) {
          // Если ответ не массив, но существует, и вопрос множественного выбора
          answerCounts[answer.answer] = (answerCounts[answer.answer] || 0) + 1
        } else {
          // Для single choice
          answerCounts[answer.answer] = (answerCounts[answer.answer] || 0) + 1
        }
      })

      return (
        <div className="question-stats">
          <h4>Статистика ответов:</h4>
          <div className="stats-bars">
            {Object.entries(answerCounts).map(([option, count]) => {
              const percentage = Math.round(
                (count / answersForQuestion.length) * 100
              )
              return (
                <div key={option} className="stat-item">
                  <div className="stat-label">{option}</div>
                  <div className="stat-bar-container">
                    <div
                      className="stat-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <span className="stat-value">
                      {percentage}% ({count})
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Для текстовых вопросов показываем список ответов
    if (question.type === "TEXT") {
      return (
        <div className="text-answers">
          <h4>Текстовые ответы:</h4>
          <ul className="text-answers-list">
            {answersForQuestion.map((answer, index) => (
              <li key={index} className="text-answer-item">
                {answer.answer || "Нет ответа"}
              </li>
            ))}
          </ul>
        </div>
      )
    }

    // Для рейтинговых вопросов показываем средний рейтинг
    if (question.type === "RATING") {
      const ratings = answersForQuestion.map(a => parseInt(a.answer) || 0)
      const averageRating =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length

      return (
        <div className="rating-stats">
          <h4>Средний рейтинг: {averageRating.toFixed(1)} из 10</h4>
          <div className="rating-distribution">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => {
              const count = ratings.filter(r => r === rating).length
              const percentage = Math.round((count / ratings.length) * 100)

              return (
                <div key={rating} className="rating-bar-container">
                  <div className="rating-label">{rating}</div>
                  <div className="rating-bar-wrapper">
                    <div
                      className="rating-bar"
                      style={{ height: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="rating-count">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="statistics-page">
        <h2 className="page-title">Статистика опросов</h2>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-indicator">Загрузка данных...</div>
        ) : (
          <div className="statistics-container">
            <div className="surveys-list-sidebar">
              <h3>Опросники</h3>
              {surveys.length === 0 ? (
                <div className="empty-state">У вас пока нет опросников</div>
              ) : (
                <ul className="surveys-list">
                  {surveys.map(survey => (
                    <li
                      key={survey.id}
                      className={`survey-item ${
                        selectedSurvey?.id === survey.id ? "active" : ""
                      }`}
                      onClick={() => handleSurveySelect(survey)}
                    >
                      <div className="survey-title">{survey.title}</div>
                      <div className="survey-meta">
                        <span
                          className={`survey-status status-${survey.status.toLowerCase()}`}
                        >
                          {survey.status === "ACTIVE"
                            ? "Активный"
                            : survey.status === "COMPLETED"
                            ? "Завершен"
                            : "Черновик"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="statistics-content">
              {!selectedSurvey ? (
                <div className="select-survey-prompt">
                  Выберите опросник из списка слева для просмотра статистики
                </div>
              ) : (
                <div className="survey-statistics">
                  <h3>{selectedSurvey.title}</h3>
                  <div className="statistics-tabs">
                    <button
                      className={`tab-button ${
                        !responseDetails ? "active" : ""
                      }`}
                      onClick={() => setResponseDetails(null)}
                    >
                      Общая статистика
                    </button>
                    <button
                      className={`tab-button ${
                        responseDetails ? "active" : ""
                      }`}
                      disabled={!responses.length}
                      onClick={() =>
                        responses.length && setResponseDetails(responses[0])
                      }
                    >
                      Ответы клиентов ({responses.length})
                    </button>
                  </div>

                  {!responseDetails ? (
                    <div className="general-statistics">
                      <div className="stats-summary">
                        <div className="stat-card">
                          <div className="stat-value">{responses.length}</div>
                          <div className="stat-label">Всего ответов</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">
                            {formatDate(selectedSurvey.startDate) ||
                              "Не указано"}
                          </div>
                          <div className="stat-label">Дата начала</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">
                            {formatDate(selectedSurvey.endDate) || "Не указано"}
                          </div>
                          <div className="stat-label">Дата окончания</div>
                        </div>
                      </div>

                      <div className="questions-statistics">
                        <h4>Статистика по вопросам</h4>

                        {Object.entries(getQuestionsByCategory()).map(
                          ([category, questions]) => (
                            <div key={category} className="category-section">
                              <h5 className="category-title">{category}</h5>
                              {questions.map(question => (
                                <div
                                  key={question.id}
                                  className="question-stat-card"
                                >
                                  <div className="question-text">
                                    {question.orderNumber}. {question.text}
                                    {question.required && (
                                      <span className="required-mark">*</span>
                                    )}
                                  </div>

                                  <div className="question-meta">
                                    <div className="question-type">
                                      {question.type === "SINGLE_CHOICE" &&
                                        "Одиночный выбор"}
                                      {question.type === "MULTIPLE_CHOICE" &&
                                        "Множественный выбор"}
                                      {question.type === "TEXT" &&
                                        "Текстовый ответ"}
                                      {question.type === "RATING" && "Оценка"}
                                    </div>
                                  </div>

                                  <div className="answer-content">
                                    {Array.isArray(responses) &&
                                    responses.length > 0 ? (
                                      renderQuestionStats(question.id)
                                    ) : (
                                      <div className="no-data">
                                        Нет данных для анализа
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="response-details">
                      <div className="response-nav">
                        <select
                          className="response-selector"
                          value={responseDetails.id}
                          onChange={e => {
                            const selected = responses.find(
                              r => r.id === Number(e.target.value)
                            )
                            if (selected) setResponseDetails(selected)
                          }}
                        >
                          {responses.map((response, index) => (
                            <option key={response.id} value={response.id}>
                              Ответ {index + 1} -{" "}
                              {response.respondent?.name || "Аноним"} (
                              {formatDate(response.createdAt)})
                            </option>
                          ))}
                        </select>

                        <div className="response-navigation">
                          <button
                            className="nav-button"
                            disabled={responses.indexOf(responseDetails) === 0}
                            onClick={() => {
                              const currentIndex =
                                responses.indexOf(responseDetails)
                              if (currentIndex > 0) {
                                setResponseDetails(responses[currentIndex - 1])
                              }
                            }}
                          >
                            &larr; Предыдущий
                          </button>
                          <button
                            className="nav-button"
                            disabled={
                              responses.indexOf(responseDetails) ===
                              responses.length - 1
                            }
                            onClick={() => {
                              const currentIndex =
                                responses.indexOf(responseDetails)
                              if (currentIndex < responses.length - 1) {
                                setResponseDetails(responses[currentIndex + 1])
                              }
                            }}
                          >
                            Следующий &rarr;
                          </button>
                        </div>
                      </div>

                      <div className="respondent-info">
                        <h4>Информация о респонденте</h4>
                        <div className="info-row">
                          <span className="info-label">Имя:</span>
                          <span className="info-value">
                            {responseDetails.respondent?.name || "Не указано"}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Email:</span>
                          <span className="info-value">
                            {responseDetails.respondent?.email || "Не указано"}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Дата ответа:</span>
                          <span className="info-value">
                            {formatDate(responseDetails.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="response-answers">
                        <h4>Ответы на вопросы</h4>

                        {Object.entries(getQuestionsByCategory()).map(
                          ([category, questions]) => {
                            // Проверяем, есть ли ответы на вопросы этой категории
                            const hasAnswers = questions.some(
                              question =>
                                responseDetails.answers &&
                                responseDetails.answers.some(
                                  a => a.questionId === question.id
                                )
                            )

                            if (!hasAnswers) return null

                            return (
                              <div key={category} className="answer-category">
                                <h5 className="category-title">{category}</h5>
                                {questions.map(question => {
                                  const answer =
                                    responseDetails.answers &&
                                    responseDetails.answers.find(
                                      a => a.questionId === question.id
                                    )

                                  if (!answer) return null

                                  return (
                                    <div
                                      key={question.id}
                                      className="answer-item"
                                    >
                                      <div className="question-text">
                                        {question.orderNumber}. {question.text}
                                        {question.required && (
                                          <span className="required-mark">
                                            *
                                          </span>
                                        )}
                                      </div>

                                      <div className="question-meta">
                                        <div className="question-type">
                                          {question.type === "SINGLE_CHOICE" &&
                                            "Одиночный выбор"}
                                          {question.type ===
                                            "MULTIPLE_CHOICE" &&
                                            "Множественный выбор"}
                                          {question.type === "TEXT" &&
                                            "Текстовый ответ"}
                                          {question.type === "RATING" &&
                                            "Оценка"}
                                        </div>
                                      </div>

                                      <div className="answer-content">
                                        {question.type === "TEXT" && (
                                          <div className="text-answer">
                                            {answer.answer || "Нет ответа"}
                                          </div>
                                        )}

                                        {question.type === "SINGLE_CHOICE" && (
                                          <div className="choice-answer">
                                            {answer.answer}
                                          </div>
                                        )}

                                        {question.type ===
                                          "MULTIPLE_CHOICE" && (
                                          <div className="multiple-choice-answer">
                                            {(Array.isArray(answer.answer)
                                              ? answer.answer
                                              : answer.answer
                                              ? [answer.answer] // Если ответ не массив, но существует - преобразуем в массив
                                              : []
                                            ).map((option, i) => (
                                              <div
                                                key={i}
                                                className="choice-item"
                                              >
                                                {option}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {question.type === "RATING" && (
                                          <div className="rating-answer">
                                            <div className="rating-value">
                                              {answer.answer} / 10
                                            </div>
                                            <div className="rating-stars">
                                              {[
                                                1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                                              ].map(star => (
                                                <span
                                                  key={star}
                                                  className={`star ${
                                                    parseInt(answer.answer) >=
                                                    star
                                                      ? "filled"
                                                      : ""
                                                  }`}
                                                >
                                                  ★
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatisticsPage
