"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Shield, AlertTriangle, RefreshCw, Calendar, Heart, AlertCircle, Phone } from "lucide-react"

export default function HealthPassportQRView() {
  const searchParams = useSearchParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const decodeAndLoad = () => {
      try {
        const encoded = searchParams.get("data")
        if (!encoded) {
          setError("No data found in QR code")
          setLoading(false)
          return
        }

        const decoded = fromBase64Url(encoded)
        const parsed = JSON.parse(decoded)
        setData(parsed)
      } catch (err) {
        console.error("Failed to decode QR data:", err)
        setError("Invalid QR code or corrupted data")
      } finally {
        setLoading(false)
      }
    }

    decodeAndLoad()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-300">Decrypting health passport...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center text-white px-4">
        <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-8 max-w-md text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold">QR Code Invalid</h1>
          <p className="text-slate-400">{error || "Unable to read health passport data"}</p>
        </div>
      </div>
    )
  }

  const age = data.dateOfBirth
    ? Math.floor((new Date() - new Date(data.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-700">
              <Shield className="w-10 h-10 text-cyan-400 flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Digital Health Passport</p>
                <h1 className="text-3xl font-bold">Health Information</h1>
              </div>
            </div>

            {/* Main Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Patient Name</p>
                    <h2 className="text-4xl font-bold">{data.fullName}</h2>
                  </div>
                  <div className="text-right bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl px-6 py-4 text-center">
                    <p className="text-xs uppercase tracking-widest text-slate-400">Blood Type</p>
                    <p className="text-3xl font-bold text-cyan-400 mt-2">{data.bloodGroup}</p>
                  </div>
                </div>

                {data.dateOfBirth && (
                  <p className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Born: {new Date(data.dateOfBirth).toLocaleDateString()} {age ? `(${age} years old)` : ""}
                  </p>
                )}
              </div>

              {/* Medical Information Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Allergies */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-3">
                  <p className="text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    Allergies
                  </p>
                  <div className="space-y-2">
                    {data.allergies && data.allergies.length > 0 ? (
                      data.allergies.map((allergy, idx) => (
                        <div
                          key={idx}
                          className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2 text-sm"
                        >
                          {allergy}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No allergies reported</p>
                    )}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-3">
                  <p className="text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    Chronic Conditions
                  </p>
                  <div className="space-y-2">
                    {data.chronicConditions && data.chronicConditions.length > 0 ? (
                      data.chronicConditions.map((condition, idx) => (
                        <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm">
                          {condition}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No chronic conditions reported</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-3">
                <p className="text-sm uppercase tracking-widest text-slate-400">Current Medications</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.medications && data.medications.length > 0 ? (
                    data.medications.map((med, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm">
                        {med}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No medications reported</p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/40 rounded-2xl p-6 space-y-4">
                <p className="text-sm uppercase tracking-widest text-amber-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Emergency Contact
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Name</p>
                    <p className="text-lg font-semibold">{data.emergencyContact?.name || "Not specified"}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Relation</p>
                      <p className="text-base font-medium">{data.emergencyContact?.relation || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Phone</p>
                      <p className="text-base font-medium">{data.emergencyContact?.phone || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500">Last Updated: {new Date(data.generatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const fromBase64Url = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  return Buffer.from(padded, "base64").toString("utf-8")
}
