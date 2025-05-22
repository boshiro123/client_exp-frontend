import axios from "axios"

const API_URL = "http://localhost:8080/api"

export const clientSegmentsService = {
  // Получение всех клиентов с их ответами на вопросы
  async getClientsWithAnswers() {
    try {
      const response = await axios.get(`${API_URL}/clients/with-answers`)

      // Проверяем ответ API
      if (!response.data) {
        return []
      }

      // Если response.data уже массив, просто возвращаем его
      if (Array.isArray(response.data)) {
        return response.data
      }

      // Если response.data - объект, пытаемся найти массив внутри
      if (Array.isArray(response.data.content)) {
        return response.data.content
      } else if (Array.isArray(response.data.clients)) {
        return response.data.clients
      } else if (Array.isArray(response.data.data)) {
        return response.data.data
      }

      // Если не нашли подходящего массива, возвращаем пустой массив
      console.warn("API response structure is not as expected:", response.data)
      return []
    } catch (error) {
      console.error("Error fetching clients with answers:", error)
      throw error
    }
  },

  // Получение списка возможных значений для возрастных групп
  getAgeGroups() {
    return [
      { value: "AGE_18_24", label: "18-24 года" },
      { value: "AGE_25_34", label: "25-34 года" },
      { value: "AGE_35_44", label: "35-44 года" },
      { value: "AGE_45_54", label: "45-54 года" },
      { value: "AGE_55_PLUS", label: "55 лет и старше" },
    ]
  },

  // Получение списка возможных значений для пола
  getGenders() {
    return [
      { value: "MALE", label: "Мужской" },
      { value: "FEMALE", label: "Женский" },
      { value: "OTHER", label: "Другой" },
    ]
  },

  // Фильтрация клиентов по выбранным критериям
  filterClients(clients, filters) {
    return clients.filter(client => {
      // Фильтр по возрастной группе
      if (
        filters.ageGroup &&
        filters.ageGroup !== "ALL" &&
        client.ageGroup !== filters.ageGroup
      ) {
        return false
      }

      // Фильтр по полу
      if (
        filters.gender &&
        filters.gender !== "ALL" &&
        client.gender !== filters.gender
      ) {
        return false
      }

      // Фильтр по профессии (поиск подстроки в строке, регистронезависимый)
      if (filters.profession && client.profession) {
        const clientProfession = client.profession.toLowerCase()
        const searchProfession = filters.profession.toLowerCase()
        if (!clientProfession.includes(searchProfession)) {
          return false
        }
      }

      return true
    })
  },
}
