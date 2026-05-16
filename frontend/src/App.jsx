import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import Candidates from './components/Candidates'
import UploadResume from './components/UploadResume'
import JobDescriptions from './components/JobDescriptions'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  return user ? children : <Navigate to="/auth" />
}

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/candidates" element={
          <PrivateRoute>
            <Layout>
              <Candidates />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/upload" element={
          <PrivateRoute>
            <Layout>
              <UploadResume />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/jobs" element={
          <PrivateRoute>
            <Layout>
              <JobDescriptions />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App