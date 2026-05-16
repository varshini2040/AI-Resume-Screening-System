import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon, User } from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center">
      <div className="text-sm text-gray-500">Workspace</div>
      <div className="flex items-center gap-4">
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">{user?.email}</span>
        </div>
      </div>
    </header>
  )
}