"use client"

import { useState, useRef } from "react"
import { Upload, Loader, CheckCircle2, AlertCircle, X, Eye } from "lucide-react"

export default function OCRProcessor({ onOCRComplete, language = "en" }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [processingStep, setProcessingStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef(null)

  const processingSteps = [
    { id: 1, label: "Uploading file", icon: "📤" },
    { id: 2, label: "Detecting prescription", icon: "🔍" },
    { id: 3, label: "Extracting text (OCR)", icon: "📝" },
    { id: 4, label: "Parsing medicines", icon: "💊" },
    { id: 5, label: "Finalizing", icon: "✓" },
  ]

  // Simulated OCR extraction from image
  const mockOCRExtraction = (fileName) => {
    return {
      prescriptionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      doctorName: "Dr. Rajesh Kumar",
      patientName: "John Doe",
      medicines: [
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          duration: "30 days",
          timing: ["Morning", "Evening"],
          notes: "Take with meals",
        },
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "Ongoing",
          timing: ["Morning"],
          notes: "For blood pressure",
        },
        {
          name: "Atorvastatin",
          dosage: "20mg",
          frequency: "Once daily",
          duration: "Ongoing",
          timing: ["Evening"],
          notes: "For cholesterol",
        },
      ],
      additionalNotes: "Follow up after 2 weeks. Monitor blood pressure daily.",
      confidence: 0.94,
    }
  }

  const handleFileSelect = (newFile) => {
    if (newFile && newFile.type.startsWith("image/")) {
      setFile(newFile)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(newFile)
    } else if (newFile && newFile.type === "application/pdf") {
      setFile(newFile)
      setPreview(null)
    } else {
      alert("Please upload an image or PDF file")
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add("border-cyan-500", "bg-cyan-500/5")
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("border-cyan-500", "bg-cyan-500/5")
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove("border-cyan-500", "bg-cyan-500/5")
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const processFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setExtractedData(null)

    try {
      // Simulate processing with steps
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // Simulate OCR extraction
      const result = mockOCRExtraction(file.name)
      setExtractedData(result)
      setProcessingStep(processingSteps.length)
    } catch (error) {
      console.error("OCR processing error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmExtraction = () => {
    if (extractedData) {
      onOCRComplete({
        file,
        extractedData,
        rawText: extractedData.medicines.map((m) => `${m.name} ${m.dosage} ${m.frequency}`).join(", "),
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Section */}
      {!isProcessing && !extractedData && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-2">Upload Prescription</h3>
          <p className="text-slate-400 mb-8">
            Upload an image or PDF of your prescription for AI-powered OCR extraction
          </p>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center mb-8 transition-all cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              className="hidden"
              id="ocr-file-input"
            />
            <label htmlFor="ocr-file-input" className="cursor-pointer block">
              <Upload className="w-12 h-12 mx-auto text-slate-500 mb-4" />
              <p className="text-white font-semibold text-lg">Drop your prescription here</p>
              <p className="text-slate-400 text-sm mt-2">or click to select a file</p>
              <p className="text-slate-500 text-xs mt-4">Supports JPG, PNG, GIF, BMP, PDF</p>
            </label>
          </div>

          {/* File Preview */}
          {file && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-semibold">{file.name}</p>
                    <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                  className="text-slate-400 hover:text-red-400 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Preview Thumbnail */}
              {preview && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="mt-3 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition"
                >
                  <Eye className="w-4 h-4" />
                  View preview
                </button>
              )}
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={processFile}
            disabled={!file}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Start OCR Processing
            </span>
          </button>
        </div>
      )}

      {/* Processing Steps */}
      {isProcessing && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-8">Processing Prescription</h3>
          <div className="space-y-4">
            {processingSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    processingStep >= idx
                      ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                      : "bg-slate-700/50 border border-slate-600 text-slate-500"
                  }`}
                >
                  {processingStep > idx ? "✓" : <span>{step.icon}</span>}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold transition-colors ${processingStep >= idx ? "text-cyan-400" : "text-slate-400"}`}
                  >
                    {step.label}
                  </p>
                </div>
                {processingStep === idx && <Loader className="w-5 h-5 text-cyan-400 animate-spin" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {extractedData && !isProcessing && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="font-semibold text-white">OCR Processing Complete</h4>
                <p className="text-green-300 text-sm mt-1">
                  Extracted {extractedData.medicines.length} medicines with {Math.round(extractedData.confidence * 100)}
                  % confidence
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6">Extracted Information</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Doctor Name</p>
                <p className="text-white font-semibold">{extractedData.doctorName}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Prescription Date</p>
                <p className="text-white font-semibold">{extractedData.prescriptionDate}</p>
              </div>
            </div>

            {/* Medicines Table */}
            <div className="mb-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-cyan-400">💊</span>
                Extracted Medicines
              </h4>
              <div className="space-y-3">
                {extractedData.medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/50 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-semibold">{med.name}</p>
                        <p className="text-slate-400 text-sm">{med.dosage}</p>
                      </div>
                      <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold border border-cyan-500/30">
                        {med.frequency}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">Duration</p>
                        <p className="text-slate-300">{med.duration}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Timing</p>
                        <p className="text-slate-300">{med.timing.join(", ")}</p>
                      </div>
                    </div>
                    {med.notes && (
                      <p className="text-slate-400 text-sm mt-2 pt-2 border-t border-slate-700/50">
                        <strong>Note:</strong> {med.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {extractedData.additionalNotes && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-semibold text-sm">Additional Notes</p>
                    <p className="text-slate-300 text-sm mt-1">{extractedData.additionalNotes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-700/50">
              <button
                onClick={handleConfirmExtraction}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                Use This Data
              </button>
              <button
                onClick={() => {
                  setExtractedData(null)
                  setFile(null)
                  setPreview(null)
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/95">
              <h4 className="font-semibold text-white">Prescription Preview</h4>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-300 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <img src={preview || "/placeholder.svg"} alt="Prescription preview" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
