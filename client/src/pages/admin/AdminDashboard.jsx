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
  
  // User management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'user'
  });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

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

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await adminService.createUser(userData);
      toast.success('User created successfully');
      setUserData({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
      setShowUserModal(false);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
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

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>Add New User</button>
        </div>

        {loadingUsers ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Password (Hash)</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {u._id}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <code style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '2px 4px', borderRadius: '4px' }}>
                        {u.password ? u.password.substring(0, 15) + '...' : 'N/A'}
                      </code>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleDeleteUser(u._id)} 
                        style={{ color: '#ef4444' }}
                        disabled={u.email === user.email}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2rem', borderRadius: 'var(--radius-xl)', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Add New User</h2>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" required value={userData.firstName} onChange={e => setUserData({...userData, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" required value={userData.lastName} onChange={e => setUserData({...userData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" required value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" required value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={userData.role} onChange={e => setUserData({...userData, role: e.target.value})}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowUserModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creatingUser} style={{ flex: 1 }}>
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
