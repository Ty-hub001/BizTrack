import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
};

const Register = () => {
  const [name, setName] = useState('');
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
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('https://biztrack-production-fc4d.up.railway.app/api/auth/register', { name, email, password });
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

  const sharedInput = {
    flex: 1, border: 'none', outline: 'none',
    padding: '13px 0', fontSize: '14px',
    color: '#0f172a', backgroundColor: 'transparent', width: '100%',
  };

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
              Start managing smarter today
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
              Join BizTrack and get a full suite of tools to manage your clients, projects and tasks with ease.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { step: '01', title: 'Create your account', desc: 'Register in seconds, no credit card needed' },
                { step: '02', title: 'Add your clients', desc: 'Import or add clients one by one' },
                { step: '03', title: 'Track everything', desc: 'Create projects and tasks instantly' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <div>
                    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{item.title}</p>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', width: 300, height: 300, top: -80, right: -80, borderRadius: '50%', backgroundColor: '#6366f1', opacity: 0.06 }} />
          <div style={{ position: 'absolute', width: 180, height: 180, bottom: 100, right: 60, borderRadius: '50%', backgroundColor: '#6366f1', opacity: 0.04 }} />
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
            Create your account
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 32px' }}>
            Free forever. No credit card required.
          </p>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Full Name</label>
              <div style={inputStyle('name')}>
                <span style={{ fontSize: '15px', flexShrink: 0 }}>👤</span>
                <input style={sharedInput} type="text" placeholder="John Doe" value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <div style={inputStyle('email')}>
                <span style={{ fontSize: '15px', flexShrink: 0 }}>✉️</span>
                <input style={sharedInput} type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Password</label>
              <div style={inputStyle('password')}>
                <span style={{ fontSize: '15px', flexShrink: 0 }}>🔒</span>
                <input style={sharedInput} type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} required />
                <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', fontSize: '15px', flexShrink: 0, userSelect: 'none' }}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              {/* Password strength */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px', transition: 'width 0.3s ease',
                      width: password.length >= 10 ? '100%' : password.length >= 6 ? '60%' : '30%',
                      backgroundColor: password.length >= 10 ? '#10b981' : password.length >= 6 ? '#f59e0b' : '#ef4444',
                    }} />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: password.length >= 10 ? '#10b981' : password.length >= 6 ? '#d97706' : '#dc2626' }}>
                    {password.length >= 10 ? 'Strong password' : password.length >= 6 ? 'Medium strength' : 'Too short'}
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              onMouseEnter={btnHover.onMouseEnter} onMouseLeave={btnHover.onMouseLeave}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
                color: '#fff', fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#a5b4fc' : btnHover.hovered ? 'linear-gradient(135deg, #4338ca, #7c3aed)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                transform: btnHover.hovered && !loading ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: btnHover.hovered && !loading ? '0 8px 24px rgba(99,102,241,0.4)' : '0 4px 12px rgba(99,102,241,0.25)',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                marginTop: '4px',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login"
              onMouseEnter={linkHover.onMouseEnter} onMouseLeave={linkHover.onMouseLeave}
              style={{ color: linkHover.hovered ? '#4338ca' : '#6366f1', fontWeight: 600, textDecoration: linkHover.hovered ? 'underline' : 'none', transition: 'all 0.2s ease' }}>
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;