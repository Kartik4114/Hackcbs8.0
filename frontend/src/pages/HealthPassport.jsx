"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Shield,
  Calendar,
  Activity,
  HeartPulse,
  AlertTriangle,
  Phone,
  Download,
  Share2,
  Clock,
  Copy,
  RefreshCw,
} from "lucide-react"
import client from "../api/client"

const initialForm = {
  fullName: "",
  dateOfBirth: "",
  bloodGroup: "",
  allergies: "",
  chronicConditions: "",
  medications: "",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
}

const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]

export default function HealthPassport() {
  const [formData, setFormData] = useState(initialForm)
  const [passport, setPassport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shareInfo, setShareInfo] = useState(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [shareCountdown, setShareCountdown] = useState("")

  useEffect(() => {
    fetchPassport()
  }, [])

  useEffect(() => {
    if (!shareInfo?.expiresAt) {
      setShareCountdown("")
      return
    }
    const interval = setInterval(() => {
      const diff = new Date(shareInfo.expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setShareCountdown("Expired")
        clearInterval(interval)
        return
      }
      const minutes = Math.floor(diff / (60 * 1000))
      const seconds = Math.floor((diff % (60 * 1000)) / 1000)
      setShareCountdown(`${minutes}m ${seconds}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [shareInfo])

  const fetchPassport = async () => {
    try {
      setLoading(true)
      const { data } = await client.get("/health-passport")
      setPassport(data)
      if (data) {
        setFormData({
          fullName: data.fullName || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : "",
          bloodGroup: data.bloodGroup || "",
          allergies: (data.allergies || []).join(", "),
          chronicConditions: (data.chronicConditions || []).join(", "),
          medications: (data.medications || []).join(", "),
          emergencyName: data.emergencyContact?.name || "",
          emergencyRelation: data.emergencyContact?.relation || "",
          emergencyPhone: data.emergencyContact?.phone || "",
        })
        if (data.tempShare?.expiresAt && new Date(data.tempShare.expiresAt) > new Date()) {
          setShareInfo({
            shareUrl: data.tempShare.url,
            expiresAt: data.tempShare.expiresAt,
            qrCode: data.qrCodes?.emergency,
          })
        }
      }
    } catch (err) {
      console.error("Failed to load passport:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        medications: formData.medications,
        emergencyContact: {
          name: formData.emergencyName,
          relation: formData.emergencyRelation,
          phone: formData.emergencyPhone,
        },
      }
      const { data } = await client.post("/health-passport", payload)
      setPassport(data)
      setShareInfo(null)
    } catch (err) {
      console.error("Failed to save passport:", err)
      alert("Unable to save passport. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadOfflineCard = () => {
    if (!passport?.offlinePayload) return
    const blob = new Blob([JSON.stringify(passport.offlinePayload, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "health-passport-offline.json"
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadQR = (type) => {
    const dataUrl = type === "offline" ? passport?.qrCodes?.offline : shareInfo?.qrCode
    if (!dataUrl) return
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `health-passport-${type}-qr.png`
    link.click()
  }

  const handleGenerateShare = async () => {
    try {
      setShareLoading(true)
      const { data } = await client.post("/health-passport/share/temporary")
      setShareInfo(data)
    } catch (err) {
      console.error("Failed to generate share link:", err)
      alert("Unable to generate share link right now.")
    } finally {
      setShareLoading(false)
    }
  }

  const copyShareLink = () => {
    if (!shareInfo?.shareUrl) return
    navigator.clipboard?.writeText(shareInfo.shareUrl)
    alert("Share link copied to clipboard")
  }

  const offlineData = useMemo(() => passport?.offlinePayload || null, [passport])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-slate-300">Loading your Health Passport...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-cyan-400 uppercase tracking-widest text-xs font-semibold mb-2">Digital Health ID</p>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Shield className="w-10 h-10 text-cyan-400" />
              Health Passport
            </h1>
            <p className="text-slate-400 mt-2">
              Portable, QR-based identity with blood group, allergies, emergency contact, and more.
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300">
            <p className="font-semibold text-white mb-1">Offline Ready</p>
            <p>Download the cached card and QR to store on your phone or print as an ID.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Carter"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none"
                  required
                >
                  <option value="">Select</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {[
              { label: "Allergies", name: "allergies", placeholder: "Peanuts, Penicillin..." },
              { label: "Chronic Conditions", name: "chronicConditions", placeholder: "Diabetes, Hypertension..." },
              { label: "Current Medications", name: "medications", placeholder: "Metformin 500mg, Lisinopril..." },
            ].map(({ label, name, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
                <textarea
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none h-20"
                />
                <p className="text-xs text-slate-500 mt-1">Separate entries using commas.</p>
              </div>
            ))}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Relation</label>
                <input
                  type="text"
                  name="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={handleChange}
                  placeholder="Mother / Partner"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:border-cyan-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" /> Save Passport
                </>
              )}
            </button>
          </form>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Digital Health Card</p>
                  <h2 className="text-2xl font-bold mt-2">{passport?.fullName || "Not set"}</h2>
                  <p className="text-slate-400 text-sm flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    {formData.dateOfBirth || "DOB not set"}
                  </p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Blood</p>
                  <p className="text-2xl font-bold text-cyan-400">{formData.bloodGroup || "--"}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <InfoTag icon={AlertTriangle} label="Allergies" items={formData.allergies} />
                <InfoTag icon={Activity} label="Chronic" items={formData.chronicConditions} />
                <InfoTag icon={HeartPulse} label="Medications" items={formData.medications} />
                <InfoTag icon={Phone} label="Emergency" items={`${formData.emergencyName} • ${formData.emergencyPhone}`} />
              </div>

              <div className="mt-6 bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {passport?.qrCodes?.offline ? (
                  <img
                    src={passport.qrCodes.offline}
                    alt="Offline QR"
                    className="w-40 h-40 object-contain mx-auto sm:mx-0"
                  />
                ) : (
                  <div className="w-40 h-40 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 mx-auto">
                    QR Pending
                  </div>
                )}
                <div className="flex-1 text-slate-900 space-y-2">
                  <h3 className="font-semibold text-lg">Offline QR</h3>
                  <p className="text-sm text-slate-600">
                    Contains essential medical info encoded locally. Store it on your phone or print it on a card/band.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleDownloadQR.bind(null, "offline")}
                      disabled={!passport?.qrCodes?.offline}
                      className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" /> QR PNG
                    </button>
                    <button
                      onClick={handleDownloadOfflineCard}
                      disabled={!passport?.offlinePayload}
                      className="flex items-center gap-2 bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" /> Offline Card
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-cyan-400" />
                    Emergency Share (30 mins)
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Generate a secure, time-bound QR/link for hospitals to scan and view essential data.
                  </p>
                </div>
                <button
                  onClick={handleGenerateShare}
                  disabled={shareLoading}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  {shareLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" /> Share for 30 mins
                    </>
                  )}
                </button>
              </div>

              {shareInfo ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400">Share Link</p>
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm break-all">
                      <span className="flex-1">{shareInfo.shareUrl}</span>
                      <button onClick={copyShareLink} className="text-cyan-400 hover:text-cyan-300">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expires in: <strong>{shareCountdown || "30m"}</strong>
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 flex flex-col items-center gap-3">
                    {shareInfo.qrCode ? (
                      <img src={shareInfo.qrCode} alt="Emergency QR" className="w-40 h-40 object-contain" />
                    ) : (
                      <div className="w-40 h-40 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                        Pending
                      </div>
                    )}
                    <button
                      onClick={handleDownloadQR.bind(null, "emergency")}
                      disabled={!shareInfo.qrCode}
                      className="text-sm flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" /> Download QR
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No active emergency share link. Click “Share for 30 mins” to generate one when needed.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Offline Ready",
              description: "Store the offline JSON + QR in your phone’s wallet or print it on a physical ID card.",
            },
            {
              title: "Works with Care Plans & Blood Banks",
              description: "Hospitals can scan the same ID to access your critical information before treatments.",
            },
            {
              title: "Privacy Focused",
              description:
                "Offline QR is stored locally. Emergency links auto-expire after 30 minutes and can be regenerated.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-slate-800/40 rounded-xl border border-slate-700 p-4">
              <h4 className="font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoTag({ icon: Icon, label, items }) {
  const value = Array.isArray(items) ? items.join(", ") : items || "Not specified"
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
      <p className="text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <p className="text-sm mt-2 min-h-[40px]">{value || "Not specified"}</p>
    </div>
  )
}

