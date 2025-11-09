"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Copy, Volume2, Zap } from "lucide-react"

export default function AISummarizer({ healthData, onSummaryGenerated }) {
  const [summary, setSummary] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [insights, setInsights] = useState([])
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")

  // Streaming animation effect
  useEffect(() => {
    if (!isGenerating && summary) {
      let index = 0
      const interval = setInterval(() => {
        if (index < summary.length) {
          setDisplayedText(summary.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 20)
      return () => clearInterval(interval)
    }
  }, [summary, isGenerating])

  const generateSummary = async () => {
    setIsGenerating(true)
    setDisplayedText("")
    setSummary("")

    try {
      // Simulated AI summary generation
      const mockSummary = `Based on your health records, I've identified the following key insights:

Your recent health data shows stable vital signs with blood pressure averaging 120/80 mmHg. The analysis indicates that you should continue your current exercise routine and maintain your dietary habits. 

Key observations:
• Overall health status is good with minor variations in blood glucose levels
• Sleep patterns are consistent at 7-8 hours per night
• Physical activity level is within recommended range

Recommendations for the coming weeks:
1. Continue current medication schedule as prescribed
2. Maintain consistent sleep schedule
3. Increase water intake by 500ml daily
4. Schedule follow-up appointment in 2 weeks`

      const mockInsights = [
        { type: "positive", title: "Vital Signs", description: "All readings within normal range", icon: "✓" },
        { type: "warning", title: "Glucose Levels", description: "Slightly elevated, monitor diet", icon: "⚠" },
        { type: "positive", title: "Sleep Pattern", description: "Consistent 7-8 hours daily", icon: "✓" },
      ]

      setSummary(mockSummary)
      setInsights(mockInsights)
      onSummaryGenerated?.(mockSummary)
    } catch (error) {
      console.error("Error generating summary:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const speakSummary = () => {
    if (!window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(summary)
      utterance.rate = 0.9
      utterance.onend = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        {/* Animated background accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-md opacity-50" />
              <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Health Summarizer</h2>
              <p className="text-xs text-slate-400 mt-1">Powered by advanced AI analysis</p>
            </div>
          </div>
          <p className="text-slate-300 mb-6 leading-relaxed">
            Get personalized insights from your health data powered by advanced AI analysis
          </p>

          <button
            onClick={generateSummary}
            disabled={isGenerating}
            className={`relative px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 w-full sm:w-auto group ${
              isGenerating
                ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/25 hover:shadow-xl"
            }`}
          >
            <Sparkles
              className={`w-5 h-5 transition-transform ${isGenerating ? "animate-spin" : "group-hover:scale-110"}`}
            />
            <span>{isGenerating ? "Analyzing Your Health..." : "Generate Summary"}</span>
          </button>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`group relative border rounded-xl p-5 transition-all duration-300 backdrop-blur-sm ${
                insight.type === "positive"
                  ? "bg-slate-800/50 border-green-500/30 hover:border-green-500/60 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-green-500/10"
                  : "bg-slate-800/50 border-yellow-500/30 hover:border-yellow-500/60 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-yellow-500/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`text-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${insight.type === "positive" ? "text-green-400" : "text-yellow-400"}`}
                >
                  {insight.type === "positive" ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(displayedText || isGenerating) && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">AI Analysis</h3>
              {isGenerating && <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />}
            </div>
            <div className="flex gap-2">
              <button
                onClick={speakSummary}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  isSpeaking
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50"
                }`}
                title="Speak summary"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <button
                onClick={copyToClipboard}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  copied ? "bg-green-500/20 text-green-400" : "text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50"
                }`}
                title="Copy to clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base font-light">
              {displayedText}
              {isGenerating && <span className="animate-pulse ml-1">▌</span>}
            </p>
          </div>

          {!isGenerating && summary && (
            <div className="mt-4 text-xs text-slate-500 text-right">Generated on {new Date().toLocaleString()}</div>
          )}
        </div>
      )}

      {!summary && !isGenerating && (
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 rounded-2xl p-12 text-center backdrop-blur-sm transition-all hover:border-slate-700/60 hover:from-slate-800/50 hover:to-slate-900/50">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-cyan-500/20">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Analyze Your Health</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Click the button above to generate an AI-powered summary of your health data
          </p>
        </div>
      )}
    </div>
  )
}
