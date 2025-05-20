import axios from "axios"
import { authService } from "./auth"

const API_URL = "http://localhost:8080/api/users"

class UserService {
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
   * Получение списка пользователей со статусом PENDING
   * @returns {Promise<Array>} список пользователей, ожидающих одобрения
   */
  async getPendingUsers() {
    try {
      const response = await this.api.get("/pending")
      return response.data
    } catch (error) {
      console.error("Ошибка при получении списка заявок на регистрацию:", error)
      throw error
    }
  }

  /**
   * Одобрение регистрации пользователя
   * @param {Object} approvalData - данные для одобрения
   * @param {number} approvalData.userId - ID пользователя
   * @param {string} [approvalData.message] - дополнительное сообщение
   * @returns {Promise<Object>} результат операции
   */
  async approveUser(approvalData) {
    try {
      const response = await this.api.post("/approve", approvalData)
      return response.data
    } catch (error) {
      console.error("Ошибка при одобрении пользователя:", error)
      throw error
    }
  }

  /**
   * Отклонение регистрации пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Object>} результат операции
   */
  async rejectUser(userId) {
    try {
      const response = await this.api.delete(`/${userId}/reject`)
      return response.data
    } catch (error) {
      console.error("Ошибка при отклонении пользователя:", error)
      throw error
    }
  }

  /**
   * Получение списка менеджеров
   * @returns {Promise<Array>} список пользователей с ролью MANAGER
   */
  async getManagers() {
    try {
      const response = await this.api.get("/managers")
      return response.data
    } catch (error) {
      console.error("Ошибка при получении списка менеджеров:", error)
      throw error
    }
  }

  /**
   * Удаление пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>} результат операции
   */
  async deleteUser(userId) {
    try {
      await this.api.delete(`/${userId}`)
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error)
      throw error
    }
  }
}

export const userService = new UserService()
