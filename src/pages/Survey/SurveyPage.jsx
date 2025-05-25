import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { surveyService } from "../../api/survey"
import { authService } from "../../api/auth"
import "./SurveyStyles.css"

const SurveyPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  // const location = useLocation()
  const [isPreview, setIsPreview] = useState(false)

  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [respondentData, setRespondentData] = useState({
    name: "",
    email: "",
    consent: false,
  })
  const [userInfoSubmitted, setUserInfoSubmitted] = useState(false)

  useEffect(() => {
    // Проверяем, является ли это предпросмотром от администратора
    const checkIfPreview = async () => {
      const user = authService.getCurrentUser()
      const isAdmin = user && (user.role === "ADMIN" || user.role === "MANAGER")
      setIsPreview(isAdmin)
      fetchSurvey(isAdmin)
    }

    checkIfPreview()
  }, [id])

  const fetchSurvey = async isAdmin => {
    try {
      setLoading(true)

      // Выбор метода API в зависимости от того, предпросмотр это или нет
      let surveyData

      // Если это предпросмотр администратора, используем метод с авторизацией
      if (isAdmin) {
        surveyData = await surveyService.getSurveyById(id)
        setUserInfoSubmitted(true) // Для админа пропускаем первый этап
      } else {
        surveyData = await surveyService.getPublicSurveyById(id)
      }

      console.log("Получены данные опросника:", surveyData)

      if (!surveyData) {
        setError("Опросник не найден или недоступен")
        setLoading(false)
        return
      }

      // Проверка статуса нужна только если это не предпросмотр
      if (
        !isAdmin &&
        surveyData.status !== "ACTIVE" &&
        surveyData.status !== "активный"
      ) {
        setError(
          `Опросник в данный момент недоступен (статус: ${surveyData.status})`
        )
        setLoading(false)
        return
      }

      setSurvey(surveyData)

      // Инициализируем ответы для обязательных вопросов
      const initialAnswers = {}
      surveyData.questions.forEach(question => {
        if (question.required) {
          initialAnswers[question.id] =
            question.type === "MULTIPLE_CHOICE"
              ? []
              : question.type === "TEXT"
              ? ""
              : null
        }
      })
      setAnswers(initialAnswers)

      setLoading(false)
    } catch (err) {
      console.error("Ошибка при загрузке опросника:", err)
      setError(
        "Не удалось загрузить опросник. Возможно, он был удален или недоступен."
      )
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    const question = survey.questions.find(q => q.id === questionId)

    if (question.type === "MULTIPLE_CHOICE") {
      const currentAnswers = answers[questionId] || []

      if (currentAnswers.includes(value)) {
        // Если значение уже выбрано, удаляем его
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter(item => item !== value),
        })
      } else {
        // Иначе добавляем новое значение
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, value],
        })
      }
    } else {
      // Для одиночного выбора, текста и оценки
      setAnswers({
        ...answers,
        [questionId]: value,
      })
    }
  }

  const handleRespondentDataChange = e => {
    const { name, value, type, checked } = e.target
    setRespondentData({
      ...respondentData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleUserInfoSubmit = e => {
    e.preventDefault()

    // Простая валидация данных
    if (!respondentData.name.trim()) {
      alert("Пожалуйста, укажите ваше имя")
      return
    }

    if (!respondentData.email.trim()) {
      alert("Пожалуйста, укажите ваш email")
      return
    }

    if (!respondentData.consent) {
      alert("Для прохождения опроса необходимо согласие на обработку данных")
      return
    }

    // Если все данные заполнены, начинаем опрос
    setUserInfoSubmitted(true)
  }

  const nextQuestion = () => {
    const currentQuestion = survey.questions[currentQuestionIndex]

    // Проверяем, дан ли ответ на обязательный вопрос
    if (currentQuestion.required) {
      const answer = answers[currentQuestion.id]
      if (
        answer === null ||
        answer === undefined ||
        (Array.isArray(answer) && answer.length === 0) ||
        (typeof answer === "string" && answer.trim() === "")
      ) {
        alert(`Пожалуйста, ответьте на вопрос: "${currentQuestion.text}"`)
        return
      }
    }

    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      window.scrollTo(0, 0)
    }
  }

  const validateForm = () => {
    // Проверяем, есть ли ответы на все обязательные вопросы
    const unansweredRequired = survey.questions
      .filter(q => q.required)
      .some(q => {
        const answer = answers[q.id]
        return (
          answer === null ||
          answer === undefined ||
          (Array.isArray(answer) && answer.length === 0) ||
          (typeof answer === "string" && answer.trim() === "")
        )
      })

    if (unansweredRequired) {
      alert("Пожалуйста, ответьте на все обязательные вопросы.")
      return false
    }

    return true
  }

  const submitSurvey = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)

      const surveyResponse = {
        surveyId: survey.id,
        respondent: {
          name: respondentData.name,
          email: respondentData.email,
          consent: respondentData.consent,
        },
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          answer: value,
        })),
      }

      console.log("Отправка ответов:", surveyResponse)
      await surveyService.submitSurveyResponse(surveyResponse)

      setSubmitted(true)
      window.scrollTo(0, 0)
    } catch (err) {
      console.error("Ошибка при отправке ответов:", err)
      alert(
        "Произошла ошибка при отправке ответов. Пожалуйста, попробуйте еще раз."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestionContent = question => {
    switch (question.type) {
      case "SINGLE_CHOICE":
        return (
          <div className="question-options">
            {question.options.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case "MULTIPLE_CHOICE":
        return (
          <div className="question-options">
            {question.options.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="checkbox"
                  name={`question_${question.id}_${index}`}
                  value={option}
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={() => handleAnswerChange(question.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case "TEXT":
        return (
          <div className="question-text">
            <textarea
              className="text-answer"
              value={answers[question.id] || ""}
              onChange={e => handleAnswerChange(question.id, e.target.value)}
              placeholder="Введите ваш ответ здесь..."
              rows={5}
              style={{ marginRight: "40px" }}
            />
          </div>
        )

      case "RATING":
        return (
          <div className="rating-container">
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                <button
                  key={rating}
                  className={`rating-button ${
                    answers[question.id] === rating ? "selected" : ""
                  }`}
                  onClick={() => handleAnswerChange(question.id, rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="rating-labels">
              <span>Очень плохо</span>
              <span>Отлично</span>
            </div>
          </div>
        )

      default:
        return <p>Неподдерживаемый тип вопроса.</p>
    }
  }

  const renderUserInfoForm = () => {
    return (
      <div className="user-info-form">
        <h2>Прежде чем начать опрос</h2>
        <p className="form-note">
          Пожалуйста, представьтесь, чтобы мы могли учесть ваше мнение
        </p>

        <form onSubmit={handleUserInfoSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Ваше имя: <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={respondentData.name}
              onChange={handleRespondentDataChange}
              placeholder="Иванов Иван"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email: <span className="required-mark">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={respondentData.email}
              onChange={handleRespondentDataChange}
              placeholder="example@mail.ru"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={respondentData.consent}
              onChange={handleRespondentDataChange}
              required
            />
            <label htmlFor="consent">
              Я даю согласие на обработку моих персональных данных{" "}
              <span className="required-mark">*</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Начать опрос
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="survey-container">
        <div className="loading-indicator">Загрузка опросника...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="survey-container">
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

  if (!survey) {
    return (
      <div className="survey-container">
        <div className="error-message">
          <h2>Опросник не найден</h2>
          <button className="back-button" onClick={() => navigate("/")}>
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="survey-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Спасибо за участие в опросе!</h2>
          <p>Ваши ответы помогут нам улучшить наш сервис.</p>
          <button className="primary-button" onClick={() => navigate("/")}>
            На главную
          </button>
        </div>
      </div>
    )
  }

  // Если пользователь еще не ввел информацию о себе и это не предпросмотр, показываем форму
  if (!userInfoSubmitted && !isPreview) {
    return (
      <div className="survey-container">
        <header className="survey-header">
          <h1>{survey.title}</h1>
          {survey.description && (
            <p className="survey-description">{survey.description}</p>
          )}
        </header>

        <main className="survey-content">{renderUserInfoForm()}</main>
      </div>
    )
  }

  const currentQuestion = survey.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1

  return (
    <div className="survey-container">
      {isPreview && (
        <div className="preview-notification">
          Вы просматриваете опрос в режиме предпросмотра
          <button
            className="back-to-dashboard"
            onClick={() => navigate("/dashboard")}
          >
            Вернуться в панель управления
          </button>
        </div>
      )}

      <header className="survey-header">
        <h1>{survey.title}</h1>
        {survey.description && (
          <p className="survey-description">{survey.description}</p>
        )}
      </header>

      <main className="survey-content">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / survey.questions.length) * 100
              }%`,
            }}
          ></div>
        </div>
        <div className="progress-text">
          Вопрос {currentQuestionIndex + 1} из {survey.questions.length}
        </div>

        <div className="question-card">
          <h2 className="question-text">
            {currentQuestion.text}
            {currentQuestion.required && (
              <span className="required-mark">*</span>
            )}
          </h2>

          {renderQuestionContent(currentQuestion)}
        </div>

        <div className="navigation-buttons">
          {currentQuestionIndex > 0 && (
            <button className="secondary-button" onClick={prevQuestion}>
              Назад
            </button>
          )}

          {!isLastQuestion ? (
            <button className="primary-button" onClick={nextQuestion}>
              Далее
            </button>
          ) : (
            <>
              {isPreview ? (
                <button
                  className="primary-button"
                  onClick={() => navigate("/dashboard")}
                >
                  Завершить предпросмотр
                </button>
              ) : (
                <button
                  className="primary-button"
                  onClick={submitSurvey}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Отправка...
                    </>
                  ) : (
                    "Завершить опрос"
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default SurveyPage
