import { Link } from "react-router-dom"
import { Heart, Calendar, Activity, Shield, Users, Sparkles, ArrowRight } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-8 shadow-2xl">
              <Heart className="w-12 h-12 text-white" fill="white" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                FemCare
              </span>
            </h1>
            
            <p className="text-2xl text-gray-700 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-500" />
              Your Complete Women's Health Companion
              <Sparkles className="w-6 h-6 text-purple-500" />
            </p>
            
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Empowering women with comprehensive healthcare management, cycle tracking, 
              and seamless doctor consultations - all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-outline inline-flex items-center justify-center gap-2">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Everything You Need for Your Health
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Cycle Tracking</h3>
            <p className="text-gray-600">
              Track your menstrual cycle, predict fertility windows, and understand your body better with intelligent insights.
            </p>
          </div>

          <div className="card group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Doctor Consultations</h3>
            <p className="text-gray-600">
              Book appointments with verified healthcare professionals specializing in women's health.
            </p>
          </div>

          <div className="card group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Health Records</h3>
            <p className="text-gray-600">
              Securely store and manage your medical records, prescriptions, and health history in one place.
            </p>
          </div>

          <div className="card group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Privacy First</h3>
            <p className="text-gray-600">
              Your health data is encrypted and secure. We prioritize your privacy and confidentiality.
            </p>
          </div>

          <div className="card group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Predictions</h3>
            <p className="text-gray-600">
              Get personalized health insights and predictions based on your cycle history and patterns.
            </p>
          </div>

          <div className="card group hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Holistic Care</h3>
            <p className="text-gray-600">
              Comprehensive approach to women's health covering physical, mental, and reproductive wellness.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-effect rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of women who trust FemCare for their healthcare needs.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg">
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-600" fill="currentColor" />
              <span className="font-bold text-gray-800">FemCare</span>
            </div>
            <p className="text-gray-600 text-sm">
              ©FemCare. Empowering women's health.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link to="/register-doctor" className="hover:text-pink-600 transition-colors">
                For Doctors
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
