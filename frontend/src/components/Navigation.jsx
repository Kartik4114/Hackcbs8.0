"use client"

import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LogOut, Home, FileText, Droplet, Heart, Briefcase, Pill, Shield } from "lucide-react"
import { useState } from "react"

export default function Navigation({ setIsAuthenticated }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    navigate("/login")
  }

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/health-records", label: "Health Records", icon: FileText },
    { path: "/documents", label: "Documents", icon: Briefcase },
    { path: "/blood-banks", label: "Blood Banks", icon: Droplet },
    { path: "/care-plans", label: "Care Plans", icon: Heart },
    { path: "/test-reports", label: "Test Reports", icon: Pill },
    { path: "/health-passport", label: "Health Passport", icon: Shield },
  ]

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 font-bold text-xl">
            <Heart className="w-6 h-6" />
            <span>HealthHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} className="hover:opacity-80 transition flex items-center space-x-1">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="block px-4 py-2 hover:bg-blue-700 rounded flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 bg-red-500 hover:bg-red-600 rounded flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
