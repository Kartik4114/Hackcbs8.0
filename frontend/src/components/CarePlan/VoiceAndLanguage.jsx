"use client"

import { useState, useRef } from "react"
import { Volume2, Pause, Play, Settings, Globe, Volume, Zap } from "lucide-react"
import { translations, getTranslation } from "../../utils/translations"

export default function VoiceAndLanguage({ language, onLanguageChange, onVoiceSettingsChange }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechRate, setSpeechRate] = useState(0.9)
  const [volume, setVolume] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const synth = useRef(typeof window !== "undefined" ? window.speechSynthesis : null)

  const handleTextToSpeech = (text) => {
    if (!synth.current) return

    if (isSpeaking) {
      synth.current.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechRate
    utterance.volume = volume
    utterance.lang = language === "hi" ? "hi-IN" : "en-US"
    utterance.onend = () => setIsSpeaking(false)
    utterance.onstart = () => setIsSpeaking(true)

    synth.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synth.current) {
      synth.current.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm space-y-4">
      {/* Language Selection */}
      <div>
        <label className="flex items-center gap-2 text-white font-semibold mb-3">
          <Globe className="w-5 h-5 text-cyan-400" />
          {getTranslation(language, "common", "language")}
        </label>
        <div className="flex gap-3">
          {Object.entries(translations).map(([lang, data]) => (
            <button
              key={lang}
              onClick={() => onLanguageChange?.(lang)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                language === lang
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                  : "bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-slate-500"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Settings */}
      <div className="border-t border-slate-700/30 pt-4">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-white font-semibold">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            {getTranslation(language, "voice", "textToSpeech")}
          </label>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition text-slate-400 hover:text-cyan-400"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Speech Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() =>
              handleTextToSpeech("This is a sample voice. You can listen to this to adjust the voice settings.")
            }
            className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              isSpeaking
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
            }`}
          >
            {isSpeaking ? (
              <>
                <Pause className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Test Voice
              </>
            )}
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 space-y-4">
            {/* Speech Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  {getTranslation(language, "voice", "speed")}
                </label>
                <span className="text-xs text-cyan-400 font-semibold">{(speechRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => {
                  setSpeechRate(Number.parseFloat(e.target.value))
                  onVoiceSettingsChange?.({ speechRate: Number.parseFloat(e.target.value) })
                }}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Volume className="w-4 h-4 text-cyan-400" />
                  {getTranslation(language, "voice", "volume")}
                </label>
                <span className="text-xs text-cyan-400 font-semibold">{(volume * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  setVolume(Number.parseFloat(e.target.value))
                  onVoiceSettingsChange?.({ volume: Number.parseFloat(e.target.value) })
                }}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Voice Info */}
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/50">
              <p className="text-xs text-slate-400">
                <strong>Current Language:</strong> {language === "en" ? "English (en-US)" : "Hindi (hi-IN)"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
