import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Hero Section */}
      <section style={{ 
        height: 'calc(100vh - 80px)', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, var(--bg-card) 0%, var(--bg-dark) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract shapes for background */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(183,110,121,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div className="container" style={{ textAlign: 'center', zIndex: 1, maxWidth: '800px' }}>
          <h4 style={{ color: 'var(--accent-rose)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }} className="delay-100">
            Welcome to Premium Care
          </h4>
          <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }} className="delay-200">
            Discover Your True <br/>
            <span style={{ color: 'transparent', WebkitTextStroke: '1px var(--accent-gold)', backgroundImage: 'linear-gradient(45deg, var(--accent-gold), var(--accent-rose))', WebkitBackgroundClip: 'text' }}>Beauty</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }} className="delay-300">
            Experience world-class beauty treatments in an atmosphere of pure luxury and relaxation. Book your session today and let us pamper you.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/book" className="btn btn-primary delay-300">
              Book Appointment
            </Link>
            <Link to="/services" className="btn btn-outline delay-300">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
