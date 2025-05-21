import axios from "axios"

const API_URL = "http://localhost:8080/api"

export const questionsService = {
  // Получение всех вопросов
  async getAllQuestions() {
    try {
      const response = await axios.get(`${API_URL}/questions`)

      // Проверяем ответ
      if (!response.data) {
        console.warn("Empty response data from API")
        return []
      }

      // Если response.data уже массив, просто возвращаем его
      if (Array.isArray(response.data)) {
        return response.data
      }

      // Если response.data - объект, который может содержать массив в поле content или data
      if (Array.isArray(response.data.content)) {
        return response.data.content
      } else if (Array.isArray(response.data.data)) {
        return response.data.data
      } else if (Array.isArray(response.data.items)) {
        return response.data.items
      } else if (Array.isArray(response.data.questions)) {
        return response.data.questions
      }

      // Если не нашли подходящего массива, логируем и возвращаем пустой массив
      console.warn("API response structure is not as expected:", response.data)
      return []
    } catch (error) {
      console.error("Error fetching questions:", error)
      throw error
    }
  },

  // Получение вопроса по ID
  async getQuestionById(id) {
    try {
      const response = await axios.get(`${API_URL}/questions/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching question with id ${id}:`, error)
      throw error
    }
  },

  // Создание нового вопроса
  async createQuestion(questionData) {
    try {
      const response = await axios.post(`${API_URL}/questions`, questionData)
      return response.data
    } catch (error) {
      console.error("Error creating question:", error)
      throw error
    }
  },

  // Обновление существующего вопроса
  async updateQuestion(id, questionData) {
    try {
      const response = await axios.put(
        `${API_URL}/questions/${id}`,
        questionData
      )
      return response.data
    } catch (error) {
      console.error(`Error updating question with id ${id}:`, error)
      throw error
    }
  },

  // Удаление вопроса
  async deleteQuestion(id) {
    try {
      const response = await axios.delete(`${API_URL}/questions/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting question with id ${id}:`, error)
      throw error
    }
  },

  // Получение всех вариантов ответа для вопроса
  async getQuestionOptions(questionId) {
    try {
      const response = await axios.get(
        `${API_URL}/questions/${questionId}/options`
      )

      if (!response.data) {
        return []
      }

      if (Array.isArray(response.data)) {
        return response.data
      } else if (Array.isArray(response.data.content)) {
        return response.data.content
      } else if (Array.isArray(response.data.options)) {
        return response.data.options
      }

      return []
    } catch (error) {
      console.error(`Error fetching options for question ${questionId}:`, error)
      throw error
    }
  },

  // Получение варианта ответа по ID
  async getOptionById(id) {
    try {
      const response = await axios.get(`${API_URL}/options/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching option with id ${id}:`, error)
      throw error
    }
  },

  // Создание нового варианта ответа
  async createOption(questionId, optionData) {
    try {
      const response = await axios.post(
        `${API_URL}/questions/${questionId}/options`,
        optionData
      )
      return response.data
    } catch (error) {
      console.error(`Error creating option for question ${questionId}:`, error)
      throw error
    }
  },

  // Обновление существующего варианта ответа
  async updateOption(id, optionData) {
    try {
      const response = await axios.put(`${API_URL}/options/${id}`, optionData)
      return response.data
    } catch (error) {
      console.error(`Error updating option with id ${id}:`, error)
      throw error
    }
  },

  // Удаление варианта ответа
  async deleteOption(id) {
    try {
      const response = await axios.delete(`${API_URL}/options/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting option with id ${id}:`, error)
      throw error
    }
  },
}
