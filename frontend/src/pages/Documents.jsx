"use client"

import { useEffect, useState } from "react"
import { Upload, Trash2, Eye, FileText, ImageIcon, Download, Calendar, Tag, Loader } from "lucide-react"
import client from "../api/client"

// PDF viewer with fallback
const PDFViewer = ({ url, title }) => {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  return (
    <div className="w-full h-full bg-slate-700/30 rounded-lg overflow-hidden flex flex-col">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-slate-300 text-sm">Loading PDF...</p>
          </div>
        </div>
      )}
      {error ? (
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 mb-3">PDF preview unavailable</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Download PDF to view
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
          className="w-full h-full border-0"
          title={title}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
        />
      )}
    </div>
  )
}

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState("")
  const [uploading, setUploading] = useState(false)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data } = await client.get("/documents")
      setDocuments(data)
    } catch (err) {
      console.error("Error fetching documents:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title || file.name)

      await client.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setFile(null)
      setTitle("")
      fetchDocuments()
    } catch (err) {
      console.error("Error uploading document:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await client.delete(`/documents/${id}`)
        fetchDocuments()
      } catch (err) {
        console.error("Error deleting document:", err)
      }
    }
  }

  const getDocumentIcon = (fileType, documentType) => {
    if (fileType?.includes("image")) return <ImageIcon className="w-5 h-5 text-cyan-400" />
    if (fileType?.includes("pdf")) return <FileText className="w-5 h-5 text-red-400" />
    if (documentType === "prescription") return <FileText className="w-5 h-5 text-blue-400" />
    if (documentType === "testReport") return <FileText className="w-5 h-5 text-green-400" />
    return <FileText className="w-5 h-5 text-slate-400" />
  }

  const getDocumentTypeLabel = (documentType) => {
    switch (documentType) {
      case "prescription":
        return "Prescription"
      case "testReport":
        return "Test Report"
      default:
        return "Document"
    }
  }

  const getDocumentTypeColor = (documentType) => {
    switch (documentType) {
      case "prescription":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      case "testReport":
        return "bg-green-500/20 text-green-300 border border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Medical Documents
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            All your prescriptions, test reports, and medical documents in one place
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 mb-8 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            Upload New Document
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title (optional)"
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition flex-1">
                  <Upload className="w-5 h-5 mr-2 text-cyan-400" />
                  <span className="text-sm">{file ? file.name : "Choose File"}</span>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>

        {/* Documents Timeline */}
        {documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 max-w-md mx-auto">
              <FileText className="w-16 h-16 mx-auto text-slate-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No documents yet</h2>
              <p className="text-slate-400">Upload your first document to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc, idx) => (
              <div
                key={doc._id}
                className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      {getDocumentIcon(doc.fileType, doc.documentType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold group-hover:text-cyan-400 transition">{doc.title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getDocumentTypeColor(doc.documentType)}`}
                        >
                          {getDocumentTypeLabel(doc.documentType)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{doc.fileName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Document Info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {doc.fileType || "Unknown type"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition border border-cyan-500/30"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={() => {
                      setViewingDocument(doc)
                      setShowPreview(true)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition border border-blue-500/30"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showPreview && viewingDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold">{viewingDocument.title}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-white transition text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-800/50">
              {viewingDocument.fileType?.includes("image") ? (
                <div className="flex items-center justify-center p-6">
                  <img
                    src={viewingDocument.fileUrl || "/placeholder.svg"}
                    alt={viewingDocument.title}
                    className="max-w-full max-h-[70vh] rounded-lg"
                  />
                </div>
              ) : viewingDocument.fileType?.includes("pdf") ? (
                <PDFViewer url={viewingDocument.fileUrl} title={viewingDocument.title} />
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <p>Preview not available for this file type</p>
                  <a
                    href={viewingDocument.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
