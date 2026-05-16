import { useState } from 'react'
import { useNavigate } from 'react-router-dom'  // Add this
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/Button'
import { Mail, Lock, Chrome } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { adminLogin } = useAuth()
  const navigate = useNavigate()  // Add this

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Hardcoded admin credentials
    if (email === 'varshu@gmail.com' && password === 'varshu') {
      await adminLogin({ email: 'varshu@gmail.com', name: 'Admin' })
      navigate('/')  // Redirect to dashboard after login
    } else {
      setError('Invalid credentials. Only admin can access.')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-between">
        <div>
          <div className="text-3xl font-bold mb-8">ResumeAI</div>
          <h1 className="text-4xl font-bold mb-4">Screen 100s of resumes in seconds.</h1>
          <p className="text-blue-100 text-lg">
            Upload PDFs or DOCX files. Our AI extracts skills, education, and experience — then scores each candidate against your job description.
          </p>
        </div>
        <div className="text-sm text-blue-200">© ResumeAI Screening Suite</div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your HR workspace.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500">OR</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => alert('Google login disabled for admin only')}>
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}