import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService, jobService } from '../../services/services';
import toast from 'react-hot-toast';
import { FiUsers, FiBriefcase, FiFileText, FiLink } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [jobData, setJobData] = useState({
    title: '', company: '', description: '', requirements: '',
    location: { city: '', state: '', country: '', isRemote: false },
    jobType: 'full-time', workplaceType: 'on-site', experienceLevel: 'entry',
    salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
    skills: ''
  });
  const [creatingJob, setCreatingJob] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setCreatingJob(true);
    try {
      const payload = {
        ...jobData,
        skills: jobData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };
      await jobService.createJob(payload);
      toast.success('Job created successfully');
      setJobData({
        title: '', company: '', description: '', requirements: '',
        location: { city: '', state: '', country: '', isRemote: false },
        jobType: 'full-time', workplaceType: 'on-site', experienceLevel: 'entry',
        salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
        skills: ''
      });
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Failed to create job');
    } finally {
      setCreatingJob(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="empty-state" style={{ marginTop: '5rem' }}><h3>Access Denied</h3></div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '5rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      {loadingStats ? (
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={FiUsers} label="Total Users" value={stats?.users} color="#3b82f6" />
          <StatCard icon={FiBriefcase} label="Active Jobs" value={stats?.jobs} color="#10b981" />
          <StatCard icon={FiFileText} label="Total Posts" value={stats?.posts} color="#8b5cf6" />
          <StatCard icon={FiLink} label="Connections" value={stats?.connections} color="#f59e0b" />
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Post a New Job</h2>
        <form onSubmit={handleJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Job Title</label>
              <input type="text" className="form-control" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Company</label>
              <input type="text" className="form-control" required value={jobData.company} onChange={e => setJobData({...jobData, company: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-control" required rows={3} value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} />
          </div>
          
          <div>
            <label className="form-label">Requirements</label>
            <textarea className="form-control" rows={2} value={jobData.requirements} onChange={e => setJobData({...jobData, requirements: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Location (City, Country)</label>
              <input type="text" className="form-control" placeholder="e.g. San Francisco, USA" 
                onChange={e => {
                  const parts = e.target.value.split(',');
                  setJobData({...jobData, location: {...jobData.location, city: parts[0]?.trim() || '', country: parts[1]?.trim() || ''}})
                }} 
              />
            </div>
            <div>
              <label className="form-label">Skills (comma separated)</label>
              <input type="text" className="form-control" value={jobData.skills} onChange={e => setJobData({...jobData, skills: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label className="form-label">Job Type</label>
              <select className="form-control" value={jobData.jobType} onChange={e => setJobData({...jobData, jobType: e.target.value})}>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="form-label">Workplace</label>
              <select className="form-control" value={jobData.workplaceType} onChange={e => setJobData({...jobData, workplaceType: e.target.value})}>
                <option value="on-site">On-Site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="form-label">Experience</label>
              <select className="form-control" value={jobData.experienceLevel} onChange={e => setJobData({...jobData, experienceLevel: e.target.value})}>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={creatingJob} style={{ marginTop: '1rem' }}>
            {creatingJob ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
      <div style={{ background: `${color}22`, color: color, padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value || 0}</p>
      </div>
    </div>
  );
}
