"use client"

import { useState } from "react"
import { CheckCircle2, Circle, TrendingUp, AlertCircle, Calendar } from "lucide-react"

export default function DailyChecklist({ checklist, planId, onChecklistUpdate }) {
  const [items, setItems] = useState(checklist)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState("categories") // categories or timeline

  const toggleComplete = (idx) => {
    const newItems = [...items]
    newItems[idx].completed = !newItems[idx].completed
    setItems(newItems)
    onChecklistUpdate?.(idx, newItems[idx].completed)
  }

  const categorizeItems = () => {
    const categories = {}
    items.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = []
      }
      categories[item.category].push(item)
    })
    return categories
  }

  const categoryEmoji = {
    medicine: "💊",
    exercise: "🏃",
    diet: "🥗",
    meditation: "🧘",
  }

  const categoryColors = {
    medicine: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400" },
    exercise: { bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "text-orange-400" },
    diet: { bg: "bg-green-500/10", border: "border-green-500/20", icon: "text-green-400" },
    meditation: { bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-400" },
  }

  const categories = categorizeItems()
  const totalCompleted = items.filter((i) => i.completed).length
  const completionPercentage = (totalCompleted / items.length) * 100

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-sm text-slate-400">Today's Progress</p>
              <p className="text-2xl font-bold text-white">
                {totalCompleted} of {items.length}
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-cyan-400">{Math.round(completionPercentage)}%</p>
            <p className="text-xs text-slate-400 mt-1">Complete</p>
          </div>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("categories")}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === "categories"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              viewMode === "timeline"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Categories View */}
      {viewMode === "categories" && (
        <div className="space-y-4">
          {Object.entries(categories).map(([category, categoryItems]) => {
            const completed = categoryItems.filter((i) => i.completed).length
            const colors = categoryColors[category] || categoryColors.medicine
            return (
              <div
                key={category}
                className={`border rounded-lg overflow-hidden backdrop-blur-sm ${colors.bg} ${colors.border}`}
              >
                <div
                  className={`bg-gradient-to-r from-slate-800/80 to-slate-900/50 px-6 py-4 border-b ${colors.border}`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg text-white">
                      {categoryEmoji[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h4>
                    <span className={`text-xs font-semibold ${colors.icon}`}>
                      {completed}/{categoryItems.length}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {categoryItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleComplete(idx)}
                      className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-200 group"
                    >
                      <div className="transition-transform group-hover:scale-110">
                        {item.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-600 group-hover:text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold transition-all ${
                            item.completed ? "text-slate-500 line-through" : "text-white group-hover:text-cyan-400"
                          }`}
                        >
                          {item.task}
                        </p>
                        {item.time && <p className="text-slate-500 text-sm mt-0.5">{item.time}</p>}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all bg-gradient-to-r ${colors.icon}`}
                        style={{
                          width: `${categoryItems.length > 0 ? (completed / categoryItems.length) * 100 : 0}%`,
                          backgroundImage: "linear-gradient(to right, currentColor, currentColor)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggleComplete(idx)}
              className="flex items-center gap-4 cursor-pointer p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all group"
            >
              <div className="flex-shrink-0 transition-transform group-hover:scale-110">
                {item.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-600 group-hover:text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{categoryEmoji[item.category]}</span>
                  <p
                    className={`font-semibold transition-all ${
                      item.completed ? "text-slate-500 line-through" : "text-white group-hover:text-cyan-400"
                    }`}
                  >
                    {item.task}
                  </p>
                </div>
                {item.time && (
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                    <span>•</span>
                    {item.time}
                  </p>
                )}
              </div>
              <span className="text-xs bg-slate-700/50 px-2 py-1 rounded capitalize flex-shrink-0">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Motivation Message */}
      {completionPercentage === 100 && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-300 font-semibold">Excellent work!</p>
            <p className="text-green-300/80 text-sm mt-1">
              You've completed all tasks for today. Keep up the great effort!
            </p>
          </div>
        </div>
      )}

      {completionPercentage > 0 && completionPercentage < 100 && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <p className="text-cyan-300 font-semibold">Keep going!</p>
            <p className="text-cyan-300/80 text-sm mt-1">
              {items.length - totalCompleted} task{items.length - totalCompleted !== 1 ? "s" : ""} remaining today.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
