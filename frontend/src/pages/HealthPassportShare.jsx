"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Shield, AlertTriangle, RefreshCw } from "lucide-react"
import client from "../api/client"

export default function HealthPassportShare() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadShare = async () => {
      try {
        const response = await client.get(`/health-passport/share/${token}`, { headers: { Authorization: "" } })
        setData(response.data)
      } catch (err) {
        setError(err.response?.data?.message || "Link expired or invalid")
      } finally {
        setLoading(false)
      }
    }
    loadShare()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-300">Decrypting health passport...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-4">
        <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-8 max-w-md text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold">Health Passport Unavailable</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-cyan-400" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Emergency Access</p>
              <h1 className="text-3xl font-bold">Digital Health Passport</h1>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-400">Patient</p>
            <h2 className="text-2xl font-semibold">{data.fullName}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Blood Group" value={data.bloodGroup} highlight />
              <InfoRow label="Updated" value={new Date(data.generatedAt).toLocaleString()} />
              <InfoRow label="Allergies" value={formatList(data.allergies)} />
              <InfoRow label="Chronic Conditions" value={formatList(data.chronicConditions)} />
              <InfoRow label="Current Medications" value={formatList(data.medications)} />
              <InfoRow
                label="Emergency Contact"
                value={`${data.emergencyContact?.name || "N/A"} (${data.emergencyContact?.relation || "Relation"}) • ${
                  data.emergencyContact?.phone || "N/A"
                }`}
              />
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-sm text-yellow-100">
            <p>
              This card is intended for emergency physicians and first responders. Please verify identity before using
              these details for care.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className={`rounded-2xl border ${highlight ? "border-cyan-500/40 bg-cyan-500/5" : "border-slate-800 bg-slate-900/50"} p-4`}>
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-medium mt-2 text-white">{value || "Not specified"}</p>
    </div>
  )
}

const formatList = (value) => {
  if (!value || value.length === 0) return "Not specified"
  return Array.isArray(value) ? value.join(", ") : value
}

