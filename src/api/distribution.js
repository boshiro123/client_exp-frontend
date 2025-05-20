import axios from "axios"
import { authService } from "./auth"

const API_URL = "http://localhost:8080/api/distribution"

class DistributionService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    })

    // Добавляем интерцептор для запросов
    this.api.interceptors.request.use(
      config => {
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

  /**
   * Рассылка опросника клиентам
   * @param {Object} options - параметры рассылки
   * @param {number} options.surveyId - ID опросника для рассылки
   * @param {string} [options.subject] - тема письма (необязательный параметр)
   * @returns {Promise<Object>} результат отправки
   */
  async sendSurveyToClients(options) {
    try {
      if (!options.surveyId) {
        throw new Error("Не указан ID опросника для рассылки")
      }

      console.log(
        "Отправка опросника клиентам:",
        JSON.stringify(options, null, 2)
      )

      const response = await this.api.post("/survey", {
        surveyId: options.surveyId,
        subject: options.subject || "Приглашение пройти опрос",
      })

      return response.data
    } catch (error) {
      console.error("Ошибка при рассылке опросника клиентам:", error)
      throw error
    }
  }

  /**
   * Отправка тематического письма клиентам
   * @param {Object} options - параметры сообщения
   * @param {string} options.message - текст сообщения
   * @param {string} [options.subject] - тема письма (необязательный параметр)
   * @returns {Promise<Object>} результат отправки
   */
  async sendMessageToClients(options) {
    try {
      if (!options.message) {
        throw new Error("Не указан текст сообщения для отправки")
      }

      console.log(
        "Отправка тематического письма клиентам:",
        JSON.stringify(options, null, 2)
      )

      const response = await this.api.post("/message", {
        message: options.message,
        subject: options.subject || "Информация от ClientExp",
      })

      return response.data
    } catch (error) {
      console.error("Ошибка при отправке тематического письма клиентам:", error)
      throw error
    }
  }
}

export const distributionService = new DistributionService()
