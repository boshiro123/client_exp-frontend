import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/common/Sidebar"
import { authService } from "../../api/auth"
import { surveyService } from "../../api/survey"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts"
import "./IssuesPage.css"

const IssuesPage = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [surveys, setSurveys] = useState([])
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    csat: null,
    nps: null,
    ces: null,
    aspectsData: [],
  })
  const navigate = useNavigate()

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      navigate("/login")
      return
    }
    setCurrentUser(user)
    loadSurveys()
  }, [navigate])

  const loadSurveys = async () => {
    try {
      setLoading(true)
      const surveysResponse = await surveyService.getAllSurveys()

      let surveysData = []
      if (Array.isArray(surveysResponse)) {
        surveysData = surveysResponse
      } else if (surveysResponse?.content) {
        surveysData = surveysResponse.content
      }

      setSurveys(surveysData)
      if (surveysData.length > 0) {
        // Автоматически выбираем первый опросник
        handleSurveySelect(surveysData[0])
      }
      setLoading(false)
    } catch (error) {
      console.error("Ошибка при загрузке опросников:", error)
      setError("Не удалось загрузить данные опросников")
      setLoading(false)
    }
  }

  const handleSurveySelect = async survey => {
    setSelectedSurvey(survey)
    setLoading(true)

    try {
      // Получаем ответы на опросник
      const responsesData = await surveyService.getSurveyResponses(survey.id)
      let responses = Array.isArray(responsesData)
        ? responsesData
        : responsesData?.content || []

      console.log("Responses for survey:", survey.id, responses)
      console.log("Survey questions:", survey.questions)

      // Вычисляем метрики
      const calculatedMetrics = calculateMetrics(responses, survey.questions)
      setMetrics(calculatedMetrics)
    } catch (error) {
      console.error("Ошибка при получении ответов:", error)
      setError("Не удалось загрузить ответы на опросник")
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (responses, questions) => {
    if (!responses || !questions)
      return { csat: null, nps: null, ces: null, aspectsData: [] }

    // Найдем нужные вопросы по тексту
    const csatQuestion = questions.find(
      q =>
        q.text.toLowerCase().includes("удовлетворенность") &&
        q.text.toLowerCase().includes("шкале от 1 до 5")
    )

    const npsQuestion = questions.find(
      q =>
        q.text.toLowerCase().includes("порекомендуете") ||
        q.text.toLowerCase().includes("друзьям")
    )

    const cesQuestion = questions.find(
      q =>
        q.text.toLowerCase().includes("удобство") &&
        q.text.toLowerCase().includes("веб")
    )

    const aspectsQuestion = questions.find(
      q =>
        q.text.toLowerCase().includes("аспекты") &&
        q.text.toLowerCase().includes("понравились")
    )

    console.log("Found questions:", {
      csatQuestion,
      npsQuestion,
      cesQuestion,
      aspectsQuestion,
    })

    let csat = null
    let nps = null
    let ces = null
    let aspectsData = []

    // Обрабатываем все ответы
    responses.forEach(response => {
      if (!response.answers) return

      response.answers.forEach(answer => {
        // CSAT метрика
        if (csatQuestion && answer.questionId === csatQuestion.id) {
          if (!csat) {
            csat = { satisfied: 0, neutral: 0, dissatisfied: 0, total: 0 }
          }

          // Извлекаем число из ответа (например, "4 – Скорее доволен" -> 4)
          const rating = extractRating(answer.answer)
          if (rating >= 4) csat.satisfied++
          else if (rating === 3) csat.neutral++
          else if (rating >= 1) csat.dissatisfied++
          csat.total++
        }

        // NPS метрика
        if (npsQuestion && answer.questionId === npsQuestion.id) {
          if (!nps) {
            nps = { promoters: 0, neutrals: 0, detractors: 0, total: 0 }
          }

          const rating = parseInt(answer.answer) || 0
          if (rating >= 9) nps.promoters++
          else if (rating >= 7) nps.neutrals++
          else nps.detractors++
          nps.total++
        }

        // CES метрика
        if (cesQuestion && answer.questionId === cesQuestion.id) {
          if (!ces) {
            ces = { total: 0, sum: 0, count: 0 }
          }

          const rating = extractRating(answer.answer)
          ces.sum += rating
          ces.count++
        }

        // Аспекты услуги
        if (aspectsQuestion && answer.questionId === aspectsQuestion.id) {
          const aspects = Array.isArray(answer.answer)
            ? answer.answer
            : [answer.answer]
          aspects.forEach(aspect => {
            if (aspect && aspect.trim()) {
              const existing = aspectsData.find(item => item.name === aspect)
              if (existing) {
                existing.count++
              } else {
                aspectsData.push({ name: aspect, count: 1 })
              }
            }
          })
        }
      })
    })

    // Финальные вычисления
    if (csat) {
      csat.percentage =
        csat.total > 0 ? Math.round((csat.satisfied / csat.total) * 100) : 0
    }

    if (nps) {
      nps.score =
        nps.total > 0
          ? Math.round(((nps.promoters - nps.detractors) / nps.total) * 100)
          : 0
    }

    if (ces) {
      ces.score = ces.count > 0 ? (ces.sum / ces.count).toFixed(2) : 0
    }

    console.log("Calculated metrics:", { csat, nps, ces, aspectsData })

    return { csat, nps, ces, aspectsData }
  }

  // Функция для извлечения числового рейтинга из текста ответа
  const extractRating = answerText => {
    if (!answerText) return 0
    const match = answerText.match(/^(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  // Цвета для графиков
  const COLORS = {
    satisfied: "#4CAF50",
    neutral: "#FF9800",
    dissatisfied: "#F44336",
    promoters: "#4CAF50",
    detractors: "#F44336",
    neutrals: "#FF9800",
  }

  const getNPSColor = score => {
    if (score >= 70) return "#4CAF50" // зеленый
    if (score >= 30) return "#FF9800" // желтый
    return "#F44336" // красный
  }

  const renderCSATChart = () => {
    if (!metrics.csat) return <div className="no-data">Нет данных для CSAT</div>

    const data = [
      {
        name: "Довольные",
        value: metrics.csat.satisfied,
        color: COLORS.satisfied,
      },
      {
        name: "Нейтральные",
        value: metrics.csat.neutral,
        color: COLORS.neutral,
      },
      {
        name: "Недовольные",
        value: metrics.csat.dissatisfied,
        color: COLORS.dissatisfied,
      },
    ].filter(item => item.value > 0)

    return (
      <div className="metric-card">
        <h3>CSAT (Customer Satisfaction Score)</h3>
        <div className="metric-main">
          <div className="metric-score">
            <span className="score-value">{metrics.csat.percentage}%</span>
            <span className="score-label">довольных клиентов</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="metric-details">
          <div className="detail-item">
            <span className="detail-label">Довольные (4-5):</span>
            <span className="detail-value">{metrics.csat.satisfied}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Нейтральные (3):</span>
            <span className="detail-value">{metrics.csat.neutral}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Недовольные (1-2):</span>
            <span className="detail-value">{metrics.csat.dissatisfied}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderNPSChart = () => {
    if (!metrics.nps) return <div className="no-data">Нет данных для NPS</div>

    const data = [
      {
        name: "Промоутеры",
        value: metrics.nps.promoters,
        color: COLORS.promoters,
      },
      { name: "Нейтралы", value: metrics.nps.neutrals, color: COLORS.neutrals },
      {
        name: "Детракторы",
        value: metrics.nps.detractors,
        color: COLORS.detractors,
      },
    ].filter(item => item.value > 0)

    const npsLevel =
      metrics.nps.score >= 70
        ? "отличный"
        : metrics.nps.score >= 30
        ? "хороший"
        : "удовлетворительный"

    return (
      <div className="metric-card">
        <h3>NPS (Net Promoter Score)</h3>
        <div className="metric-main">
          <div className="metric-score">
            <span
              className="score-value"
              style={{ color: getNPSColor(metrics.nps.score) }}
            >
              {metrics.nps.score}
            </span>
            <span className="score-label">{npsLevel} результат</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="metric-details">
          <div className="detail-item">
            <span className="detail-label">Промоутеры (9-10):</span>
            <span className="detail-value">{metrics.nps.promoters}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Нейтралы (7-8):</span>
            <span className="detail-value">{metrics.nps.neutrals}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Детракторы (0-6):</span>
            <span className="detail-value">{metrics.nps.detractors}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderCESChart = () => {
    if (!metrics.ces) return <div className="no-data">Нет данных для CES</div>

    const cesLevel =
      metrics.ces.score <= 2
        ? "отлично"
        : metrics.ces.score <= 3
        ? "хорошо"
        : metrics.ces.score <= 4
        ? "удовлетворительно"
        : "плохо"

    const cesColor =
      metrics.ces.score <= 2
        ? "#4CAF50"
        : metrics.ces.score <= 3
        ? "#8BC34A"
        : metrics.ces.score <= 4
        ? "#FF9800"
        : "#F44336"

    return (
      <div className="metric-card">
        <h3>CES (Customer Effort Score)</h3>
        <div className="metric-main">
          <div className="metric-score">
            <span className="score-value" style={{ color: cesColor }}>
              {metrics.ces.score}
            </span>
            <span className="score-label">{cesLevel}</span>
          </div>
          <div className="ces-scale">
            <div className="scale-item">
              <div className="scale-number">1</div>
              <div className="scale-label">Очень легко</div>
            </div>
            <div className="scale-item">
              <div className="scale-number">2</div>
              <div className="scale-label">Скорее легко</div>
            </div>
            <div className="scale-item">
              <div className="scale-number">3</div>
              <div className="scale-label">Нейтрально</div>
            </div>
            <div className="scale-item">
              <div className="scale-number">4</div>
              <div className="scale-label">Скорее сложно</div>
            </div>
            <div className="scale-item">
              <div className="scale-number">5</div>
              <div className="scale-label">Очень сложно</div>
            </div>
            <div
              className="scale-indicator"
              style={{
                left: `${((metrics.ces.score - 1) / 4) * 100}%`,
                backgroundColor: cesColor,
              }}
            />
          </div>
        </div>
        <div className="metric-details">
          <p>
            Чем ближе значение к 1, тем проще клиентам взаимодействовать с
            компанией
          </p>
          <div className="detail-item">
            <span className="detail-label">Количество ответов:</span>
            <span className="detail-value">{metrics.ces.count}</span>
          </div>
        </div>
      </div>
    )
  }

  const renderAspectsChart = () => {
    if (!metrics.aspectsData.length)
      return <div className="no-data">Нет данных об аспектах</div>

    return (
      <div className="metric-card">
        <h3>Популярные аспекты услуги</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={metrics.aspectsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} />
      <div className="dashboard-content">
        <div className="issues-header">
          <h1>Анализ клиентского опыта</h1>
          <div className="survey-selector">
            <label htmlFor="survey-select">Выберите опросник:</label>
            <select
              id="survey-select"
              value={selectedSurvey?.id || ""}
              onChange={e => {
                const survey = surveys.find(
                  s => s.id === parseInt(e.target.value)
                )
                if (survey) handleSurveySelect(survey)
              }}
            >
              <option value="">Выберите опросник</option>
              {surveys.map(survey => (
                <option key={survey.id} value={survey.id}>
                  {survey.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">Загрузка данных...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : !selectedSurvey ? (
          <div className="no-data-message">Выберите опросник для анализа</div>
        ) : (
          <div className="metrics-container">
            <div className="metrics-grid">
              {renderCSATChart()}
              {renderNPSChart()}
              {renderCESChart()}
              {renderAspectsChart()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IssuesPage
