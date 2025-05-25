import React, { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/common/Sidebar"
import { authService } from "../../api/auth"
import { clientSegmentsService } from "../../api/client-segments"
import "./DashboardStyles.css"

// Вспомогательные функции форматирования данных
const getAgeGroupLabel = ageGroup => {
  const groups = {
    AGE_18_24: "18-24 года",
    AGE_25_34: "25-34 года",
    AGE_35_44: "35-44 года",
    AGE_45_54: "45-54 года",
    AGE_55_PLUS: "55+ лет",
  }
  return groups[ageGroup] || ageGroup || "—"
}

const getRegionLabel = region => {
  const regions = {
    BREST: "Брестская область",
    VITEBSK: "Витебская область",
    GOMEL: "Гомельская область",
    GRODNO: "Гродненская область",
    MINSK_REGION: "Минская область",
    MOGILEV: "Могилевская область",
    MINSK_CITY: "г. Минск",
  }
  return regions[region] || region || "—"
}

const formatDate = dateString => {
  if (!dateString) return "—"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  } catch (e) {
    return dateString
  }
}

// Функция для преобразования текстового ответа о возрасте в группу
const mapAgeAnswerToGroup = answer => {
  if (!answer) return null

  answer = answer.toLowerCase().trim()

  // Прямое соответствие для стандартных форматов возрастных групп
  if (answer.includes("до 18") || answer.includes("менее 18")) {
    return "AGE_UNDER_18"
  } else if (answer.includes("18–25") || answer.includes("18-25")) {
    return "AGE_18_24"
  } else if (answer.includes("26–35") || answer.includes("26-35")) {
    return "AGE_25_34"
  } else if (answer.includes("36–45") || answer.includes("36-45")) {
    return "AGE_35_44"
  } else if (answer.includes("46–60") || answer.includes("46-60")) {
    return "AGE_45_54"
  } else if (answer.includes("60+") || answer.includes("старше 60")) {
    return "AGE_55_PLUS"
  }

  // Пытаемся извлечь числовое значение из ответа
  const numMatch = answer.match(/\d+/)
  if (numMatch) {
    const age = parseInt(numMatch[0])
    if (age < 18) return "AGE_UNDER_18"
    if (age >= 18 && age <= 25) return "AGE_18_24"
    if (age >= 26 && age <= 35) return "AGE_25_34"
    if (age >= 36 && age <= 45) return "AGE_35_44"
    if (age >= 46 && age <= 60) return "AGE_45_54"
    if (age > 60) return "AGE_55_PLUS"
  }

  return null
}

// Функция для преобразования текстового ответа о регионе в стандартный формат
const mapRegionAnswer = answer => {
  if (!answer) return null

  answer = answer.toLowerCase().trim()

  if (answer.includes("брест")) {
    return "BREST"
  } else if (answer.includes("витебск")) {
    return "VITEBSK"
  } else if (answer.includes("гомель")) {
    return "GOMEL"
  } else if (answer.includes("гродн")) {
    return "GRODNO"
  } else if (answer.includes("минская") && answer.includes("область")) {
    return "MINSK_REGION"
  } else if (answer.includes("могилев")) {
    return "MOGILEV"
  } else if (answer.includes("минск") && !answer.includes("область")) {
    return "MINSK_CITY"
  }

  return null
}

