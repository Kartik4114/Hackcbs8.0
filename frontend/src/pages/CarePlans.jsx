"use client"

import { useEffect, useState } from "react"
import { Plus, Upload, Trash2, Pill, CheckCircle2, Settings } from "lucide-react"
import PrescriptionUpload from "../components/CarePlan/PrescriptionUpload"
import TreatmentPlanView from "../components/CarePlan/TreatmentPlanView"
import AISummarizer from "../components/CarePlan/AISummarizer"
import TreatmentPlanGenerator from "../components/CarePlan/TreatmentPlanGenerator"
import VoiceAndLanguage from "../components/CarePlan/VoiceAndLanguage"
import { getTranslation } from "../utils/translations"
import client from "../api/client"

export default function CarePlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState("overview") // overview, upload, details, summarizer, generator
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [language, setLanguage] = useState("en")
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const storedLanguage = localStorage.getItem("preferredLanguage")
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data } = await client.get("/care-plans")
      setPlans(data)
    } catch (err) {
      console.error("Error fetching care plans:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPlan = async (planData) => {
    try {
      const formData = new FormData()

      formData.append("language", planData.language)

      if (planData.file) {
        formData.append("file", planData.file)
      } else if (planData.prescriptionText) {
        formData.append("prescriptionText", planData.prescriptionText)
      }

      const { data } = await client.post("/care-plans", formData)

      setPlans([data, ...plans])
      setActiveView("overview")
    } catch (err) {
      console.error("Error creating care plan:", err)
      alert("Error: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this care plan?")) {
      try {
        await client.delete(`/care-plans/${id}`)
        fetchPlans()
        setSelectedPlan(null)
      } catch (err) {
        console.error("Error deleting care plan:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your care plans...</p>
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
                {getTranslation(language, "careplan", "title")}
              </h1>
              <p className="text-slate-400 text-sm mt-1">{getTranslation(language, "careplan", "subtitle")}</p>
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
                {getTranslation(language, "careplan", "newPlan")}
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <VoiceAndLanguage
                language={language}
                onLanguageChange={(newLang) => {
                  setLanguage(newLang)
                  localStorage.setItem("preferredLanguage", newLang)
                }}
                onVoiceSettingsChange={(settings) => {
                  localStorage.setItem("voiceSettings", JSON.stringify(settings))
                }}
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Summarizer view */}
        {activeView === "summarizer" && <AISummarizer healthData={null} onSummaryGenerated={() => {}} />}

        {activeView === "upload" && (
          <PrescriptionUpload
            onPlanCreated={handleNewPlan}
            language={language}
            onCancel={() => setActiveView("overview")}
          />
        )}

        {activeView === "generator" && selectedPlan && (
          <TreatmentPlanGenerator
            medicines={selectedPlan.medicineSchedule}
            condition={selectedPlan.aiSummary?.condition}
            language={language}
            onPlanGenerated={(plan) => {
              setSelectedPlan({ ...selectedPlan, generatedPlan: plan })
              setActiveView("details")
            }}
          />
        )}

        {activeView === "details" && selectedPlan && (
          <TreatmentPlanView
            plan={selectedPlan}
            language={language}
            onBack={() => {
              setSelectedPlan(null)
              setActiveView("overview")
            }}
          />
        )}

        {activeView === "overview" && !selectedPlan && (
          <div>
            {plans.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 max-w-md mx-auto">
                  <Pill className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{getTranslation(language, "careplan", "noPlas")}</h2>
                  <p className="text-slate-400 mb-6">{getTranslation(language, "careplan", "noPlanMessage")}</p>
                  <button
                    onClick={() => setActiveView("upload")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 mx-auto transition"
                  >
                    <Upload className="w-5 h-5" />
                    {getTranslation(language, "careplan", "uploadPrescription")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    onClick={() => {
                      setSelectedPlan(plan)
                      setActiveView("details")
                    }}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 cursor-pointer transition group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold group-hover:text-cyan-400 transition">
                        {plan.aiSummary?.condition || "Untitled Plan"}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(plan._id)
                        }}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{plan.aiSummary?.summary}</p>

                    <div className="space-y-2 mb-4">
                      {plan.medicineSchedule.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Pill className="w-4 h-4 text-cyan-400" />
                          <span>
                            {plan.medicineSchedule.length} {getTranslation(language, "careplan", "medicines")}
                          </span>
                        </div>
                      )}
                      {plan.dailyChecklist.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>
                            {plan.dailyChecklist.filter((c) => c.completed).length}/{plan.dailyChecklist.length}{" "}
                            {getTranslation(language, "careplan", "complete")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                      <span className="text-xs text-slate-500">
                        {new Date(plan.createdAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-US")}
                      </span>
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                        {plan.language === "hi" ? "हिंदी" : "English"}
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
