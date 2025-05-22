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

const getGenderLabel = gender => {
  const genders = {
    MALE: "Мужской",
    FEMALE: "Женский",
    OTHER: "Другой",
  }
  return genders[gender] || gender || "—"
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

  // Предполагаем различные форматы ответов и преобразуем их в стандартные группы
  answer = answer.toLowerCase().trim()

  // Прямое соответствие для стандартных форматов возрастных групп
  const directMatches = {
    "18-24 года": "AGE_18_24",
    "18-24": "AGE_18_24",
    "25-34 года": "AGE_25_34",
    "25-34": "AGE_25_34",
    "35-44 года": "AGE_35_44",
    "35-44": "AGE_35_44",
    "45-54 года": "AGE_45_54",
    "45-54": "AGE_45_54",
    "55 лет и старше": "AGE_55_PLUS",
    "55+": "AGE_55_PLUS",
    "старше 55": "AGE_55_PLUS",
  }

  // Проверяем на точное соответствие
  if (directMatches[answer]) {
    return directMatches[answer]
  }

  // Если точного соответствия нет, используем логику с includes
  if (
    answer.includes("18-24") ||
    (answer.includes("лет") &&
      (answer.includes("18") ||
        answer.includes("19") ||
        answer.includes("20") ||
        answer.includes("21") ||
        answer.includes("22") ||
        answer.includes("23") ||
        answer.includes("24")))
  ) {
    return "AGE_18_24"
  } else if (
    answer.includes("25-34") ||
    (answer.includes("лет") &&
      (answer.includes("25") ||
        answer.includes("26") ||
        answer.includes("27") ||
        answer.includes("28") ||
        answer.includes("29") ||
        answer.includes("30") ||
        answer.includes("31") ||
        answer.includes("32") ||
        answer.includes("33") ||
        answer.includes("34")))
  ) {
    return "AGE_25_34"
  } else if (
    answer.includes("35-44") ||
    (answer.includes("лет") &&
      (answer.includes("35") ||
        answer.includes("36") ||
        answer.includes("37") ||
        answer.includes("38") ||
        answer.includes("39") ||
        answer.includes("40") ||
        answer.includes("41") ||
        answer.includes("42") ||
        answer.includes("43") ||
        answer.includes("44")))
  ) {
    return "AGE_35_44"
  } else if (
    answer.includes("45-54") ||
    (answer.includes("лет") &&
      (answer.includes("45") ||
        answer.includes("46") ||
        answer.includes("47") ||
        answer.includes("48") ||
        answer.includes("49") ||
        answer.includes("50") ||
        answer.includes("51") ||
        answer.includes("52") ||
        answer.includes("53") ||
        answer.includes("54")))
  ) {
    return "AGE_45_54"
  } else if (
    answer.includes("55+") ||
    answer.includes("старше 55") ||
    (answer.includes("лет") && parseInt(answer) >= 55)
  ) {
    return "AGE_55_PLUS"
  }

  // Пытаемся извлечь числовое значение из ответа
  const numMatch = answer.match(/\d+/)
  if (numMatch) {
    const age = parseInt(numMatch[0])
    if (age >= 18 && age <= 24) return "AGE_18_24"
    if (age >= 25 && age <= 34) return "AGE_25_34"
    if (age >= 35 && age <= 44) return "AGE_35_44"
    if (age >= 45 && age <= 54) return "AGE_45_54"
    if (age >= 55) return "AGE_55_PLUS"
  }

  return null
}

