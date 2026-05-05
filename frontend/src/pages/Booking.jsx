import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    appointmentDate: '',
    serviceId: location.state?.selectedServiceId || ''
  });
  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        setServices(data);
        if (!formData.serviceId && data.length > 0) {
          setFormData(prev => ({ ...prev, serviceId: data[0]._id }));
        }
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', error: false });

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ loading: false, message: 'Your appointment has been requested beautifully. We will contact you soon!', error: false });
        setTimeout(() => navigate('/services'), 3000);
      } else {
        setStatus({ loading: false, message: data.error || 'Failed to book appointment', error: true });
      }
    } catch (error) {
      setStatus({ loading: false, message: 'Network error. Please try again later.', error: true });
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '3rem', position: 'relative' }}>
        
        {/* Decorative corner accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '2px solid var(--accent-gold)', borderLeft: '2px solid var(--accent-gold)', borderTopLeftRadius: '12px' }}></div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '2px solid var(--accent-gold)', borderRight: '2px solid var(--accent-gold)', borderBottomRightRadius: '12px' }}></div>

        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Reserve Your <span style={{ color: 'var(--accent-gold)' }}>Time</span></h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>Please fill in your details to request an appointment.</p>

        {status.message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '2rem', 
            borderRadius: '8px', 
            backgroundColor: status.error ? 'rgba(255, 50, 50, 0.1)' : 'rgba(212, 175, 55, 0.1)',
            color: status.error ? '#ff6b6b' : 'var(--accent-gold)',
            border: `1px solid ${status.error ? '#ff6b6b' : 'var(--accent-gold)'}`,
            textAlign: 'center'
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Full Name</label>
            <input 
              type="text" 
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Phone Number</label>
            <input 
              type="tel" 
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Select Service</label>
            <select 
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
              style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none', appearance: 'none' }}
            >
              {services.map(s => (
                <option key={s._id} value={s._id} style={{ background: 'var(--bg-card)', color: '#fff' }}>
                  {s.name} - ₹{s.price}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Preferred Date & Time</label>
            <input 
              type="datetime-local" 
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
              style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none', colorScheme: 'dark' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={status.loading}
            style={{ marginTop: '1rem', padding: '1.2rem', fontSize: '1.1rem', letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            {status.loading ? 'Requesting...' : 'Confirm Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
