import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Scissors, Calendar, UserCog } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: Sparkles },
    { name: 'Services', path: '/services', icon: Scissors },
    { name: 'Book', path: '/book', icon: Calendar },
    { name: 'Admin', path: '/admin', icon: UserCog },
  ];

  return (
    <nav className="glass-nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles color="var(--accent-gold)" size={28} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '1px' }}>Apsaras</h1>
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-main)',
                  fontWeight: isActive ? '600' : '400',
                  borderBottom: isActive ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  paddingBottom: '0.25rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
