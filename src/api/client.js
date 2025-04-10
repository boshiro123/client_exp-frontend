import axios from "axios"
import { authService } from "./auth"

const API_URL = "http://localhost:8080/api/clients"

class ClientService {
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

  // Отправка ответов клиента на опрос
  async submitSurveyResponse(responseData) {
    try {
      console.log(
        "Отправка ответов клиента:",
        JSON.stringify(responseData, null, 2)
      )
      const response = await this.api.post("/responses", responseData)
      return response.data
    } catch (error) {
      console.error("Ошибка при отправке ответов клиента:", error)
      throw error
    }
  }

  // Получение публичного опросника для клиента
  async getPublicSurveyById(id) {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/surveys/public/${id}`
      )
      return response.data
    } catch (error) {
      console.error(
        `Ошибка при получении публичного опросника с ID ${id}:`,
        error
      )
      throw error
    }
  }

  // Регистрация нового клиента
  async registerClient(clientData) {
    try {
      const response = await this.api.post("", clientData)
      return response.data
    } catch (error) {
      console.error("Ошибка при регистрации клиента:", error)
      throw error
    }
  }
}

export const clientService = new ClientService()
