const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/health-records", require("./routes/healthRecords"))
app.use("/api/documents", require("./routes/documents"))
app.use("/api/blood-banks", require("./routes/bloodBanks"))
app.use("/api/care-plans", require("./routes/carePlans"))
app.use("/api/test-reports", require("./routes/testReports")) // Add test reports route
app.use("/api/health-passport", require("./routes/healthPassport"))

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