// Функция для преобразования текстового ответа о поле в стандартный формат
const mapGenderAnswer = answer => {
  if (!answer) return null

  answer = answer.toLowerCase()

  if (
    answer.includes("муж") ||
    answer === "м" ||
    answer === "m" ||
    answer.includes("male") ||
    answer.includes("мужской")
  ) {
    return "MALE"
  } else if (
    answer.includes("жен") ||
    answer === "ж" ||
    answer === "f" ||
    answer.includes("female") ||
    answer.includes("женский")
  ) {
    return "FEMALE"
  } else {
    return "OTHER"
  }
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
    gender: "ALL",
    profession: "",
  })

  // Идентификаторы вопросов для возраста, пола и профессии
  // Может потребоваться настройка в зависимости от вашей базы данных
  const AGE_QUESTION_ID = 1 // ID вопроса о возрасте
  const GENDER_QUESTION_ID = 2 // ID вопроса о поле
  const PROFESSION_QUESTION_ID = 3 // ID вопроса о профессии

  // Загружаем опции для фильтров
  const ageGroups = [
    { value: "ALL", label: "Все возрасты" },
    ...clientSegmentsService.getAgeGroups(),
  ]
  const genders = [
    { value: "ALL", label: "Любой пол" },
    ...clientSegmentsService.getGenders(),
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
    return clients.map(client => {
      const answers = client.answers || []

      // Извлекаем ответы на вопросы о возрасте, поле и профессии
      let ageAnswer = null
      let genderAnswer = null
      let professionAnswer = null

      answers.forEach(answer => {
        if (answer.questionId === AGE_QUESTION_ID) {
          ageAnswer = answer.answer
        } else if (answer.questionId === GENDER_QUESTION_ID) {
          genderAnswer = answer.answer
        } else if (answer.questionId === PROFESSION_QUESTION_ID) {
          professionAnswer = answer.answer
        }
      })

      // Преобразуем текстовые ответы в значения для фильтров
      const mappedAgeGroup = mapAgeAnswerToGroup(ageAnswer)
      const mappedGender = mapGenderAnswer(genderAnswer)

      return {
        ...client,
        // Переопределяем значения для фильтрации на основе ответов
        ageFromAnswer: mappedAgeGroup,
        genderFromAnswer: mappedGender,
        professionFromAnswer: professionAnswer,
      }
    })
  }, [clients, AGE_QUESTION_ID, GENDER_QUESTION_ID, PROFESSION_QUESTION_ID])

  // При изменении фильтров обновляем отфильтрованный список
  useEffect(() => {
    if (processedClients.length > 0) {
      // Фильтруем клиентов на основе ответов на вопросы
      setFilteredClients(
        processedClients.filter(client => {
          // Фильтр по возрастной группе на основе ответа на вопрос
          if (
            filters.ageGroup &&
            filters.ageGroup !== "ALL" &&
            client.ageFromAnswer !== filters.ageGroup
          ) {
            return false
          }

          // Фильтр по полу на основе ответа на вопрос
          if (
            filters.gender &&
            filters.gender !== "ALL" &&
            client.genderFromAnswer !== filters.gender
          ) {
            return false
          }

          // Фильтр по профессии на основе ответа на вопрос
          if (filters.profession && client.professionFromAnswer) {
            const clientProfession = client.professionFromAnswer.toLowerCase()
            const searchProfession = filters.profession.toLowerCase()
            if (!clientProfession.includes(searchProfession)) {
              return false
            }
          }

          return true
        })
      )
    }
  }, [processedClients, filters])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const clientsData = await clientSegmentsService.getClientsWithAnswers()
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
      gender: "ALL",
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
              <label htmlFor="gender">Пол:</label>
              <select
                id="gender"
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
              >
                {genders.map(option => (
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
                  <th>Пол</th>
                  <th>Профессия</th>
                  <th>Регион</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">
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
                        {getAgeGroupLabel(
                          client.ageFromAnswer || client.ageGroup
                        )}
                      </td>
                      <td>
                        {getGenderLabel(
                          client.genderFromAnswer || client.gender
                        )}
                      </td>
                      <td>
                        {client.professionFromAnswer ||
                          client.profession ||
                          "—"}
                      </td>
                      <td>{client.region || "—"}</td>
                      <td>{formatDate(client.clientSince)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Информация о вопросах
        <div
          className="info-block"
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3>Информация о фильтрах</h3>
          <p>
            Фильтрация клиентов происходит на основе их ответов на следующие
            вопросы:
          </p>
          <ul>
            <li>
              <strong>Возраст:</strong> Вопрос №{AGE_QUESTION_ID}
            </li>
            <li>
              <strong>Пол:</strong> Вопрос №{GENDER_QUESTION_ID}
            </li>
            <li>
              <strong>Профессия:</strong> Вопрос №{PROFESSION_QUESTION_ID}
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  )
}

export default ClientSegmentsPage
