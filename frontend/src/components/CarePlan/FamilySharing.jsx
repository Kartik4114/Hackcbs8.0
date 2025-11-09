"use client"

import { useState } from "react"
import { Share2, QrCode, Users, Mail } from "lucide-react"

export default function FamilySharing({ plan }) {
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [relationship, setRelationship] = useState("")

  const handleShare = () => {
    // TODO: Add backend integration
    alert("Plan shared with " + email)
    setEmail("")
    setRelationship("")
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Users className="w-6 h-6 text-cyan-400" />
        Share with Family & Caretakers
      </h3>

      {/* QR Code Section */}
      <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-cyan-400" />
          QR Code
        </h4>
        <p className="text-slate-300 mb-4">Family members can scan this QR code to access your care plan</p>
        <div className="bg-white p-4 w-48 h-48 rounded-lg">
          {/* QR Code placeholder */}
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">
            QR Code
          </div>
        </div>
      </div>

      {/* Share Form */}
      <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
        <h4 className="font-semibold mb-4">Share with Email</h4>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Share2 className="w-5 h-5" />
            Add Family Member
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="family@example.com"
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded px-4 py-2 text-white focus:border-cyan-500"
              >
                <option value="">Select relationship</option>
                <option value="family">Family Member</option>
                <option value="caretaker">Caretaker</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition"
              >
                Send Invite
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shared With */}
      {plan.familySharing?.sharedWith.length > 0 && (
        <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
          <h4 className="font-semibold mb-4">Shared With</h4>
          <div className="space-y-3">
            {plan.familySharing.sharedWith.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-600/50 rounded">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-600 px-2 py-1 rounded">{member.relationship}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
