import axios from "axios"

const API_URL = "http://localhost:8080/api"

export const authService = {
  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }
    return response.data
  },

  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  },

  getToken() {
    return localStorage.getItem("token")
  },

  isAuthenticated() {
    return !!this.getToken()
  },
}

// Настраиваем axios для автоматического добавления токена к запросам
axios.interceptors.request.use(
  config => {
    const token = authService.getToken()
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Обработка ответов с сервера (например, для перенаправления при истечении токена)
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      authService.logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
