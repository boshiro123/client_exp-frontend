import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import "./App.css"
import LoginPage from "./pages/Login"
import RegisterPage from "./pages/Register"
import ProtectedRoute from "./components/common/ProtectedRoute"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищенные маршруты */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Главная страница (Dashboard)</div>
              </ProtectedRoute>
            }
          />

          {/* Маршрут только для администраторов */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <div>Административная панель</div>
              </ProtectedRoute>
            }
          />

          {/* Перенаправление на страницу входа по умолчанию */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
