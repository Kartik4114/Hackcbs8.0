const axios = require("axios")
const fs = require("fs")
const path = require("path")
const pdfParse = require("pdf-parse")

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL =
  process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
const AI_DISCLAIMER =
  "AI-generated guidance. Please consult a licensed healthcare professional before making medical decisions."

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (err) {
    console.error("PDF extraction error:", err)
    throw new Error("Failed to extract text from PDF")
  }
}

function convertImageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath)
    return imageBuffer.toString("base64")
  } catch (err) {
    console.error("Image conversion error:", err)
    throw new Error("Failed to convert image to base64")
  }
}

async function extractFileContent(filePath, filename) {
  const ext = path.extname(filename).toLowerCase()

  if (ext === ".pdf") {
    return await extractTextFromPDF(filePath)
  } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
    return convertImageToBase64(filePath)
  } else if ([".doc", ".docx", ".txt"].includes(ext)) {
    return fs.readFileSync(filePath, "utf-8")
  }

  throw new Error(`Unsupported file type: ${ext}`)
}

async function analyzeTestReportWithGemini(testData) {
  try {
    const { testType, content, filename, isFile, fileType } = testData

    let contentForPrompt = content
    let mediaContent = null

    if (isFile && fileType && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(fileType)) {
      mediaContent = {
        type: "image",
        base64: content,
        mimeType: fileType,
      }
    } else {
      contentForPrompt = content
    }

    const transcriptContext = mediaContent
      ? `An image of the ${testType || "diagnostic"} report is attached via inline data. Only describe findings that are clearly visible—do NOT invent numbers.`
      : `---BEGIN REPORT TRANSCRIPT---
${contentForPrompt}
---END REPORT TRANSCRIPT---`

    const analysisPrompt = `You are a board-certified clinical pathologist tasked with producing a precise, evidence-backed explanation of a ${
      testType || "diagnostic"
    } report for patients.

Context:
- Test type: ${testType || "Not specified"}
- Input format: ${mediaContent ? "Scanned/photographed report" : "Extracted plain text"}
- Data fidelity: assume OCR may have noise; quote only values you can see.

${transcriptContext}

Output requirements (STRICT):
1. Base every statement on the provided data and include the actual parameter names, numeric values, and units when available. Avoid vague phrases like "some levels are high".
2. When no data exists for a parameter, return an empty array and explicitly mention "No clear data provided" inside the relevant description so the user knows why it is empty.
3. All recommendations must include a rationale tied to a measurement (e.g., "Repeat HbA1c in 3 months because current value 8.2% > 5.6%").
4. Highlight critical findings before moderate ones by using the severity field.
5. Keep language understandable to patients while retaining clinical accuracy.

Return ONLY valid JSON (no markdown, no extra commentary) that matches this schema exactly:
{
  "summary": "2-3 sentence overview referencing concrete values (e.g., \"Fasting glucose 148 mg/dL is above the 100 mg/dL goal...\")",
  "overallAssessment": "Plain-language explanation that ties multiple findings together",
  "redFlags": [
    {
      "parameter": "Test parameter name",
      "value": "Actual value with units",
      "normalRange": "Normal range from report or best-practice guidelines",
      "severity": "critical|high|moderate",
      "recommendation": "Clear clinical next action",
      "description": "Why this matters, referencing the measurement"
    }
  ],
  "positiveFindings": [
    {
      "parameter": "Normal parameter name",
      "value": "Value with units",
      "status": "Normal/Healthy",
      "description": "Explain why it is within target referencing the threshold"
    }
  ],
  "balancingRecommendations": [
    {
      "issue": "Issue identified (e.g., \"Elevated LDL\")",
      "currentState": "Describe the current measurement/value",
      "targetState": "Quantified goal or range",
      "actionItems": ["Action 1 with rationale", "Action 2 with rationale"],
      "timeline": "Specific timeframe such as \"4-6 weeks\"",
      "priority": "high|medium|low"
    }
  ],
  "medicalAdvice": {
    "nextSteps": ["Action — reason tied to data"],
    "followUpTests": ["Test — reason it helps"],
    "consultSpecialist": ["Specialist — why consultation is needed"],
    "precautions": ["Precaution — what it prevents"],
    "lifestyle": ["Habit change — expected impact"]
  },
  "disclaimer": "${AI_DISCLAIMER}"
}

Quality guardrails:
- Cite at least two concrete measurements inside the summary or overallAssessment.
- Never fabricate ranges/values; if unknown, state \"Not specified\".
- The disclaimer text must match exactly as provided above.
- Respond with valid JSON only.`

    const parts = [
      {
        text: analysisPrompt,
      },
    ]

    if (mediaContent) {
      const mimeTypeMap = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
      }
      const mimeType = mimeTypeMap[mediaContent.mimeType] || "image/jpeg"

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: mediaContent.base64,
        },
      })
    }

    const requestBody = {
      contents: [
        {
          parts: parts,
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    }

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const analysisText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ""))
    analysis.disclaimer = analysis.disclaimer || AI_DISCLAIMER

    return analysis
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message)
    throw new Error("Failed to analyze test report with AI: " + err.message)
  }
}

