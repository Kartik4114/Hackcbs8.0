"use client"

import { Pill, AlertCircle, Clock, Droplet, Bell, Check, X } from "lucide-react"
import { useState } from "react"

export default function MedicineSchedule({ medicines, onMedicineUpdate }) {
  const [medicineStatus, setMedicineStatus] = useState(
    medicines?.reduce((acc, med, idx) => ({ ...acc, [idx]: "pending" }), {}) || {},
  )
  const [reminders, setReminders] = useState(medicines?.reduce((acc, med, idx) => ({ ...acc, [idx]: true }), {}) || {})

  const handleMedicineStatus = (idx, status) => {
    const newStatus = { ...medicineStatus, [idx]: status }
    setMedicineStatus(newStatus)
    onMedicineUpdate?.(idx, status)
  }

  const getMedicineStatusColor = (status) => {
    switch (status) {
      case "taken":
        return "bg-green-500/20 border-green-500/30"
      case "missed":
        return "bg-red-500/20 border-red-500/30"
      default:
        return "bg-slate-800/50 border-slate-700/50"
    }
  }

  const getMedicineStatusIcon = (status) => {
    switch (status) {
      case "taken":
        return <Check className="w-5 h-5 text-green-400" />
      case "missed":
        return <X className="w-5 h-5 text-red-400" />
      default:
        return <Pill className="w-5 h-5 text-slate-400" />
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 rounded-lg blur-md opacity-40" />
            <div className="relative bg-gradient-to-br from-cyan-500 to-blue-500 p-2.5 rounded-lg">
              <Pill className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Medicine Schedule</h3>
            <p className="text-xs text-slate-400 mt-0.5">{medicines?.length || 0} medicines</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {medicines.map((med, idx) => (
          <div
            key={idx}
            className={`group border rounded-lg p-6 transition-all duration-300 backdrop-blur-sm hover:shadow-lg ${getMedicineStatusColor(medicineStatus[idx])} hover:border-slate-600/50`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {med.medicineName}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{med.category || "Medication"}</p>
              </div>
              <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm font-semibold border border-cyan-500/30 backdrop-blur-sm">
                {med.dosage}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate-700/30">
              <div className="flex gap-3">
                <Clock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Frequency</p>
                  <p className="text-white font-semibold text-sm mt-1">{med.frequency}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Droplet className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Timing</p>
                  <p className="text-white font-semibold text-sm mt-1">{med.timing.join(" • ")}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="text-white font-semibold text-sm mt-1">{med.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-2 flex-1">
                <button
                  onClick={() => handleMedicineStatus(idx, "taken")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    medicineStatus[idx] === "taken"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:border-slate-600"
                  }`}
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  Taken
                </button>
                <button
                  onClick={() => handleMedicineStatus(idx, "pending")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    medicineStatus[idx] === "pending"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:border-slate-600"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleMedicineStatus(idx, "missed")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    medicineStatus[idx] === "missed"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:border-slate-600"
                  }`}
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Missed
                </button>
              </div>
              <button
                onClick={() => setReminders({ ...reminders, [idx]: !reminders[idx] })}
                className={`p-2 rounded-lg transition-all ${
                  reminders[idx]
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:border-slate-600"
                }`}
                title="Toggle reminder"
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>

            {med.notes && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 flex gap-3 border border-yellow-500/20 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-200 text-sm leading-relaxed">{med.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
