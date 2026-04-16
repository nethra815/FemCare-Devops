import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, Heart, TrendingUp, Plus, Droplet, Activity } from "lucide-react"

export default function CycleTracker() {
  const [cycles, setCycles] = useState([])
  const [stats, setStats] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    flowLevel: "medium",
    symptoms: [],
  })
  const [loading, setLoading] = useState(true)

  const symptomOptions = [
    "Cramps", "Headache", "Mood Swings", "Fatigue", "Bloating",
    "Back Pain", "Breast Tenderness", "Acne", "Nausea"
  ]

  useEffect(() => {
    fetchCycleData()
  }, [])

  const fetchCycleData = async () => {
    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const [cyclesRes, statsRes, predictionRes] = await Promise.all([
        axios.get("http://localhost:5000/api/cycles", config),
        axios.get("http://localhost:5000/api/cycles/stats", config).catch(() => ({ data: null })),
        axios.get(`http://localhost:5000/api/cycles/${user.userId}/predict`, config).catch(() => ({ data: null })),
      ])

      setCycles(cyclesRes.data)
      setStats(statsRes.data)
      setPrediction(predictionRes.data)
    } catch (error) {
      console.error("Error fetching cycle data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation: Require start date
    if (!formData.startDate) {
      alert("Please select a start date")
      return
    }
    
    // Validation: End date must be after or same as start date
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before start date")
      return
    }
    
    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:5000/api/cycles", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setShowForm(false)
      setFormData({ startDate: "", endDate: "", flowLevel: "medium", symptoms: [] })
      fetchCycleData()
    } catch (error) {
      alert(error.response?.data?.error || "Failed to log cycle")
    }
  }

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cycle data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Cycle Tracker
              </span>
            </h1>
            <p className="text-gray-600">Track and understand your menstrual health</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Log Cycle
          </button>
        </div>

        {/* Log Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Log New Cycle</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Flow Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {["light", "medium", "heavy"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, flowLevel: level })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.flowLevel === level
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-300"
                      }`}
                    >
                      <Droplet className={`w-6 h-6 mx-auto mb-2 ${
                        formData.flowLevel === level ? "text-pink-600" : "text-gray-400"
                      }`} />
                      <p className="text-sm font-semibold capitalize">{level}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {symptomOptions.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${
                        formData.symptoms.includes(symptom)
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">Save Cycle</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <Calendar className="w-8 h-8 mb-3" />
              <p className="text-pink-100 text-sm mb-1">Average Cycle Length</p>
              <p className="text-3xl font-bold">{stats.average_cycle_length || "N/A"} days</p>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Activity className="w-8 h-8 mb-3" />
              <p className="text-purple-100 text-sm mb-1">Average Period Length</p>
              <p className="text-3xl font-bold">{stats.average_period_length || "N/A"} days</p>
            </div>

            <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <TrendingUp className="w-8 h-8 mb-3" />
              <p className="text-indigo-100 text-sm mb-1">Total Cycles Tracked</p>
              <p className="text-3xl font-bold">{stats.total_cycles}</p>
            </div>
          </div>
        )}

        {/* Prediction Card */}
        {prediction && (
          <div className="card bg-gradient-to-br from-pink-50 to-purple-50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Fertility Prediction</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Next Period Expected</p>
                <p className="text-xl font-bold text-gray-800">
                  {new Date(prediction.predicted_next_start).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Fertile Window</p>
                <p className="text-xl font-bold text-gray-800">
                  {new Date(prediction.fertility_window_start).toLocaleDateString()} - {new Date(prediction.fertility_window_end).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-xl">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Confidence:</span> {prediction.confidence}
              </p>
            </div>
          </div>
        )}

        {/* Cycle History */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cycle History</h2>

          {cycles.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No cycles logged yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                Log Your First Cycle
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cycles.map((cycle) => (
                <div key={cycle.cycleId} className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {new Date(cycle.startDate).toLocaleDateString()}
                          {cycle.endDate && ` - ${new Date(cycle.endDate).toLocaleDateString()}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {cycle.endDate && `${Math.ceil((new Date(cycle.endDate) - new Date(cycle.startDate)) / (1000 * 60 * 60 * 24))} days`}
                        </p>
                      </div>
                    </div>
                    {cycle.flowLevel && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        cycle.flowLevel === "light" ? "bg-blue-100 text-blue-700" :
                        cycle.flowLevel === "medium" ? "bg-pink-100 text-pink-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {cycle.flowLevel}
                      </span>
                    )}
                  </div>

                  {cycle.symptoms && cycle.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cycle.symptoms.map((symptom, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
