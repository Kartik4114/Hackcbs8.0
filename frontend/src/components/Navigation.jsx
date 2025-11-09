"use client"

import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LogOut, Home, FileText, Droplet, Briefcase, Pill, Shield, Heart } from "lucide-react"
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
    { path: "/documents", label: "Documents", icon: Briefcase },
    { path: "/blood-banks", label: "Blood Banks", icon: Droplet },
    { path: "/care-plans", label: "Care Plans", icon: Heart },
    { path: "/test-reports", label: "Test Reports", icon: Pill },
    { path: "/health-passport", label: "Health Passport", icon: Shield },
  ]

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl border-b border-blue-700/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-slate-900 rounded-lg p-1.5">
                <img src="/logo.png" alt="JeevanSetu Logo" className="w-8 h-8" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                JeevanSetu
              </span>
              <span className="text-xs text-slate-400 font-medium">Care Management</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="group px-3 py-2 rounded-lg flex items-center space-x-1.5 text-sm font-medium transition-all duration-200 hover:bg-white/10 text-slate-300 hover:text-cyan-300"
              >
                <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Logout & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/25"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-slate-300 hover:text-cyan-400 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-4 border-t border-blue-700/30 space-y-2 bg-slate-900/80 backdrop-blur-sm rounded-b-2xl">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="px-4 py-3 hover:bg-blue-600/20 rounded-lg flex items-center space-x-2 text-slate-300 hover:text-cyan-300 transition-all duration-200 border border-transparent hover:border-cyan-500/30"
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 rounded-lg flex items-center space-x-2 text-red-300 hover:text-red-200 transition-all duration-200 border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
