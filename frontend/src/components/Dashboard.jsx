import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, UserCheck, Clock, XCircle, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, shortlisted: 0, pending: 0, rejected: 0 })
  const [scoreData, setScoreData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/dashboard')
      setStats(res.data.stats)
      setScoreData(res.data.scoreDistribution)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }

  const scoreDistribution = [
    { range: '0-20', count: scoreData['0-20'] || 0 },
    { range: '21-40', count: scoreData['21-40'] || 0 },
    { range: '41-60', count: scoreData['41-60'] || 0 },
    { range: '61-80', count: scoreData['61-80'] || 0 },
    { range: '81-100', count: scoreData['81-100'] || 0 },
  ]

  const pieData = [
    { name: 'Shortlisted', value: stats.shortlisted, color: '#22c55e' },
    { name: 'Pending', value: stats.pending, color: '#eab308' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/upload')}>
          <Upload className="mr-2 h-4 w-4" /> Upload Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Total Candidates</p><p className="text-2xl font-bold">{stats.total}</p></div>
            <Users className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Shortlisted</p><p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p></div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div><p className="text-sm text-gray-500">Rejected</p><p className="text-2xl font-bold text-red-600">{stats.rejected}</p></div>
            <XCircle className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}