import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import axios from 'axios';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/dashboard' },
  { id: 'clients', label: 'Clients', icon: '👥', path: '/clients' },
  { id: 'projects', label: 'Projects', icon: '📁', path: '/projects' },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
];

const Layout = ({ children }) => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle, colors } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [themeHovered, setThemeHovered] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProfile(res.data)).catch(() => {});
  }, [token]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const activePage = navItems.find(n => location.pathname === n.path)?.id || 'dashboard';

  const Avatar = ({ size = 34 }) => (
    <Link to="/profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: `${size * 0.38}px`,
        overflow: 'hidden', border: '2px solid #6366f1',
        cursor: 'pointer', transition: 'transform 0.2s ease',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {profile?.avatar
          ? <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : profile?.name?.charAt(0).toUpperCase() || 'U'
        }
      </div>
    </Link>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bg, fontFamily: "'Segoe UI', sans-serif", transition: 'background-color 0.3s ease' }}>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 150, backdropFilter: 'blur(2px)' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '240px', backgroundColor: colors.sidebar,
        display: 'flex', flexDirection: 'column', padding: '24px 16px',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isMobile && sidebarOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
        borderRight: `1px solid ${colors.sidebarBorder}`,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '28px', borderBottom: `1px solid ${colors.sidebarBorder}`, marginBottom: '24px' }}>
          <Logo size={34} showText={true} textColor="#ffffff" />
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        {/* Avatar in sidebar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: colors.sidebarActive, borderRadius: '10px', marginBottom: '20px' }}>
          <Avatar size={36} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name || 'User'}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email || ''}</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <Link key={item.id} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 12px', borderRadius: '8px',
                  backgroundColor: isActive ? '#6366f1' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  fontSize: '14px', fontWeight: 500,
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.6)' }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <button onClick={toggle} onMouseEnter={() => setThemeHovered(true)} onMouseLeave={() => setThemeHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '8px',
            backgroundColor: themeHovered ? colors.sidebarActive : 'transparent',
            border: `1px solid ${colors.sidebarBorder}`,
            color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
            marginBottom: '8px', width: '100%', transition: 'all 0.2s ease',
          }}>
          <span style={{ fontSize: '16px' }}>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout */}
        <button onClick={handleLogout} onMouseEnter={() => setLogoutHovered(true)} onMouseLeave={() => setLogoutHovered(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', borderRadius: '8px',
            backgroundColor: logoutHovered ? '#fee2e2' : 'transparent',
            border: `1px solid ${logoutHovered ? '#fca5a5' : colors.sidebarBorder}`,
            color: logoutHovered ? '#dc2626' : '#64748b',
            fontSize: '14px', cursor: 'pointer', width: '100%',
            transform: logoutHovered ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}>
          <span>⎋</span> Logout
        </button>
      </aside>

      {/* Main wrapper */}
      <div style={{ marginLeft: isMobile ? '0' : '240px', flex: 1, minWidth: 0, transition: 'margin-left 0.3s ease' }}>

        {/* Mobile Top Bar */}
        {isMobile && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 100,
            backgroundColor: colors.sidebar,
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', backgroundColor: '#fff', borderRadius: '2px' }} />)}
            </button>

            <Logo size={28} showText={true} textColor="#ffffff" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={toggle} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                {isDark ? '☀️' : '🌙'}
              </button>
              <Avatar size={34} />
            </div>
          </div>
        )}

        {/* Page Content */}
        <div style={{ padding: isMobile ? '20px 16px' : '32px', transition: 'background-color 0.3s ease' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;