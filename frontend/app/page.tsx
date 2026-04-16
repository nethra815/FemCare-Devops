export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-600">HealthCare MERN Platform</h1>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Full-Stack Healthcare Platform</h2>
          <p className="text-xl text-gray-600 mb-6">
            A complete MERN application for healthcare management with doctor booking, appointment scheduling, and
            menstrual cycle tracking.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
            <p className="text-blue-900 font-medium">
              This is a full-stack MERN project with separate server and client directories. Follow the setup
              instructions below to run it locally.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">Project Structure</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">📁</span>
                <span>
                  <strong>/server</strong> - Express.js backend with MongoDB
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">📁</span>
                <span>
                  <strong>/client</strong> - React + Vite frontend
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">📄</span>
                <span>
                  <strong>package.json</strong> - Root package with dev scripts
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">📄</span>
                <span>
                  <strong>README.md</strong> - Complete documentation
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">Quick Start</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                  1
                </span>
                <span>
                  <strong>Install dependencies:</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">npm install</code>
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                  2
                </span>
                <span>
                  <strong>Setup MongoDB:</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">
                    Create .env in /server with MONGODB_URI
                  </code>
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                  3
                </span>
                <span>
                  <strong>Seed database:</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">npm run seed</code>
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                  4
                </span>
                <span>
                  <strong>Start development:</strong>
                  <code className="block bg-gray-100 p-2 rounded mt-1 text-sm">npm run dev</code>
                </span>
              </li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-bold mb-3 text-indigo-600">Backend Features</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ JWT Authentication</li>
              <li>✓ Role-based Access Control</li>
              <li>✓ Doctor Approval Workflow</li>
              <li>✓ Appointment Conflict Prevention</li>
              <li>✓ Cycle Prediction Algorithm</li>
              <li>✓ Notification System</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-bold mb-3 text-indigo-600">Frontend Features</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Doctor Search & Booking</li>
              <li>✓ Appointment Management</li>
              <li>✓ Cycle Tracking</li>
              <li>✓ Fertility Predictions</li>
              <li>✓ Admin Dashboard</li>
              <li>✓ Responsive Design</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-bold mb-3 text-indigo-600">Test Credentials</h4>
            <ul className="space-y-2 text-sm text-gray-700 font-mono">
              <li>
                <strong>Admin:</strong>
                <br />
                admin@local.test
              </li>
              <li>
                <strong>Doctor:</strong>
                <br />
                dr.ram@local.test
              </li>
              <li>
                <strong>Patient:</strong>
                <br />
                alice@local.test
              </li>
              <li className="text-xs text-gray-500">Password: Password123!</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-indigo-600">Environment Setup</h3>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="text-sm font-mono text-gray-700 mb-2">
              <strong>Create /server/.env:</strong>
            </p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
              {`MONGODB_URI=mongodb://localhost:27017/healthcare
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173`}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-2xl font-bold mb-4 text-indigo-600">Available Scripts</h3>
          <div className="space-y-3">
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="font-mono text-sm text-gray-700">
                <strong>npm run dev</strong>
              </p>
              <p className="text-sm text-gray-600">Run both server and client in development mode</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="font-mono text-sm text-gray-700">
                <strong>npm run dev:server</strong>
              </p>
              <p className="text-sm text-gray-600">Run only the Express server</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="font-mono text-sm text-gray-700">
                <strong>npm run dev:client</strong>
              </p>
              <p className="text-sm text-gray-600">Run only the React frontend</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="font-mono text-sm text-gray-700">
                <strong>npm run seed</strong>
              </p>
              <p className="text-sm text-gray-600">Seed the database with test data</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <p className="font-mono text-sm text-gray-700">
                <strong>npm test</strong>
              </p>
              <p className="text-sm text-gray-600">Run unit tests</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to Get Started?</h3>
          <p className="mb-4">
            Download the project files and follow the setup instructions in the README.md file. The application will be
            available at http://localhost:5173 once running.
          </p>
          <p className="text-sm opacity-90">
            For detailed API documentation, see API_DOCUMENTATION.md in the project root.
          </p>
        </div>
      </div>
    </div>
  )
}
