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
import StatisticsPage from "./pages/Dashboard/StatisticsPage"
import DistributionPage from "./pages/Dashboard/DistributionPage"
import ClientSegmentsPage from "./pages/Dashboard/ClientSegmentsPage"
import AdminPage from "./pages/admin/AdminPage"
import QuestionsPage from "./pages/Questions/QuestionsPage"
import ProtectedRoute from "./components/common/ProtectedRoute"
import IssuesPage from "./pages/Issues/IssuesPage"
import ProblemAreasPage from "./pages/ProblemAreas/ProblemAreasPage"

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
            <Route
              path="/dashboard/segments"
              element={<ClientSegmentsPage />}
            />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/distribution" element={<DistributionPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/problem-areas" element={<ProblemAreasPage />} />
          </Route>

          {/* Маршруты только для администраторов */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Перенаправление на страницу входа по умолчанию */}
          <Route path="*" element={<Navigate to="/surveys" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
