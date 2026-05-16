import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function JobDescriptions() {
  const [jobs, setJobs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    const res = await axios.get('/api/jobs')
    setJobs(res.data)
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) return toast.error('Title and description required')
    await axios.post('/api/jobs', { title, description })
    toast.success('Job description saved')
    setTitle(''); setDescription(''); setShowForm(false)
    fetchJobs()
  }

  const handleDelete = async (id) => {
    await axios.delete(`/api/jobs/${id}`)
    toast.success('Deleted')
    fetchJobs()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Descriptions</h1>
        <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" />New JD</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New job description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            <textarea rows={5} placeholder="Description (responsibilities, required skills, qualifications...)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            <div className="flex gap-2"><Button onClick={handleSave}>Save JD</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map(job => (
          <Card key={job._id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>{job.title}</CardTitle>
              <button onClick={() => handleDelete(job._id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
            </CardHeader>
            <CardContent><p className="text-sm text-gray-600 line-clamp-3">{job.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}