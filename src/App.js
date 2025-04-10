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
import SurveyPage from "./pages/Survey/SurveyPage"
import SurveysListPage from "./pages/Survey/SurveysListPage"
import ProtectedRoute from "./components/common/ProtectedRoute"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/surveys" element={<SurveysListPage />} />
          <Route path="/survey/:id" element={<SurveyPage />} />

          {/* Защищенные маршруты с использованием Outlet */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Маршруты только для администраторов */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<div>Административная панель</div>} />
          </Route>

          {/* Перенаправление на страницу входа по умолчанию */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
