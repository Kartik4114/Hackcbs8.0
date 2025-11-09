"use client"

import { useState } from "react"
import { Sparkles, Loader, CheckCircle2, AlertCircle, BarChart3, TrendingUp, Apple } from "lucide-react"

export default function TreatmentPlanGenerator({ medicines, condition, onPlanGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [activeSection, setActiveSection] = useState("overview")
  const [generationProgress, setGenerationProgress] = useState(0)

  const generationSteps = [
    { label: "Analyzing medicines", icon: "💊" },
    { label: "Assessing condition", icon: "🔍" },
    { label: "Generating diet plan", icon: "🥗" },
    { label: "Creating exercise routine", icon: "🏃" },
    { label: "Building daily checklist", icon: "✓" },
    { label: "Finalizing plan", icon: "🎯" },
  ]

  // Simulated AI plan generation
  const generatePlan = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedPlan(null)

    try {
      // Simulate step-by-step generation
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Mock generated plan based on medicines
      const mockPlan = {
        overview: {
          condition: condition || "Chronic Disease Management",
          duration: "90 days",
          objectives: [
            "Maintain consistent medication adherence",
            "Achieve target blood pressure/glucose levels",
            "Improve overall health metrics",
            "Reduce symptoms and complications",
          ],
          riskFactors: [
            "Irregular medication schedule",
            "Poor diet compliance",
            "Sedentary lifestyle",
            "Stress and sleep deprivation",
          ],
        },
        dietPlan: {
          nutritionGoals: {
            calories: "1800-2000 kcal/day",
            protein: "50-60g",
            carbs: "220-250g",
            fat: "50-70g",
          },
          mealsPerDay: 3,
          snacksPerDay: 2,
          foods_to_eat: [
            "Whole grains (brown rice, oats, whole wheat bread)",
            "Leafy vegetables (spinach, kale, broccoli)",
            "Lean proteins (chicken breast, fish, tofu)",
            "Low-fat dairy (yogurt, milk, cheese)",
            "Fresh fruits (berries, apples, oranges)",
            "Nuts and seeds (almonds, flax seeds)",
            "Legumes (lentils, beans, chickpeas)",
          ],
          foods_to_avoid: [
            "Refined sugars and processed foods",
            "High-sodium foods and canned items",
            "Fried and fatty foods",
            "Alcohol and sugary beverages",
            "Cream and full-fat dairy",
            "Processed meats",
          ],
          mealSchedule: {
            breakfast: "7:00 AM - 50g carbs, 15g protein",
            midMorningSnack: "10:00 AM - Light snack with fruit",
            lunch: "1:00 PM - Balanced meal with vegetables",
            afternoonSnack: "4:00 PM - Healthy snack",
            dinner: "7:30 PM - Light meal, 2 hours before bed",
          },
          waterIntake: "8-10 glasses per day (2-2.5 liters)",
        },
        exercisePlan: {
          frequency: "5 days per week",
          duration: "30-45 minutes per session",
          activities: [
            {
              day: "Monday, Wednesday, Friday",
              type: "Cardio",
              duration: "30 minutes",
              intensity: "Moderate",
              examples: "Brisk walking, cycling, swimming",
            },
            {
              day: "Tuesday, Thursday",
              type: "Strength Training",
              duration: "20-30 minutes",
              intensity: "Light to Moderate",
              examples: "Bodyweight exercises, resistance bands",
            },
            {
              day: "Daily",
              type: "Stretching & Flexibility",
              duration: "10 minutes",
              intensity: "Light",
              examples: "Yoga, tai chi, gentle stretching",
            },
          ],
          precautions: [
            "Warm up for 5 minutes before exercise",
            "Cool down for 5 minutes after exercise",
            "Stay hydrated throughout",
            "Stop if you experience chest pain or dizziness",
          ],
        },
        dosAndDonts: {
          dos: [
            "Take medications at the same time every day",
            "Monitor blood pressure/glucose regularly",
            "Keep a health diary and track symptoms",
            "Attend all follow-up appointments",
            "Exercise consistently",
            "Get 7-8 hours of quality sleep",
            "Manage stress through meditation or yoga",
            "Maintain regular social connections",
            "Review diet and adjust portions as needed",
            "Stay hydrated throughout the day",
          ],
          donts: [
            "Skip or delay medication doses",
            "Consume high-sodium or high-sugar foods",
            "Sit or lie down for extended periods",
            "Smoke or use tobacco products",
            "Consume alcohol excessively",
            "Stay up late or disrupt sleep schedule",
            "Ignore warning symptoms",
            "Stop medications without consulting doctor",
            "Engage in extreme stress or emotional upheaval",
            "Neglect regular health check-ups",
          ],
        },
        dailyChecklist: [
          {
            category: "medicine",
            task: "Take morning medication",
            time: "7:00 AM",
            completed: false,
          },
          {
            category: "exercise",
            task: "30-minute walk or exercise",
            time: "6:00 PM",
            completed: false,
          },
          {
            category: "diet",
            task: "Eat balanced meals",
            time: "Throughout day",
            completed: false,
          },
          {
            category: "medicine",
            task: "Take evening medication",
            time: "8:00 PM",
            completed: false,
          },
          {
            category: "meditation",
            task: "10-minute meditation",
            time: "9:00 PM",
            completed: false,
          },
        ],
        milestones: [
          {
            week: 2,
            goal: "Establish medication routine",
            indicator: "100% medication adherence",
          },
          {
            week: 4,
            goal: "Improve energy levels",
            indicator: "Reduced fatigue, better sleep",
          },
          {
            week: 8,
            goal: "Achieve target health metrics",
            indicator: "Normal BP/glucose readings",
          },
          {
            week: 12,
            goal: "Establish sustainable lifestyle",
            indicator: "Consistent exercise and diet habits",
          },
        ],
      }

      setGeneratedPlan(mockPlan)
      setGenerationProgress(generationSteps.length)
      onPlanGenerated?.(mockPlan)
    } catch (error) {
      console.error("Plan generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      {!isGenerating && !generatedPlan && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 rounded-lg border border-cyan-500/30">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Generate AI Treatment Plan</h3>
              <p className="text-slate-400 text-sm mt-1">Create a personalized 90-day plan</p>
            </div>
          </div>

          <p className="text-slate-300 mb-8 leading-relaxed">
            Based on your medicines and medical condition, our AI will generate a comprehensive treatment plan including
            personalized diet, exercise, and daily routines optimized for your recovery.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Medicines Analyzed</p>
              <p className="text-2xl font-bold text-cyan-400">{medicines?.length || 0}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Plan Duration</p>
              <p className="text-2xl font-bold text-cyan-400">90 Days</p>
            </div>
          </div>

          <button
            onClick={generatePlan}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            <Sparkles className="w-5 h-5" />
            Generate Treatment Plan
          </button>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-8">Generating Your Treatment Plan</h3>
          <div className="space-y-4">
            {generationSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 ${
                    generationProgress > idx
                      ? "bg-green-500/20 border border-green-500/50 text-green-400"
                      : generationProgress === idx
                        ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-400"
                        : "bg-slate-700/50 border border-slate-600 text-slate-500"
                  }`}
                >
                  {generationProgress > idx ? "✓" : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold transition-colors ${
                      generationProgress >= idx ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {generationProgress === idx && <Loader className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(generationProgress / generationSteps.length) * 100}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-3 text-right">
              {Math.round((generationProgress / generationSteps.length) * 100)}% complete
            </p>
          </div>
        </div>
      )}

      {/* Generated Plan Display */}
      {generatedPlan && !isGenerating && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Treatment Plan Generated Successfully</h4>
                <p className="text-green-300 text-sm mt-1">Your personalized 90-day plan is ready</p>
              </div>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="flex overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: "📋" },
                { id: "diet", label: "Diet Plan", icon: "🥗" },
                { id: "exercise", label: "Exercise", icon: "🏃" },
                { id: "checklist", label: "Daily Checklist", icon: "✓" },
                { id: "milestones", label: "Milestones", icon: "🎯" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-6 py-4 font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
                    activeSection === tab.id
                      ? "border-cyan-500 text-cyan-400 bg-slate-700/50"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Plan Content */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-3">{generatedPlan.overview.condition}</h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Plan Duration</p>
                      <p className="text-xl font-semibold text-cyan-400">{generatedPlan.overview.duration}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Medicines</p>
                      <p className="text-xl font-semibold text-cyan-400">{medicines?.length} active</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Treatment Objectives
                  </h5>
                  <ul className="space-y-2">
                    {generatedPlan.overview.objectives.map((obj, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    Key Risk Factors
                  </h5>
                  <ul className="space-y-2">
                    {generatedPlan.overview.riskFactors.map((risk, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <span className="text-yellow-400 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Diet Plan Section */}
            {activeSection === "diet" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Apple className="w-5 h-5 text-green-400" />
                    Nutrition Goals
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(generatedPlan.dietPlan.nutritionGoals).map(([key, value]) => (
                      <div key={key} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 capitalize">{key}</p>
                        <p className="text-lg font-semibold text-cyan-400">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Foods to Eat</h5>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <ul className="grid md:grid-cols-2 gap-2">
                      {generatedPlan.dietPlan.foods_to_eat.map((food, idx) => (
                        <li key={idx} className="flex gap-2 text-slate-300 text-sm">
                          <span className="text-green-400">✓</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Foods to Avoid</h5>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <ul className="grid md:grid-cols-2 gap-2">
                      {generatedPlan.dietPlan.foods_to_avoid.map((food, idx) => (
                        <li key={idx} className="flex gap-2 text-slate-300 text-sm">
                          <span className="text-red-400">✗</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Daily Meal Schedule</h5>
                  <div className="space-y-2">
                    {Object.entries(generatedPlan.dietPlan.mealSchedule).map(([time, details]) => (
                      <div key={time} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                        <p className="text-white font-semibold text-sm capitalize">{time.replace(/([A-Z])/g, " $1")}</p>
                        <p className="text-slate-400 text-sm mt-1">{details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Exercise Plan Section */}
            {activeSection === "exercise" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Frequency</p>
                    <p className="text-lg font-semibold text-cyan-400">{generatedPlan.exercisePlan.frequency}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Per Session</p>
                    <p className="text-lg font-semibold text-cyan-400">{generatedPlan.exercisePlan.duration}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-white mb-4">Weekly Exercise Schedule</h5>
                  <div className="space-y-3">
                    {generatedPlan.exercisePlan.activities.map((activity, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-semibold">{activity.type}</p>
                            <p className="text-slate-400 text-sm">{activity.day}</p>
                          </div>
                          <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold border border-cyan-500/30">
                            {activity.intensity}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{activity.duration}</p>
                        <p className="text-slate-300 text-sm">{activity.examples}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Safety Precautions</h5>
                  <ul className="space-y-2">
                    {generatedPlan.exercisePlan.precautions.map((precaution, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-slate-300 text-sm bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20"
                      >
                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Daily Checklist Section */}
            {activeSection === "checklist" && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-4">Daily Tasks</h4>
                {generatedPlan.dailyChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{item.task}</p>
                          <p className="text-slate-400 text-sm mt-1">{item.time}</p>
                        </div>
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded capitalize">{item.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Milestones Section */}
            {activeSection === "milestones" && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  90-Day Milestones
                </h4>
                {generatedPlan.milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="relative bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-lg p-5 border border-slate-700/50 hover:border-slate-600/50 transition"
                  >
                    {/* Timeline connector */}
                    {idx < generatedPlan.milestones.length - 1 && (
                      <div className="absolute left-7 top-20 w-1 h-12 bg-gradient-to-b from-cyan-500/30 to-slate-700/30" />
                    )}

                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white font-semibold">Week {milestone.week}</p>
                          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-500/30">
                            Goal
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium">{milestone.goal}</p>
                        <p className="text-slate-400 text-sm mt-2">
                          <strong>Indicator:</strong> {milestone.indicator}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Do's and Don'ts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Do's
              </h5>
              <ul className="space-y-2">
                {generatedPlan.dosAndDonts.dos.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-slate-300 text-sm">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Don'ts
              </h5>
              <ul className="space-y-2">
                {generatedPlan.dosAndDonts.donts.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-slate-300 text-sm">
                    <span className="text-red-400 font-bold">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
