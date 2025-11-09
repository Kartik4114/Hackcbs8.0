"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { FileText, Droplet, Heart, Briefcase, TrendingUp, Clock, CheckCircle2, Activity } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState({
    healthRecords: 0,
    documents: 0,
    carePlans: 0,
    bloodBanks: 0,
  })
  const [recentDocs, setRecentDocs] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [recordsRes, docsRes, plansRes, banksRes] = await Promise.all([
        axios.get("/api/health-records", { headers }),
        axios.get("/api/documents", { headers }),
        axios.get("/api/care-plans", { headers }),
        axios.get("/api/blood-banks", { headers }),
      ])

      setStats({
        healthRecords: recordsRes.data.length,
        documents: docsRes.data.length,
        carePlans: plansRes.data.length,
        bloodBanks: banksRes.data.length,
      })

      // Get recent documents
      const sortedDocs = docsRes.data.slice(0, 5)
      setRecentDocs(sortedDocs)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      label: "Health Records",
      value: stats.healthRecords,
      icon: Activity,
      color: "from-blue-600 to-blue-700",
      lightColor: "bg-blue-500/20 text-blue-300",
    },
    {
      label: "Documents",
      value: stats.documents,
      icon: Briefcase,
      color: "from-cyan-600 to-cyan-700",
      lightColor: "bg-cyan-500/20 text-cyan-300",
    },
    {
      label: "Care Plans",
      value: stats.carePlans,
      icon: Heart,
      color: "from-pink-600 to-pink-700",
      lightColor: "bg-pink-500/20 text-pink-300",
    },
    {
      label: "Blood Banks",
      value: stats.bloodBanks,
      icon: Droplet,
      color: "from-red-600 to-red-700",
      lightColor: "bg-red-500/20 text-red-300",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Here's your health overview for today</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map(({ label, value, icon: Icon, color, lightColor }) => (
            <div
              key={label}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${lightColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />+{Math.floor(Math.random() * 5) + 1}%
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-2">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Recent Documents */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-cyan-400" />
              Recent Documents
            </h2>
            <a href="/documents" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition">
              View All →
            </a>
          </div>

          {recentDocs.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-cyan-500/30 transition group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-slate-700 rounded-lg group-hover:bg-cyan-500/20 transition">
                      <FileText className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-cyan-400 transition">{doc.title}</p>
                      <p className="text-slate-400 text-sm">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      doc.documentType === "prescription"
                        ? "bg-blue-500/20 text-blue-300"
                        : doc.documentType === "testReport"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {doc.documentType === "prescription"
                      ? "Prescription"
                      : doc.documentType === "testReport"
                        ? "Test Report"
                        : "Document"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No documents yet</p>
            </div>
          )}
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Care Plans
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {stats.carePlans > 0
                ? `You have ${stats.carePlans} active care plan(s)`
                : "Create your first care plan by uploading a prescription"}
            </p>
            <a
              href="/care-plans"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg transition text-sm font-medium border border-pink-500/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              View Plans
            </a>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-400" />
              Blood Banks
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {stats.bloodBanks > 0
                ? `${stats.bloodBanks} blood bank(s) or hospital(s) nearby`
                : "Find nearby blood banks and hospitals"}
            </p>
            <a
              href="/blood-banks"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition text-sm font-medium border border-red-500/30"
            >
              <Droplet className="w-4 h-4" />
              Find Now
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
