import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function UploadResume() {
  const [files, setFiles] = useState([])
  const [jobDescriptions, setJobDescriptions] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [customJobDesc, setCustomJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs')
      setJobDescriptions(res.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const onDrop = (acceptedFiles) => {
    // Limit to 100 files
    const newFiles = acceptedFiles.slice(0, 100 - files.length)
    const validFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.docx'))
    if (validFiles.length !== newFiles.length) {
      toast.error('Only PDF and DOCX files are allowed')
    }
    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps } = useDropzone({ onDrop, maxFiles: 100, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } })

  const handleAnalyze = async () => {
    if (files.length === 0) return toast.error('Please select at least one resume')
    const jobDescText = selectedJobId
      ? jobDescriptions.find(j => j._id === selectedJobId)?.description
      : customJobDesc
    if (!jobDescText) return toast.error('Please select or paste a job description')

    setLoading(true)
    setResults([])
    const formData = new FormData()
    files.forEach(file => formData.append('resumes', file))
    formData.append('jobDescription', jobDescText)

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress({ current: percent, total: 100 })
        }
      })
      setResults(res.data.results)
      toast.success(`${res.data.processed} resumes analyzed successfully`)
    } catch (error) {
      toast.error('Analysis failed')
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      shortlisted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Resumes (Batch)</h1>
      <p className="text-gray-500">Upload up to 100 PDF or DOCX files. AI will extract details and score each candidate.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Choose a saved JD...</option>
              {jobDescriptions.map(job => <option key={job._id} value={job._id}>{job.title}</option>)}
            </select>
            <textarea
              rows={4}
              value={customJobDesc}
              onChange={(e) => setCustomJobDesc(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="...or paste a job description here"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Resume Files</CardTitle></CardHeader>
          <CardContent>
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PDF or DOCX, up to 10MB each, max 100 files</p>
            </div>
            {files.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(idx)}><X className="w-4 h-4 text-red-500" /></button>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full mt-4" onClick={handleAnalyze} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {loading ? `Processing ${progress.current}%` : `Analyze ${files.length} Resume(s)`}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Analysis Results</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Candidate</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-center">Score</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-left">Skills</th>
                    <th className="px-4 py-2 text-left">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2 font-medium">{r.name}</td>
                      <td className="px-4 py-2 text-gray-500">{r.email}</td>
                      <td className="px-4 py-2 text-center font-bold">{r.score}%</td>
                      <td className="px-4 py-2 text-center">{getStatusBadge(r.status)}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {r.skills?.slice(0, 3).map((s, i) => <span key={i} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{s}</span>)}
                          {r.skills?.length > 3 && <span className="text-xs text-gray-500">+{r.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm">{r.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}