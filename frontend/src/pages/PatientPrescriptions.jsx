import { useState, useEffect } from "react"
import axios from "axios"
import { Pill, Calendar, User, FileText } from "lucide-react"

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/prescriptions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPrescriptions(response.data)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              My Prescriptions
            </span>
          </h1>
          <p className="text-gray-600">Prescriptions issued by your doctors</p>
        </div>

        {prescriptions.length === 0 ? (
          <div className="card text-center py-16">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No prescriptions yet</h3>
            <p className="text-gray-500">Prescriptions from your doctors will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div key={p.prescriptionId} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{p.medication}</h3>
                      {p.dosage && <p className="text-sm text-gray-600">{p.dosage}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                    {p.doctor_info && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        Dr. {p.doctor_info.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {p.diagnosis && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Diagnosis</p>
                      <p className="text-sm text-blue-900">{p.diagnosis}</p>
                    </div>
                  )}
                  {p.duration && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs font-semibold text-purple-700 mb-1">Duration</p>
                      <p className="text-sm text-purple-900">{p.duration}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
