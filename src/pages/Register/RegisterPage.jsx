import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../../components/common/AuthStyles.css"
import { authService } from "../../api/auth"
import { UserRole } from "../../data/interfaces/index.js"

const RegisterPage = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: UserRole.MANAGER,
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    // Очищаем предыдущие сообщения
    setError("")
    setSuccessMessage("")

    // Валидация полей
    if (!userData.username || !userData.email || !userData.password) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    if (userData.password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    if (userData.password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов")
      return
    }

    try {
      setIsLoading(true)
      console.log("Отправка данных на сервер:", userData)

      const response = await authService.register(userData)

      console.log("Ответ сервера:", response)

      if (response.pendingApproval) {
        setSuccessMessage(
          "Регистрация успешно завершена! Ваша заявка отправлена на рассмотрение администратору. Дальнейшие инструкции будут отправлены на указанный email."
        )
        // Не перенаправляем пользователя, оставляем его на странице регистрации
      } else {
        setSuccessMessage("Регистрация успешно завершена! Перенаправление...")
        // Задержка перед перенаправлением, чтобы пользователь увидел сообщение об успехе
        setTimeout(() => {
          navigate("/dashboard")
        }, 1500)
      }
    } catch (err) {
      console.error("Ошибка при регистрации:", err)

      // Обработка различных типов ошибок
      if (err.response) {
        // Ошибки от сервера
        if (err.response.status === 400) {
          setError(
            err.response.data.message || "Некорректные данные для регистрации"
          )
        } else if (err.response.status === 409) {
          setError("Пользователь с таким email уже существует")
        } else {
          setError(
            err.response.data.message || "Произошла ошибка при регистрации"
          )
        }
      } else if (err.request) {
        // Ошибка сети - запрос был отправлен, но ответ не получен
        setError(
          "Сервер не отвечает. Пожалуйста, проверьте подключение к интернету."
        )
      } else {
        // Общая ошибка
        setError("Произошла ошибка при отправке запроса на регистрацию")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Регистрация</h1>
          <p>
            Создайте аккаунт менеджера для работы с системой управления
            клиентским опытом
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={userData.username}
              onChange={handleChange}
              placeholder="Введите имя пользователя"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={userData.email}
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
              value={userData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              disabled={isLoading}
              required
            />
            <small className="form-text">Минимум 6 символов</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Подтвердите пароль"
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className="auth-footer">
          Уже есть аккаунт?
          <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
