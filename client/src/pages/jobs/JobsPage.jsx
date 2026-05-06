import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { jobService } from '../../services/services'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMapPin, FiBriefcase, FiDollarSign, FiClock, FiBookmark, FiSearch, FiFilter, FiSend } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'temporary']
const LEVELS    = ['entry', 'mid', 'senior', 'lead', 'executive']
const WORKPLACE = ['on-site', 'remote', 'hybrid']

export default function JobsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [applying, setApplying] = useState(false)
  const [filters, setFilters] = useState({ jobType: '', experienceLevel: '', workplaceType: '', search: '' })
  const [applyCover, setApplyCover] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['jobs', filters], queryFn: () => jobService.getJobs(filters) })
  const jobs = data?.data || []

  const handleFilter = (k, v) => setFilters(p => ({ ...p, [k]: p[k] === v ? '' : v }))

  const applyJob = async () => {
    setApplying(true)
    try {
      await jobService.applyForJob(selected._id, { coverLetter: applyCover })
      toast.success('Application submitted!')
      setSelected(null); setApplyCover('')
    } catch (err) { toast.error(err.message) }
    finally { setApplying(false) }
  }

  const saveToggle = async (job) => {
    try {
      const saved = user?.savedJobs?.includes(job._id)
      saved ? await jobService.unsaveJob(job._id) : await jobService.saveJob(job._id)
      toast.success(saved ? 'Removed from saved' : 'Job saved')
      qc.invalidateQueries(['jobs'])
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 1rem 2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Find Jobs</h1>
      <div className="jobs-layout">
        {/* Filters + List */}
        <div>
          {/* Search */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
              <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Search jobs, skills..."
                value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} id="job-search-input" />
            </div>
          </div>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Type</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {JOB_TYPES.map(t => <FilterChip key={t} label={t} active={filters.jobType === t} onClick={() => handleFilter('jobType', t)} />)}
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '0.875rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workplace</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {WORKPLACE.map(t => <FilterChip key={t} label={t} active={filters.workplaceType === t} onClick={() => handleFilter('workplaceType', t)} />)}
            </div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '0.875rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {LEVELS.map(t => <FilterChip key={t} label={t} active={filters.experienceLevel === t} onClick={() => handleFilter('experienceLevel', t)} />)}
            </div>
          </div>
          {/* Job List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="card skeleton" style={{ height: 100 }} />) :
              jobs.length === 0 ? <div className="card empty-state"><div className="empty-state-icon">💼</div><h3>No jobs found</h3></div> :
              jobs.map(job => (
                <div key={job._id} className={`card job-card ${selected?._id === job._id ? 'selected' : ''}`} onClick={() => setSelected(job)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p className="job-card-title">{job.title}</p>
                      <p className="job-card-company">{job.company}</p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={e => { e.stopPropagation(); saveToggle(job) }}><FiBookmark size={16} /></button>
                  </div>
                  <div className="job-meta-tags">
                    {job.location?.country && <span className="badge badge-blue"><FiMapPin size={10}/>{job.location.country}</span>}
                    <span className="badge badge-green"><FiBriefcase size={10}/>{job.jobType}</span>
                    {job.workplaceType === 'remote' && <span className="badge badge-purple">Remote</span>}
                    <span className="badge badge-yellow">{job.experienceLevel}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</p>
                </div>
              ))
            }
          </div>
        </div>
        {/* Detail panel */}
        <div>
          {selected ? (
            <div className="card" style={{ position: 'sticky', top: '72px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selected.title}</h2>
              <p style={{ color: 'var(--brand-500)', fontWeight: 600, marginTop: '0.25rem' }}>{selected.company}</p>
              <div className="job-meta-tags" style={{ marginTop: '0.75rem' }}>
                {selected.location?.country && <span className="badge badge-blue"><FiMapPin size={10}/>{selected.location.country}</span>}
                <span className="badge badge-green">{selected.jobType}</span>
                <span className="badge badge-yellow">{selected.experienceLevel}</span>
                {selected.salary?.min && <span className="badge badge-purple"><FiDollarSign size={10}/>{selected.salary.min.toLocaleString()} - {selected.salary.max?.toLocaleString()}</span>}
              </div>
              <div className="divider" />
              <h4 style={{ marginBottom: '0.5rem' }}>Description</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selected.description}</p>
              {selected.skills?.length > 0 && (
                <>
                  <h4 style={{ margin: '1rem 0 0.5rem' }}>Required Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {selected.skills.map(s => <span key={s} className="badge badge-blue">{s}</span>)}
                  </div>
                </>
              )}
              <div className="divider" />
              <h4 style={{ marginBottom: '0.75rem' }}>Cover Letter (optional)</h4>
              <textarea value={applyCover} onChange={e => setApplyCover(e.target.value)}
                className="form-input" placeholder="Tell them why you're a great fit..." style={{ minHeight: 100 }} />
              <button id="apply-job-btn" className="btn btn-primary w-full" style={{ marginTop: '0.75rem', gap: '0.5rem' }}
                onClick={applyJob} disabled={applying}>
                <FiSend size={15} /> {applying ? 'Submitting...' : 'Apply Now'}
              </button>
            </div>
          ) : (
            <div className="card empty-state" style={{ position: 'sticky', top: '72px' }}>
              <div className="empty-state-icon">👈</div>
              <h3>Select a job</h3>
              <p style={{ fontSize: '0.875rem' }}>Click a job card to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`badge ${active ? 'badge-blue' : ''}`}
      style={{ cursor: 'pointer', border: active ? 'none' : '1px solid var(--border)', background: active ? undefined : 'transparent', color: active ? undefined : 'var(--text-secondary)', textTransform: 'capitalize', padding: '0.3rem 0.7rem', transition: 'var(--transition)' }}>
      {label}
    </button>
  )
}
