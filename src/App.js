import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"
import "./App.css"
import LoginPage from "./pages/Login/LoginPage"
import RegisterPage from "./pages/Register/RegisterPage"
import DashboardPage from "./pages/Dashboard/DashboardPage"
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
                <DashboardPage />
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
