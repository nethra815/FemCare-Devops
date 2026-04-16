import Sidebar from "./Sidebar"

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  )
}
