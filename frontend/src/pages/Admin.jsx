import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, LogOut, Lock } from 'lucide-react';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
    setBookings([]);
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/services`)
      ]);

      if (bookingsRes.status === 401) {
        handleLogout();
        return;
      }

      const bookingsData = await bookingsRes.json();
      const servicesData = await servicesRes.json();

      const servicesMap = {};
      servicesData.forEach(s => { servicesMap[s._id] = s; });

      setBookings(bookingsData);
      setServices(servicesMap);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#4ade80';
      case 'Cancelled': return '#f87171';
      default: return '#fbbf24';
    }
  };

  if (!token) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '3rem', textAlign: 'center' }}>
          <Lock size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Admin Access</h2>
          
          {loginError && (
            <div style={{ color: '#ff6b6b', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '4px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="password" 
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Login</button>
          </form>
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>*Default password is <strong>admin123</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: 0 }}>
          Admin <span style={{ color: 'var(--accent-gold)' }}>Dashboard</span>
        </h2>
        <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--accent-gold)' }}>Loading bookings...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)' }}>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Date Requested</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Customer</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Phone</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Service</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Appt Date</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings found.</td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' }}}>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{b.customerName}</td>
                    <td style={{ padding: '1rem' }}>{b.phoneNumber}</td>
                    <td style={{ padding: '1rem', color: 'var(--accent-rose)' }}>{services[b.serviceId]?.name || 'Unknown'}</td>
                    <td style={{ padding: '1rem' }}>{new Date(b.appointmentDate).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: `${getStatusColor(b.status)}20`,
                        color: getStatusColor(b.status),
                        border: `1px solid ${getStatusColor(b.status)}50`
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      {b.status === 'Pending' && (
                        <>
                          <button onClick={() => updateStatus(b._id, 'Confirmed')} title="Confirm" style={{ background: 'transparent', color: '#4ade80' }}><CheckCircle size={20} /></button>
                          <button onClick={() => updateStatus(b._id, 'Cancelled')} title="Cancel" style={{ background: 'transparent', color: '#f87171' }}><XCircle size={20} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
