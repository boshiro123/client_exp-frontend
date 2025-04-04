import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../../components/common/AuthStyles.css"
import { authService } from "../../api/auth"

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!credentials.email || !credentials.password) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    try {
      setIsLoading(true)
      setError("")
      await authService.login(credentials)
      navigate("/dashboard")
    } catch (err) {
      setError(
        err.response?.data?.message || "Произошла ошибка при входе в систему"
      )
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
