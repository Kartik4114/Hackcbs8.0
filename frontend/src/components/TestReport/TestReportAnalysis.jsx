"use client"

import { useState } from "react"
import { ChevronLeft, AlertCircle, CheckCircle2, TrendingUp, Volume2, Copy, Share2, Download } from "lucide-react"

export default function TestReportAnalysis({ report, language, onBack }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === "hi" ? "hi-IN" : "en-US"
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-cyan-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{report.testType} Analysis</h1>
          <p className="text-slate-400 text-sm mt-1">
            {report.testLab} • {new Date(report.dateOfTest).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "overview", label: "Overview" },
          { id: "red-flags", label: `Red Flags (${report.redFlags?.length || 0})` },
          { id: "positive", label: `Positive (${report.positiveFindings?.length || 0})` },
          { id: "recommendations", label: "Recommendations" },
          { id: "advice", label: "Medical Advice" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === tab.id ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Test Summary</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => speakText(report.aiAnalysis?.summary)}
                  className="p-2 rounded-lg hover:bg-slate-700 transition text-slate-400 hover:text-cyan-400"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => copyToClipboard(report.aiAnalysis?.summary)}
                  className="p-2 rounded-lg hover:bg-slate-700 transition text-slate-400 hover:text-cyan-400"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">{report.aiAnalysis?.summary}</p>
          </div>

          {/* Overall Assessment */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Overall Assessment</h2>
            <p className="text-slate-300 leading-relaxed">{report.aiAnalysis?.overallAssessment}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Critical Issues</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {report.redFlags?.filter((f) => f.severity === "critical").length || 0}
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">High Priority</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {report.redFlags?.filter((f) => f.severity === "high").length || 0}
              </p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Positive Findings</span>
              </div>
              <p className="text-2xl font-bold text-white">{report.positiveFindings?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Red Flags Tab */}
      {activeTab === "red-flags" && (
        <div className="space-y-4">
          {report.redFlags && report.redFlags.length > 0 ? (
            report.redFlags.map((flag, idx) => (
              <div
                key={idx}
                className={`border rounded-xl p-6 ${
                  flag.severity === "critical"
                    ? "bg-red-500/10 border-red-500/30"
                    : flag.severity === "high"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-orange-500/10 border-orange-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{flag.parameter}</h3>
                    <p className="text-sm text-slate-300">Severity: {flag.severity}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      flag.severity === "critical"
                        ? "bg-red-500 text-white"
                        : flag.severity === "high"
                          ? "bg-yellow-500 text-black"
                          : "bg-orange-500 text-white"
                    }`}
                  >
                    {flag.value}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Normal Range</p>
                    <p className="text-slate-300">{flag.normalRange}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Your Value</p>
                    <p className="text-slate-300 font-semibold">{flag.value}</p>
                  </div>
                </div>

                <p className="text-slate-300 mb-3">{flag.description}</p>

                <div className="bg-slate-800/50 rounded-lg p-4 border-l-2 border-cyan-500">
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-cyan-400">Action: </span>
                    {flag.recommendation}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white">Great News!</h3>
              <p className="text-slate-300">No red flags detected in your test results.</p>
            </div>
          )}
        </div>
      )}

      {/* Positive Findings Tab */}
      {activeTab === "positive" && (
        <div className="space-y-4">
          {report.positiveFindings && report.positiveFindings.length > 0 ? (
            report.positiveFindings.map((finding, idx) => (
              <div key={idx} className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{finding.parameter}</h3>
                    <p className="text-sm text-slate-300">{finding.status}</p>
                  </div>
                </div>
                <p className="text-slate-300 mb-3">{finding.description}</p>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-green-400">Value: </span>
                    {finding.value}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-slate-300">No positive findings recorded.</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          {report.balancingRecommendations &&
            report.balancingRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{rec.issue}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                        Priority: {rec.priority}
                      </span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                        Timeline: {rec.timeline}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2 font-semibold">Current State</p>
                    <p className="text-slate-300">{rec.currentState}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2 font-semibold">Target State</p>
                    <p className="text-cyan-400">{rec.targetState}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-3 font-semibold">Action Items</p>
                  <ul className="space-y-2">
                    {rec.actionItems?.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300">
                        <span className="text-cyan-400 font-bold">{i + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Medical Advice Tab */}
      {activeTab === "advice" && (
        <div className="space-y-6">
          {report.medicalAdvice && (
            <>
              {/* Next Steps */}
              {report.medicalAdvice.nextSteps && report.medicalAdvice.nextSteps.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Next Steps
                  </h3>
                  <ul className="space-y-2">
                    {report.medicalAdvice.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Tests */}
              {report.medicalAdvice.followUpTests && report.medicalAdvice.followUpTests.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Recommended Follow-up Tests</h3>
                  <ul className="space-y-2">
                    {report.medicalAdvice.followUpTests.map((test, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specialist Consultation */}
              {report.medicalAdvice.consultSpecialist && report.medicalAdvice.consultSpecialist.length > 0 && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Consider Specialist Consultation</h3>
                  <ul className="space-y-2">
                    {report.medicalAdvice.consultSpecialist.map((specialist, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{specialist}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Precautions */}
              {report.medicalAdvice.precautions && report.medicalAdvice.precautions.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Precautions</h3>
                  <ul className="space-y-2">
                    {report.medicalAdvice.precautions.map((precaution, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <span className="text-orange-400 font-bold">•</span>
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lifestyle Changes */}
              {report.medicalAdvice.lifestyle && report.medicalAdvice.lifestyle.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Recommended Lifestyle Changes</h3>
                  <ul className="space-y-2">
                    {report.medicalAdvice.lifestyle.map((change, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <span className="text-green-400 font-bold">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-slate-700">
        <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
          <Share2 className="w-5 h-5" />
          Share Report
        </button>
        <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>
    </div>
  )
}
