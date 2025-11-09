"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Navigation from "./components/Navigation"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import HealthRecords from "./pages/HealthRecords"
import Documents from "./pages/Documents"
import BloodBanks from "./pages/BloodBanks"
import CarePlans from "./pages/CarePlans"
import TestReports from "./pages/TestReports"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")
      setUser(JSON.parse(userData))
    }
  }, [isAuthenticated])

  return (
    <Router>
      {isAuthenticated && <Navigation setIsAuthenticated={setIsAuthenticated} />}
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/health-records" element={isAuthenticated ? <HealthRecords /> : <Navigate to="/login" />} />
        <Route path="/documents" element={isAuthenticated ? <Documents /> : <Navigate to="/login" />} />
        <Route path="/blood-banks" element={isAuthenticated ? <BloodBanks /> : <Navigate to="/login" />} />
        <Route path="/care-plans" element={isAuthenticated ? <CarePlans /> : <Navigate to="/login" />} />
        <Route path="/test-reports" element={isAuthenticated ? <TestReports /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
