"use client"

import { useState } from "react"
import { ArrowLeft, Volume2, Download, Apple, CheckCircle2, AlertCircle } from "lucide-react"
import MedicineSchedule from "./MedicineSchedule"
import DailyChecklist from "./DailyChecklist"
import FamilySharing from "./FamilySharing"

export default function TreatmentPlanView({ plan, language, onBack }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = (text) => {
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === "hi" ? "hi-IN" : "en-US"
    setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "medicines", label: "Medicines", icon: "💊" },
    { id: "diet", label: "Diet Plan", icon: "🥗" },
    { id: "checklist", label: "Checklist", icon: "✓" },
    { id: "sharing", label: "Family", icon: "👥" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Plans
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => speak(plan.aiSummary?.summary || "")}
            className={`flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
              isSpeaking ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : ""
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-sm">{isSpeaking ? "Speaking..." : "Listen"}</span>
          </button>
          <button className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200">
            <Download className="w-5 h-5" />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-400 bg-slate-700/50"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {plan.aiSummary?.condition}
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg">{plan.aiSummary?.summary}</p>
            </div>

            {plan.dosAndDonts && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-lg p-6 border border-green-500/20 hover:border-green-500/40 transition-all">
                  <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Do's
                  </h3>
                  <ul className="space-y-3">
                    {plan.dosAndDonts.dos.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                        <span className="text-green-400 font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 rounded-lg p-6 border border-red-500/20 hover:border-red-500/40 transition-all">
                  <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Don'ts
                  </h3>
                  <ul className="space-y-3">
                    {plan.dosAndDonts.donts.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                        <span className="text-red-400 font-bold mt-0.5">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "medicines" && <MedicineSchedule medicines={plan.medicineSchedule} />}

        {activeTab === "diet" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/30">
                  <Apple className="w-6 h-6 text-green-400" />
                </div>
                Diet Plan
              </h3>
              {plan.dietPlan && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-lg p-6 border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-4">Foods to Eat</h4>
                      <ul className="space-y-2">
                        {plan.dietPlan.foods_to_eat.map((food, idx) => (
                          <li key={idx} className="text-slate-300 flex gap-2 text-sm">
                            <span className="text-green-400">•</span>
                            <span>{food}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 rounded-lg p-6 border border-red-500/20">
                      <h4 className="font-semibold text-red-400 mb-4">Foods to Avoid</h4>
                      <ul className="space-y-2">
                        {plan.dietPlan.foods_to_avoid.map((food, idx) => (
                          <li key={idx} className="text-slate-300 flex gap-2 text-sm">
                            <span className="text-red-400">•</span>
                            <span>{food}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50 hover:border-slate-600 transition-colors">
                      <h4 className="font-semibold text-cyan-400 mb-3">Meal Schedule</h4>
                      <p className="text-slate-300 leading-relaxed">{plan.dietPlan.meal_schedule}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50 hover:border-slate-600 transition-colors">
                      <h4 className="font-semibold text-cyan-400 mb-3">Water Intake</h4>
                      <p className="text-slate-300 leading-relaxed">{plan.dietPlan.water_intake}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "checklist" && <DailyChecklist checklist={plan.dailyChecklist} planId={plan._id} />}

        {activeTab === "sharing" && <FamilySharing plan={plan} />}
      </div>
    </div>
  )
}
