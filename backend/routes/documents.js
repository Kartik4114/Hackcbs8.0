const express = require("express")
const multer = require("multer")
const cloudinary = require("../config/cloudinary")
const Document = require("../models/Document")
const authMiddleware = require("../middleware/auth")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Upload document
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "healthhub-documents" },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )
      uploadStream.end(req.file.buffer)
    })

    const document = new Document({
      userId: req.userId,
      title: req.body.title || req.file.originalname,
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      documentType: "general",
    })

    await document.save()
    res.status(201).json(document)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all documents for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId }).sort({ uploadedAt: -1 })
    res.json(documents)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete document
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id)

    if (document && document.fileUrl) {
      const publicId = document.fileUrl.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(`healthhub-documents/${publicId}`)
    }

    res.json({ message: "Document deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
