import axios from "axios"

const API_URL = "http://localhost:8080/api"

export const authService = {
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        localStorage.removeItem("loginError")
      }
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      if (error.response) {
        const errorMsg =
          error.response.data?.message ||
          (error.response.status === 401
            ? "Неверный email или пароль"
            : "Произошла ошибка при авторизации")
        localStorage.setItem("loginError", errorMsg)
      } else if (error.request) {
        localStorage.setItem(
          "loginError",
          "Сервер не отвечает. Проверьте подключение к интернету."
        )
      } else {
        localStorage.setItem(
          "loginError",
          "Произошла ошибка при отправке запроса"
        )
      }
      throw error
    }
  },

  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("loginError")
    try {
      axios.post(`${API_URL}/auth/logout`).catch(err => {
        console.warn("Logout API error:", err)
      })
    } catch (e) {
      console.warn("Logout client error:", e)
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (e) {
        console.error("Error parsing user data:", e)
        this.logout()
        return null
      }
    }
    return null
  },

  getToken() {
    return localStorage.getItem("token")
  },

  isAuthenticated() {
    return !!this.getToken()
  },

  async validateToken() {
    try {
      const response = await axios.get(`${API_URL}/auth/validate`)
      return response.data.valid
    } catch (error) {
      console.error("Token validation error:", error)
      if (error.response && error.response.status === 401) {
        this.logout()
      }
      return false
    }
  },
}

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

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.setItem("redirectAfterLogin", currentPath)
      }
      authService.logout()
      if (currentPath !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)
