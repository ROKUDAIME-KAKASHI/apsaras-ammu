import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, IndianRupee } from 'lucide-react';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : '/_/backend';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch services:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '3rem' }}>Our Signature <span style={{ color: 'var(--accent-rose)' }}>Services</span></h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Indulge in our carefully curated selection of premium beauty treatments designed to enhance your natural radiance.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--accent-gold)', fontSize: '1.2rem' }}>Loading our luxurious treatments...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {services.map((service, index) => (
            <div 
              key={service._id} 
              className="glass-panel" 
              style={{ 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                animationDelay: `${index * 100}ms`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{service.name}</h3>
              <p style={{ color: 'var(--text-muted)', flex: 1, marginBottom: '1.5rem' }}>{service.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)' }}>
                  <Clock size={16} />
                  <span style={{ fontSize: '0.9rem' }}>{service.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  <IndianRupee size={18} />
                  <span>{service.price}</span>
                </div>
              </div>
              <Link to="/book" state={{ selectedServiceId: service._id }} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                Book This Service
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