const ClientSegmentsPage = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  // Состояние для фильтров
  const [filters, setFilters] = useState({
    ageGroup: "ALL",
    region: "ALL",
    profession: "",
  })

  // Идентификаторы вопросов согласно реальным данным из базы
  const AGE_QUESTION_ID = 16 // "Укажите ваш возраст"
  const REGION_QUESTION_ID = 17 // "Из какого региона Беларуси вы?"
  const PROFESSION_QUESTION_ID = 18 // "Ваша профессия или сфера деятельности"

  // Загружаем опции для фильтров
  const ageGroups = [
    { value: "ALL", label: "Все возрасты" },
    { value: "AGE_UNDER_18", label: "До 18 лет" },
    { value: "AGE_18_24", label: "18–25 лет" },
    { value: "AGE_25_34", label: "26–35 лет" },
    { value: "AGE_35_44", label: "36–45 лет" },
    { value: "AGE_45_54", label: "46–60 лет" },
    { value: "AGE_55_PLUS", label: "60+ лет" },
  ]

  const regions = [
    { value: "ALL", label: "Все регионы" },
    { value: "BREST", label: "Брестская область" },
    { value: "VITEBSK", label: "Витебская область" },
    { value: "GOMEL", label: "Гомельская область" },
    { value: "GRODNO", label: "Гродненская область" },
    { value: "MINSK_REGION", label: "Минская область" },
    { value: "MOGILEV", label: "Могилевская область" },
    { value: "MINSK_CITY", label: "г. Минск" },
  ]

  const navigate = useNavigate()

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      navigate("/login")
      return
    }
    setCurrentUser(user)

    fetchClients()
  }, [navigate])

  // Обрабатываем клиентов, извлекая информацию из их ответов
  const processedClients = useMemo(() => {
    console.log("🔄 Начинаем обработку клиентов...")
    console.log("📋 ID вопросов для маппинга:", {
      возраст: AGE_QUESTION_ID,
      регион: REGION_QUESTION_ID,
      профессия: PROFESSION_QUESTION_ID,
    })

    return clients.map((client, index) => {
      const answers = client.answers || []
      console.log(
        `👤 Обрабатываем клиента ${index + 1} (ID: ${client.id}):`,
        client.name
      )
      console.log(`  📝 Количество ответов: ${answers.length}`)

      // Извлекаем ответы на вопросы о возрасте, регионе и профессии
      let ageAnswer = null
      let regionAnswer = null
      let professionAnswer = null

      answers.forEach(answer => {
        console.log(`    ❓ Вопрос ID ${answer.questionId}: "${answer.answer}"`)

        if (answer.questionId === AGE_QUESTION_ID) {
          ageAnswer = answer.answer
          console.log(
            `    🎂 Найден ответ на вопрос о возрасте: "${ageAnswer}"`
          )
        } else if (answer.questionId === REGION_QUESTION_ID) {
          regionAnswer = answer.answer
          console.log(
            `    🗺️ Найден ответ на вопрос о регионе: "${regionAnswer}"`
          )
        } else if (answer.questionId === PROFESSION_QUESTION_ID) {
          professionAnswer = answer.answer
          console.log(
            `    💼 Найден ответ на вопрос о профессии: "${professionAnswer}"`
          )
        }
      })

      // Преобразуем текстовые ответы в значения для фильтров
      const mappedAgeGroup = mapAgeAnswerToGroup(ageAnswer)
      const mappedRegion = mapRegionAnswer(regionAnswer)

      console.log(`  🔄 Результаты маппинга для клиента ${client.name}:`)
      console.log(`    Возраст: "${ageAnswer}" → ${mappedAgeGroup}`)
      console.log(`    Регион: "${regionAnswer}" → ${mappedRegion}`)
      console.log(`    Профессия: "${professionAnswer}"`)

      return {
        ...client,
        // Переопределяем значения для фильтрации на основе ответов
        ageFromAnswer: mappedAgeGroup,
        regionFromAnswer: mappedRegion,
        professionFromAnswer: professionAnswer,
        // Сохраняем оригинальные ответы для отображения
        originalAgeAnswer: ageAnswer,
        originalRegionAnswer: regionAnswer,
        originalProfessionAnswer: professionAnswer,
      }
    })
  }, [clients, AGE_QUESTION_ID, REGION_QUESTION_ID, PROFESSION_QUESTION_ID])

  // При изменении фильтров обновляем отфильтрованный список
  useEffect(() => {
    if (processedClients.length > 0) {
      console.log("🔍 Применяем фильтры:", filters)

      // Фильтруем клиентов на основе ответов на вопросы
      const filtered = processedClients.filter(client => {
        console.log(`🔎 Проверяем клиента ${client.name}:`)
        console.log(
          `  Возраст: ${client.ageFromAnswer} (фильтр: ${filters.ageGroup})`
        )
        console.log(
          `  Регион: ${client.regionFromAnswer} (фильтр: ${filters.region})`
        )
        console.log(
          `  Профессия: ${client.professionFromAnswer} (фильтр: ${filters.profession})`
        )

        // Фильтр по возрастной группе на основе ответа на вопрос
        if (
          filters.ageGroup &&
          filters.ageGroup !== "ALL" &&
          client.ageFromAnswer !== filters.ageGroup
        ) {
          console.log(`  ❌ Отфильтрован по возрасту`)
          return false
        }

        // Фильтр по региону на основе ответа на вопрос
        if (
          filters.region &&
          filters.region !== "ALL" &&
          client.regionFromAnswer !== filters.region
        ) {
          console.log(`  ❌ Отфильтрован по региону`)
          return false
        }

        // Фильтр по профессии на основе ответа на вопрос
        if (filters.profession && client.professionFromAnswer) {
          const clientProfession = client.professionFromAnswer.toLowerCase()
          const searchProfession = filters.profession.toLowerCase()
          if (!clientProfession.includes(searchProfession)) {
            console.log(`  ❌ Отфильтрован по профессии`)
            return false
          }
        }

        console.log(`  ✅ Клиент прошел фильтры`)
        return true
      })

      console.log(
        `📊 Результат фильтрации: ${filtered.length} из ${processedClients.length} клиентов`
      )
      setFilteredClients(filtered)
    }
  }, [processedClients, filters])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const clientsData = await clientSegmentsService.getClientsWithAnswers()
      console.log("🔍 Полученные данные клиентов:", clientsData)
      console.log("📊 Количество клиентов:", clientsData.length)

      // Логируем структуру первого клиента для понимания формата данных
      if (clientsData.length > 0) {
        console.log("👤 Пример структуры клиента:", clientsData[0])
        if (clientsData[0].answers) {
          console.log("💬 Пример ответов клиента:", clientsData[0].answers)
        }
      }

      setClients(clientsData)
      setError(null)
    } catch (err) {
      setError(
        "Ошибка при загрузке клиентов: " +
          (err.response?.data?.message || err.message)
      )
      console.error("Failed to fetch clients:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = e => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const clearFilters = () => {
    setFilters({
      ageGroup: "ALL",
      region: "ALL",
      profession: "",
    })
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} />
      <div className="dashboard-content">
        <div className="segments-header">
          <h1>Сегменты клиентов</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filters-container">
          <h2>Фильтры</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="ageGroup">Возрастная группа:</label>
              <select
                id="ageGroup"
                name="ageGroup"
                value={filters.ageGroup}
                onChange={handleFilterChange}
              >
                {ageGroups.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="region">Регион:</label>
              <select
                id="region"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
              >
                {regions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="profession">Профессия:</label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={filters.profession}
                onChange={handleFilterChange}
                placeholder="Введите профессию"
              />
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Сбросить фильтры
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Загрузка клиентов...</div>
        ) : (
          <div className="clients-list">
            <div className="results-summary">
              Найдено клиентов: <strong>{filteredClients.length}</strong> из{" "}
              {processedClients.length}
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Возраст</th>
                  <th>Регион</th>
                  <th>Профессия</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">
                      Клиенты не найдены
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(client => (
                    <tr key={client.id}>
                      <td>{client.id}</td>
                      <td>{client.name}</td>
                      <td>{client.email}</td>
                      <td>{client.phone || "—"}</td>
                      <td>
                        {client.originalAgeAnswer ||
                          getAgeGroupLabel(client.ageFromAnswer) ||
                          "—"}
                      </td>
                      <td>
                        {client.originalRegionAnswer ||
                          getRegionLabel(client.regionFromAnswer) ||
                          "—"}
                      </td>
                      <td>{client.originalProfessionAnswer || "—"}</td>
                      <td>{formatDate(client.clientSince)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientSegmentsPage
