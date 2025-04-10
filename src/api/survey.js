import axios from "axios"
import { authService } from "./auth"

const API_URL = "http://localhost:8080/api/surveys"

class SurveyService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    })

    // Добавляем интерцептор для всех запросов
    this.api.interceptors.request.use(
      config => {
        // Добавляем токен авторизации к заголовкам запроса
        const token = authService.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )
  }

  // Создание нового опросника
  async createSurvey(surveyData) {
    try {
      console.log("Отправляемые данные:", JSON.stringify(surveyData, null, 2))
      const response = await this.api.post("", surveyData)
      return response.data
    } catch (error) {
      console.error("Ошибка при создании опросника:", error)
      throw error
    }
  }

  // Получение всех опросников
  async getAllSurveys() {
    try {
      const response = await this.api.get("/public")
      return response.data
    } catch (error) {
      console.error("Ошибка при получении опросников:", error)
      throw error
    }
  }
  // Получение всех опросников
  async getAllSurveysPublic() {
    try {
      const response = await this.api.get("/public")
      return response.data
    } catch (error) {
      console.error("Ошибка при получении опросников:", error)
      throw error
    }
  }

  // Получение опросника по ID
  async getSurveyById(id) {
    try {
      const response = await this.api.get(`/${id}`)
      return response.data
    } catch (error) {
      console.error(`Ошибка при получении опросника с ID ${id}:`, error)
      throw error
    }
  }

  // Получение публичного опросника по ID (без авторизации)
  async getPublicSurveyById(id) {
    try {
      const response = await axios.get(`${API_URL}/public/${id}`)
      return response.data
    } catch (error) {
      console.error(
        `Ошибка при получении публичного опросника с ID ${id}:`,
        error
      )
      throw error
    }
  }

  // Получение списка всех публичных опросников
  async getPublicSurveys() {
    try {
      const response = await axios.get(`${API_URL}/public`)
      return response.data
    } catch (error) {
      console.error("Ошибка при получении списка публичных опросников:", error)
      throw error
    }
  }

  // Обновление опросника
  async updateSurvey(id, surveyData) {
    try {
      const response = await this.api.put(`/${id}`, surveyData)
      return response.data
    } catch (error) {
      console.error(`Ошибка при обновлении опросника с ID ${id}:`, error)
      throw error
    }
  }

  // Удаление опросника
  async deleteSurvey(id) {
    try {
      const response = await this.api.delete(`/${id}`)
      return response.data
    } catch (error) {
      console.error(`Ошибка при удалении опросника с ID ${id}:`, error)
      throw error
    }
  }

  // Изменение статуса опросника
  async changeSurveyStatus(id, status) {
    try {
      const response = await this.api.patch(`/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error(`Ошибка при изменении статуса опросника с ID ${id}:`, error)
      throw error
    }
  }

  // Отправка ответов на опрос
  async submitSurveyResponse(responseData) {
    try {
      const response = await axios.post(`${API_URL}/responses`, responseData)
      return response.data
    } catch (error) {
      console.error("Ошибка при отправке ответов на опрос:", error)
      throw error
    }
  }
}

export const surveyService = new SurveyService()
