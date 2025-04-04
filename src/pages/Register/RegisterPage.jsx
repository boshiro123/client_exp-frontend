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
      setError("")
      await authService.register(userData)
      navigate("/dashboard")
    } catch (err) {
      setError(
        err.response?.data?.message || "Произошла ошибка при регистрации"
      )
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
              required
            />
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
