import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import TeamPage from './pages/TeamPage'
import AdminDashboard from './pages/AdminDashboard'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

// Code Platform
import ContestPage from './pages/code/ContestPage'
import ContestDetailPage from './pages/code/ContestDetailPage'
import ProblemPage from './pages/code/ProblemPage'
import LeaderboardPage from './pages/code/LeaderboardPage'

// Admin specific imports
import CreateContestPage from './pages/admin/CreateContestPage'
import CreateProblemPage from './pages/admin/CreateProblemPage'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] pt-20">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-contest"
            element={
              <ProtectedRoute>
                <CreateContestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-problem"
            element={
              <ProtectedRoute>
                <CreateProblemPage />
              </ProtectedRoute>
            }
          />

          {/* Coding Platform Routes */}
          <Route path="/code" element={<ContestPage />} />
          <Route path="/code/contest/:id" element={<ContestDetailPage />} />
          <Route path="/code/problem/:id" element={<ProblemPage />} />
          <Route path="/code/leaderboard/:id" element={<LeaderboardPage />} />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
