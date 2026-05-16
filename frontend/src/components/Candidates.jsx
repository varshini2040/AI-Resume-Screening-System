import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Search, Filter, Download, Eye } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const statusColors = {
  shortlisted: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const res = await axios.get('/api/candidates')
      setCandidates(res.data)
    } catch (error) {
      toast.error('Failed to load candidates')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/candidates/${id}/status`, { status })
      toast.success('Status updated')
      fetchCandidates()
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const filtered = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Candidates</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or skill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="all">All Status</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(candidate => (
          <Card key={candidate._id}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{candidate.name}</h3>
                  <p className="text-sm text-gray-500">{candidate.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[candidate.status]}`}>
                  {candidate.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {candidate.skills?.slice(0, 4).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{skill}</span>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-primary-600">{candidate.score}%</span>
                  <span className="text-xs text-gray-500 ml-1">match</span>
                </div>
                <div className="flex gap-2">
                  <a href={candidate.resumeUrl} download className="p-2 rounded-full hover:bg-gray-100">
                    <Download className="w-4 h-4" />
                  </a>
                  <select
                    value={candidate.status}
                    onChange={(e) => updateStatus(candidate._id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}