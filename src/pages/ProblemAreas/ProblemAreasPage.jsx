import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/common/Sidebar"
import { authService } from "../../api/auth"
import { surveyService } from "../../api/survey"
import "./ProblemAreasPage.css"

const ProblemAreasPage = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [surveyAnalysis, setSurveyAnalysis] = useState([])
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
    loadSurveysAndAnalyze()
  }, [navigate])

  const loadSurveysAndAnalyze = async () => {
    try {
      setLoading(true)
      setError(null)

      // Получаем все опросники
      const surveysData = await surveyService.getAllSurveys()
      console.log("Загруженные опросники:", surveysData)

      // Извлекаем массив опросников из ответа API
      let surveys = []
      if (Array.isArray(surveysData)) {
        surveys = surveysData
      } else if (surveysData?.content && Array.isArray(surveysData.content)) {
        surveys = surveysData.content
      }

      setSurveys(surveys)
      console.log("Извлеченные опросники:", surveys)

      // Анализируем каждый опросник
      const analysisResults = []

      for (const survey of surveys) {
        try {
          // Получаем ответы для каждого опросника
          const responses = await surveyService.getSurveyResponses(survey.id)
          console.log(
            `Ответы для опросника "${survey.title}" (ID: ${survey.id}):`,
            responses
          )

          // Вычисляем средний балл
          const averageScore = calculateAverageScore(responses)

          // Определяем уровень проблемности
          const problemLevel = determineProblemLevel(averageScore)

          const analysis = {
            surveyId: survey.id,
            surveyTitle: survey.title,
            responsesCount: responses?.length || 0,
            averageScore: averageScore,
            problemLevel: problemLevel,
            responses: responses,
          }

          analysisResults.push(analysis)
          console.log(`Анализ опросника "${survey.title}":`, analysis)
        } catch (responseError) {
          console.error(
            `Ошибка при получении ответов для опросника ${survey.id}:`,
            responseError
          )

          // Добавляем запись об ошибке
          analysisResults.push({
            surveyId: survey.id,
            surveyTitle: survey.title,
            responsesCount: 0,
            averageScore: null,
            problemLevel: "Нет данных",
            error: responseError.message,
          })
        }
      }

      setSurveyAnalysis(analysisResults)
      console.log("Полный анализ всех опросников:", analysisResults)
    } catch (error) {
      console.error("Ошибка при загрузке опросников:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageScore = responses => {
    if (!responses || responses.length === 0) {
      return null
    }

    let totalScore = 0
    let numericAnswersCount = 0

    responses.forEach(response => {
      if (response.answers && Array.isArray(response.answers)) {
        response.answers.forEach(answer => {
          if (
            answer.numericAnswer !== null &&
            answer.numericAnswer !== undefined
          ) {
            totalScore += answer.numericAnswer
            numericAnswersCount++
          }
        })
      }
    })

    if (numericAnswersCount === 0) {
      return null
    }

    return totalScore / numericAnswersCount
  }

  const determineProblemLevel = averageScore => {
    if (averageScore === null) {
      return "Нет рейтинговых ответов"
    }

    if (averageScore >= 8.5) {
      return "Отлично"
    } else if (averageScore >= 7.0) {
      return "Хорошо"
    } else if (averageScore >= 4.0) {
      return "Удовлетворительно"
    } else if (averageScore >= 2.0) {
      return "Проблемно"
    } else {
      return "Критично"
    }
  }

  const getProblemLevelColor = level => {
    switch (level) {
      case "Отлично":
        return "#4CAF50"
      case "Хорошо":
        return "#8BC34A"
      case "Удовлетворительно":
        return "#FFC107"
      case "Проблемно":
        return "#FF9800"
      case "Критично":
        return "#F44336"
      default:
        return "#9E9E9E"
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>Проблемные места</h1>
          <p>Анализ опросников на основе среднего балла рейтинговых ответов</p>
        </div>

        {loading ? (
          <div className="loading">Загрузка анализа опросников...</div>
        ) : error ? (
          <div className="error">Ошибка: {error}</div>
        ) : (
          <div className="analysis-table-container">
            <div className="problem-levels-legend">
              <h3>Уровни проблемности по среднему баллу (шкала 0-10)</h3>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-badge low-level">Низкий (7.0+)</span>
                  <span className="legend-description">Отлично / Хорошо</span>
                </div>
                <div className="legend-item">
                  <span className="legend-badge medium-level">
                    Средний (4.0-6.9)
                  </span>
                  <span className="legend-description">Удовлетворительно</span>
                </div>
                <div className="legend-item">
                  <span className="legend-badge high-level">
                    Высокий (&lt;4.0)
                  </span>
                  <span className="legend-description">
                    Проблемно / Критично
                  </span>
                </div>
              </div>
            </div>

            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Опросник</th>
                  <th>Количество ответов</th>
                  <th>Средний балл</th>
                  <th>Уровень проблемности</th>
                </tr>
              </thead>
              <tbody>
                {surveyAnalysis.map(analysis => (
                  <tr key={analysis.surveyId}>
                    <td className="survey-title">{analysis.surveyTitle}</td>
                    <td className="responses-count">
                      {analysis.responsesCount}
                    </td>
                    <td className="average-score">
                      {analysis.averageScore !== null
                        ? analysis.averageScore.toFixed(2)
                        : "Нет данных"}
                    </td>
                    <td className="problem-level">
                      <span
                        className="problem-level-badge"
                        style={{
                          backgroundColor: getProblemLevelColor(
                            analysis.problemLevel
                          ),
                        }}
                      >
                        {analysis.problemLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {surveyAnalysis.length === 0 && (
              <div className="no-data">Нет данных для анализа</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProblemAreasPage
