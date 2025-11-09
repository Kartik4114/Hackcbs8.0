"use client"

import { useState } from "react"
import { FileText, Loader, Upload } from "lucide-react"

export default function PrescriptionUpload({ onPlanCreated, language, onCancel }) {
  const [uploadMode, setUploadMode] = useState("text") // text or file
  const [file, setFile] = useState(null)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (uploadMode === "file" && !file) {
      alert("Please select a file")
      return
    }
    if (uploadMode === "text" && !text.trim()) {
      alert("Please enter prescription text")
      return
    }

    setLoading(true)
    try {
      const planData = {
        language,
      }

      if (uploadMode === "file") {
        planData.file = file
      } else {
        planData.prescriptionText = text
      }

      await onPlanCreated(planData)
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-12 text-center backdrop-blur-sm">
          <div className="inline-flex items-center justify-center">
            <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
          <p className="text-white font-semibold mt-4">Analyzing with Gemini AI...</p>
          <p className="text-slate-400 text-sm mt-2">Extracting prescription details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              uploadMode === "file"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("text")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              uploadMode === "text"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="hidden sm:inline">Paste Text</span>
            <span className="sm:hidden">Text</span>
          </button>
        </div>

        {/* File Upload Mode */}
        {uploadMode === "file" && (
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">Upload Prescription *</label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition cursor-pointer bg-slate-800/50"
              >
                <div className="text-center">
                  <Upload className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-semibold">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-slate-500 text-sm">PDF, PNG, JPG, DOC up to 50MB</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Text Input Mode */}
        {uploadMode === "text" && (
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">Paste Prescription Text *</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your doctor's prescription or medical notes here. Include medicine names, dosages, frequency..."
              className="w-full h-64 bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none backdrop-blur-sm transition-all"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <FileText className="w-5 h-5" />
            Generate Care Plan
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