async function analyzePrescriptionWithGemini(prescriptionData) {
  try {
    const { content, filename, isFile } = prescriptionData

    const prompt = `You are an experienced clinical pharmacist. Extract EVERY concrete instruction from the prescription or doctor notes below and convert it into structured patient-friendly guidance.

Source details:
- Filename (if supplied): ${filename || "N/A"}
- Input format: ${isFile ? "Uploaded document" : "Plain text"}

Prescription/Doctor Notes Content:
---BEGIN DOCUMENT---
${content}
---END DOCUMENT---

Output expectations:
1. Use the exact medicine names when visible. If abbreviated, expand common forms (e.g., \"Met\" -> \"Metformin\").
2. Dosage, frequency, duration, and timing must retain the units and cadence given in the document.
3. Diet, lifestyle, and exercise advice must include a short justification (\"what it helps\") in the same string.
4. If the prescription is unclear in any area, explicitly mention \"Not specified in document\" for that field instead of inventing data.
5. Return ONLY valid JSON (no markdown) that matches this schema:
{
  "condition": "Primary condition or symptom focus. Mention if inferred.",
  "summary": "3-4 sentences weaving together how each medicine/direction addresses the condition. Cite key medicine names.",
  "medicines": [
    {
      "name": "Medicine name",
      "dosage": "Amount + unit",
      "frequency": "Cadence such as 'Twice daily'",
      "timing": ["List of times such as Morning, Noon, Evening"],
      "duration": "How long to continue. Use 'Not specified' if missing.",
      "notes": "Purpose or caution (e.g., 'Take after meals to reduce GI upset')"
    }
  ],
  "dietPlan": {
    "foods_to_eat": ["Item — why it helps"],
    "foods_to_avoid": ["Item — risk it mitigates"],
    "meal_schedule": "Meal timing guidance",
    "water_intake": "Liters or glasses per day"
  },
  "dosAndDonts": {
    "dos": ["Action — benefit"],
    "donts": ["Action — risk/why avoid"]
  },
  "precautions": ["Precaution — specific trigger to watch"],
  "followUp": "When to review with doctor and what to monitor",
  "lifestyleChanges": ["Change — projected impact"],
  "exerciseRecommendations": ["Exercise — duration/intensity and reason"],
  "disclaimer": "${AI_DISCLAIMER}"
}

Safety:
- Never suggest a medicine that is not present in the document.
- Flag missing information transparently.
- Use the disclaimer string exactly as provided.`

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    })

    const analysisText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ""))
    analysis.disclaimer = analysis.disclaimer || AI_DISCLAIMER

    return analysis
  } catch (err) {
    console.error("Gemini Prescription Analysis Error:", err.response?.data || err.message)
    throw new Error("Failed to analyze prescription with AI: " + err.message)
  }
}

module.exports = {
  analyzeTestReportWithGemini,
  analyzePrescriptionWithGemini,
  extractFileContent,
  extractTextFromPDF,
  convertImageToBase64,
}
