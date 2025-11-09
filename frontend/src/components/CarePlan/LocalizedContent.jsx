"use client"

import { Volume2, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export default function LocalizedContent({ language, children, content, onSpeak }) {
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSpeak = () => {
    if (!window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(content || children)
    utterance.lang = language === "hi" ? "hi-IN" : "en-US"
    utterance.rate = 0.9
    utterance.onend = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content || children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">{children}</div>
      <button
        onClick={handleSpeak}
        className={`p-2 rounded-lg transition-all ${
          isSpeaking
            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            : "text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50"
        }`}
        title="Speak"
      >
        <Volume2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-all ${
          copied
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50"
        }`}
        title="Copy"
      >
        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}
