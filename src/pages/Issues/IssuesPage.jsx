import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/common/Sidebar"
import { authService } from "../../api/auth"
import { surveyService } from "../../api/survey"
import "./IssuesPage.css"

const IssuesPage = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      navigate("/login")
      return
    }
    setCurrentUser(user)

    // Загрузка опросников и их рейтингов
    const loadSurveysWithRatings = async () => {
      try {
        setLoading(true)
        console.log("Начинаем загрузку опросников...")
        // Получаем все опросники
        const surveysResponse = await surveyService.getAllSurveys()
        console.log("Ответ API опросников:", surveysResponse)

        // Проверяем формат данных и преобразуем в массив при необходимости
        let surveysData = []

        if (Array.isArray(surveysResponse)) {
          surveysData = surveysResponse
        } else if (surveysResponse && typeof surveysResponse === "object") {
          // Проверяем различные возможные структуры ответа
          if (Array.isArray(surveysResponse.content)) {
            surveysData = surveysResponse.content
          } else if (Array.isArray(surveysResponse.data)) {
            surveysData = surveysResponse.data
          } else if (Array.isArray(surveysResponse.items)) {
            surveysData = surveysResponse.items
          } else if (Array.isArray(surveysResponse.surveys)) {
            surveysData = surveysResponse.surveys
          } else {
            console.error("Неподдерживаемая структура данных:", surveysResponse)
            setError("Неподдерживаемый формат данных от API")
            setLoading(false)
            return
          }
        } else {
          console.error("Неподдерживаемый тип данных:", typeof surveysResponse)
          setError("Некорректный ответ от API")
          setLoading(false)
          return
        }

        console.log("Обработанные данные опросников:", surveysData)

        // Для каждого опросника получаем ответы и вычисляем средний рейтинг
        const surveysWithRatings = await Promise.all(
          surveysData.map(async survey => {
            try {
              console.log(
                `Начинаем обработку ответов для опросника ${survey.id}`
              )
              // Получаем ответы на опросник
              const responsesData = await surveyService.getSurveyResponses(
                survey.id
              )
              console.log(
                `Сырые данные ответов для опросника ${survey.id}:`,
                responsesData
              )

              // Проверяем формат данных ответов
              let responses = []
              if (Array.isArray(responsesData)) {
                responses = responsesData
              } else if (responsesData && typeof responsesData === "object") {
                if (Array.isArray(responsesData.content)) {
                  responses = responsesData.content
                } else if (Array.isArray(responsesData.data)) {
                  responses = responsesData.data
                } else if (Array.isArray(responsesData.responses)) {
                  responses = responsesData.responses
                } else {
                  console.warn(
                    `Неподдерживаемая структура данных ответов для опросника ${survey.id}:`,
                    responsesData
                  )
                  responses = []
                }
              }

              console.log(`Ответы для опросника ${survey.id}:`, responses)

              // Находим среди ответов те, которые относятся к вопросам типа RATING
              let ratingSum = 0
              let ratingCount = 0

              // Перебираем все ответы и находим рейтинговые вопросы
              responses.forEach(response => {
                if (response.answers && Array.isArray(response.answers)) {
                  // Обрабатываем ответы
                  response.answers.forEach(answer => {
                    // Ищем ответы с числовым значением (numericAnswer)
                    if (
                      answer.numericAnswer !== null &&
                      answer.numericAnswer !== undefined
                    ) {
                      // Добавляем значение в сумму
                      ratingSum += parseInt(answer.numericAnswer, 10)
                      ratingCount++
                      console.log(
                        `Найден числовой ответ: ${answer.numericAnswer}, вопрос ID: ${answer.questionId}`
                      )
                    }
                  })
                }
              })

              // Выводим информацию о результатах подсчета
              console.log(
                `Опросник ${
                  survey.id
                }: рейтинг ${ratingSum}/${ratingCount}, средний: ${
                  ratingCount > 0 ? ratingSum / ratingCount : 0
                }`
              )

              // Вычисляем средний рейтинг
              const averageRating =
                ratingCount > 0 ? ratingSum / ratingCount : 0

              // Определяем уровень проблемности на основе среднего рейтинга
              // Используем шкалу от 1 до 10, где:
              // 1-3 - высокий уровень проблемности
              // 4-6 - средний уровень проблемности
              // 7-10 - низкий уровень проблемности
              let issueLevel = "низкий"
              if (averageRating >= 1 && averageRating <= 3) {
                issueLevel = "высокий"
              } else if (averageRating > 3 && averageRating <= 6) {
                issueLevel = "средний"
              } else if (averageRating > 6 && averageRating <= 10) {
                issueLevel = "низкий"
              } else {
                // Если среднее значение 0 или вне диапазона
                issueLevel = "неизвестно"
              }

              return {
                ...survey,
                averageRating: averageRating.toFixed(1),
                issueLevel,
                responseCount: responses.length,
              }
            } catch (error) {
              console.error(
                `Ошибка при получении ответов для опросника ${survey.id}:`,
                error
              )
              return {
                ...survey,
                averageRating: "Н/Д",
                issueLevel: "неизвестно",
                responseCount: 0,
              }
            }
          })
        )

        setSurveys(surveysWithRatings)
        setLoading(false)
      } catch (error) {
        console.error("Ошибка при загрузке опросников:", error)
        setError("Не удалось загрузить данные опросников")
        setLoading(false)
      }
    }

    loadSurveysWithRatings()
  }, [navigate])

  // Функция для получения класса на основе уровня проблемности
  const getIssueLevelClass = level => {
    switch (level) {
      case "высокий":
        return "issue-level-high"
      case "средний":
        return "issue-level-medium"
      case "низкий":
        return "issue-level-low"
      default:
        return "issue-level-unknown"
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} />
      <div className="dashboard-content">
        <div className="issues-header">
          <h1>Проблемные места</h1>
        </div>

        {loading ? (
          <div className="loading-indicator">Загрузка данных...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : surveys.length === 0 ? (
          <div className="no-data-message">Нет доступных опросников</div>
        ) : (
          <div className="issues-container">
            <div className="issues-info">
              <h3>Уровни проблемности</h3>
              <div className="issue-levels-legend">
                <div className="legend-item">
                  <span className="issue-level issue-level-high">высокий</span>
                  <span className="legend-text">Средняя оценка 1-3</span>
                </div>
                <div className="legend-item">
                  <span className="issue-level issue-level-medium">
                    средний
                  </span>
                  <span className="legend-text">Средняя оценка 4-6</span>
                </div>
                <div className="legend-item">
                  <span className="issue-level issue-level-low">низкий</span>
                  <span className="legend-text">Средняя оценка 7-10</span>
                </div>
              </div>
            </div>

            <div className="issues-table-container">
              <table className="issues-table">
                <thead>
                  <tr>
                    <th>Название опросника</th>
                    <th>Средняя оценка</th>
                    <th>Уровень проблемности</th>
                    <th>Количество ответов</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map(survey => (
                    <tr key={survey.id}>
                      <td>{survey.title}</td>
                      <td>{survey.averageRating}</td>
                      <td>
                        <span
                          className={`issue-level ${getIssueLevelClass(
                            survey.issueLevel
                          )}`}
                        >
                          {survey.issueLevel}
                        </span>
                      </td>
                      <td>{survey.responseCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IssuesPage
