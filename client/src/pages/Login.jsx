import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { login } = useAuth();
  const navigate = useNavigate();
  const btnHover = useHover();
  const linkHover = useHover();
  const forgotHover = useHover();

  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    display: 'flex', alignItems: 'center',
    backgroundColor: '#fff',
    border: `1.5px solid ${focusedField === field ? '#6366f1' : '#e2e8f0'}`,
    borderRadius: '10px', padding: '0 14px', gap: '10px',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8fafc' }}>

      {/* Left Panel — hidden on mobile */}
      {!isMobile && (
        <div style={{
          flex: 1,
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '440px' }}>
            <div style={{ marginBottom: '48px' }}>
              <Logo size={42} showText={true} textColor="#ffffff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '38px', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: '16px' }}>
              Manage your business with clarity
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
              Track clients, projects and tasks — all in one place. Built for freelancers and small teams.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: '👥', label: 'Client Management' },
                { icon: '📁', label: 'Project Tracking' },
                { icon: '✅', label: 'Task Oversight' },
                { icon: '📊', label: 'Live Dashboard' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {f.icon}
                  </div>
                  <span style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: 500 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: 300, height: 300, top: -80, right: -80, borderRadius: '50%', backgroundColor: '#6366f1', opacity: 0.06 }} />
          <div style={{ position: 'absolute', width: 200, height: 200, bottom: 80, right: 40, borderRadius: '50%', backgroundColor: '#6366f1', opacity: 0.04 }} />
        </div>
      )}

      {/* Right Panel */}
      <div style={{
        width: isMobile ? '100%' : '520px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '40px 24px' : '48px 40px',
        backgroundColor: '#f8fafc',
        minHeight: isMobile ? '100vh' : 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Mobile brand header */}
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
              <Logo size={38} showText={true} textColor="#0f172a" />
            </div>
          )}

          <h2 style={{ fontSize: isMobile ? '26px' : '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 32px' }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Email address
              </label>
              <div style={inputStyle('email')}>
                <span style={{ fontSize: '15px', flexShrink: 0 }}>✉️</span>
                <input
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '13px 0', fontSize: '14px', color: '#0f172a', backgroundColor: 'transparent', width: '100%' }}
                  type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            {/* Password with forgot link */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  onMouseEnter={forgotHover.onMouseEnter}
                  onMouseLeave={forgotHover.onMouseLeave}
                  style={{
                    fontSize: '12px',
                    color: forgotHover.hovered ? '#4338ca' : '#6366f1',
                    textDecoration: forgotHover.hovered ? 'underline' : 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={inputStyle('password')}>
                <span style={{ fontSize: '15px', flexShrink: 0 }}>🔒</span>
                <input
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '13px 0', fontSize: '14px', color: '#0f172a', backgroundColor: 'transparent', width: '100%' }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer', fontSize: '15px', flexShrink: 0, userSelect: 'none' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={btnHover.onMouseEnter}
              onMouseLeave={btnHover.onMouseLeave}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
                color: '#fff', fontWeight: 700, fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#a5b4fc' : btnHover.hovered
                  ? 'linear-gradient(135deg, #4338ca, #7c3aed)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                transform: btnHover.hovered && !loading ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: btnHover.hovered && !loading
                  ? '0 8px 24px rgba(99,102,241,0.4)'
                  : '0 4px 12px rgba(99,102,241,0.25)',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              onMouseEnter={linkHover.onMouseEnter}
              onMouseLeave={linkHover.onMouseLeave}
              style={{
                color: linkHover.hovered ? '#4338ca' : '#6366f1',
                fontWeight: 600,
                textDecoration: linkHover.hovered ? 'underline' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;