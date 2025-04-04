import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../../components/common/AuthStyles.css"
import { authService } from "../../api/auth"

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Используем useEffect для проверки состояния авторизации при загрузке компонента
  useEffect(() => {
    // Если пользователь уже авторизован, перенаправляем на dashboard
    if (authService.isAuthenticated()) {
      navigate("/dashboard")
    }

    // Проверяем, есть ли сохраненная ошибка в localStorage
    const savedError = localStorage.getItem("loginError")
    if (savedError) {
      setError(savedError)
      // Удаляем ошибку из localStorage после отображения
      localStorage.removeItem("loginError")
    }
  }, [navigate])

  const handleChange = e => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    // Предотвращаем стандартное поведение формы
    e.preventDefault()

    // Очищаем предыдущие сообщения
    setError("")
    setSuccessMessage("")

    // Валидация полей
    if (!credentials.email || !credentials.password) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    try {
      setIsLoading(true)
      console.log("Отправка данных на сервер:", { email: credentials.email })

      const response = await authService.login(credentials)
      console.log("Ответ сервера:", response)

      setSuccessMessage("Авторизация успешна! Перенаправление...")

      // Задержка перед перенаправлением
      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } catch (err) {
      console.error("Ошибка при авторизации:", err)

      let errorMessage = "Произошла ошибка при авторизации"

      // Обработка различных типов ошибок
      if (err.response) {
        // Ошибки от сервера
        if (err.response.status === 401) {
          errorMessage = "Неверный email или пароль"
        } else if (err.response.status === 403) {
          errorMessage = "Доступ запрещён"
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message
        }
      } else if (err.request) {
        // Ошибка сети - запрос был отправлен, но ответ не получен
        errorMessage =
          "Сервер не отвечает. Пожалуйста, проверьте подключение к интернету."
      }

      // Устанавливаем сообщение об ошибке
      setError(errorMessage)

      // Очищаем пароль для безопасности
      setCredentials(prev => ({
        ...prev,
        password: "",
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Вход в систему</h1>
          <p>
            Введите свои данные для входа в систему управления клиентским опытом
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Введите ваш email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Введите ваш пароль"
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Выполняется вход..." : "Войти"}
          </button>
        </form>

        <div className="auth-footer">
          Нет аккаунта?
          <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
