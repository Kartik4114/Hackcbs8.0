"use client"

import { useState } from "react"
import { Upload, FileText, Loader } from "lucide-react"

export default function TestReportUpload({ onReportCreated, language, onCancel }) {
  const [testType, setTestType] = useState("")
  const [file, setFile] = useState(null)
  const [testContent, setTestContent] = useState("")
  const [dateOfTest, setDateOfTest] = useState("")
  const [testLab, setTestLab] = useState("")
  const [doctorRemarks, setDoctorRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState("file") // file or text

  const testTypes = ["Blood Test", "X-Ray", "CT Scan", "Ultrasound", "ECG", "MRI", "Pathology Report", "Other"]

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!testType) {
      alert("Please select a test type")
      return
    }
    if (uploadMode === "file" && !file) {
      alert("Please select a file")
      return
    }
    if (uploadMode === "text" && !testContent.trim()) {
      alert("Please enter test content")
      return
    }

    setLoading(true)
    try {
      const reportData = {
        testType,
        dateOfTest: dateOfTest || new Date(),
        testLab,
        doctorRemarks,
      }

      if (uploadMode === "file") {
        reportData.file = file
      } else {
        reportData.testContent = testContent
      }

      await onReportCreated(reportData)
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode selector */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              uploadMode === "file" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("text")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              uploadMode === "text" ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Enter Test Details
          </button>
        </div>

        {/* Test Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">Test Type *</label>
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
          >
            <option value="">Select a test type</option>
            {testTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* File or Text Input */}
        {uploadMode === "file" ? (
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">Upload Test Report *</label>
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
        ) : (
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-3">Test Details/Report *</label>
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Paste or type your test report details here..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 h-48"
            />
          </div>
        )}

        {/* Test Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">Date of Test</label>
          <input
            type="date"
            value={dateOfTest}
            onChange={(e) => setDateOfTest(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>

        {/* Lab Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">Lab Name / Hospital</label>
          <input
            type="text"
            value={testLab}
            onChange={(e) => setTestLab(e.target.value)}
            placeholder="Enter lab or hospital name"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
          />
        </div>

        {/* Doctor Remarks */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">Doctor's Remarks (Optional)</label>
          <textarea
            value={doctorRemarks}
            onChange={(e) => setDoctorRemarks(e.target.value)}
            placeholder="Any additional remarks from your doctor..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 h-24"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Analyze Test Report
              </>
            )}
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
