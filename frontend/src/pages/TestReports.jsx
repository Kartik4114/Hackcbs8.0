"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Plus, Upload, Trash2, AlertCircle, CheckCircle2, Settings, FileUp } from "lucide-react"
import TestReportUpload from "../components/TestReport/TestReportUpload"
import TestReportAnalysis from "../components/TestReport/TestReportAnalysis"

export default function TestReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState("overview")
  const [selectedReport, setSelectedReport] = useState(null)
  const [language, setLanguage] = useState("en")
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const storedLanguage = localStorage.getItem("preferredLanguage")
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/test-reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setReports(response.data)
    } catch (err) {
      console.error("Error fetching test reports:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewReport = async (reportData) => {
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("testType", reportData.testType)
      formData.append("dateOfTest", reportData.dateOfTest)
      formData.append("testLab", reportData.testLab)
      formData.append("doctorRemarks", reportData.doctorRemarks)
      formData.append("language", language)

      if (reportData.file) {
        formData.append("file", reportData.file)
      } else if (reportData.testContent) {
        formData.append("testContent", reportData.testContent)
      }

      const response = await axios.post("http://localhost:5000/api/test-reports", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setReports([response.data, ...reports])
      setActiveView("overview")
    } catch (err) {
      console.error("Error creating test report:", err)
      alert("Error: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this test report?")) {
      try {
        const token = localStorage.getItem("token")
        await axios.delete(`http://localhost:5000/api/test-reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        fetchReports()
        setSelectedReport(null)
      } catch (err) {
        console.error("Error deleting test report:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your test reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Test Reports AI Analyzer
              </h1>
              <p className="text-slate-400 text-sm mt-1">Analyze medical test reports with AI insights</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition text-slate-400 hover:text-cyan-400"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveView("upload")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Analyze Test Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "upload" && (
          <TestReportUpload
            onReportCreated={handleNewReport}
            language={language}
            onCancel={() => setActiveView("overview")}
          />
        )}

        {activeView === "analysis" && selectedReport && (
          <TestReportAnalysis
            report={selectedReport}
            language={language}
            onBack={() => {
              setSelectedReport(null)
              setActiveView("overview")
            }}
          />
        )}

        {activeView === "overview" && !selectedReport && (
          <div>
            {reports.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 max-w-md mx-auto">
                  <FileUp className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Test Reports</h2>
                  <p className="text-slate-400 mb-6">Upload your first test report for AI-powered analysis</p>
                  <button
                    onClick={() => setActiveView("upload")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto transition"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Test Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    onClick={() => {
                      setSelectedReport(report)
                      setActiveView("analysis")
                    }}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 cursor-pointer transition group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-cyan-400 transition">
                          {report.testType}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">{report.testLab || "Lab details"}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(report._id)
                        }}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{report.aiAnalysis?.summary}</p>

                    <div className="space-y-2 mb-4">
                      {report.redFlags && report.redFlags.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">{report.redFlags.length} Red Flags</span>
                        </div>
                      )}
                      {report.positiveFindings && report.positiveFindings.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">{report.positiveFindings.length} Positive Findings</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                      <span className="text-xs text-slate-500">{new Date(report.dateOfTest).toLocaleDateString()}</span>
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                        {report.language === "hi" ? "हिंदी" : "English"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
