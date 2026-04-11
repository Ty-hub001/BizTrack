import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const btnHover = useHover();
  const linkHover = useHover();

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
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <Logo size={38} showText={true} textColor="#0f172a" />
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: isMobile ? '28px 24px' : '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>

          {success ? (
            /* Success State */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
                ✉️
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>Check your email</h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: '0 0 8px' }}>
                We sent a password reset link to
              </p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#6366f1', margin: '0 0 28px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email}
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 28px' }}>
                Click the link in the email to reset your password. The link expires in 1 hour.
              </p>
              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Didn't receive it? Check your spam folder or{' '}
                  <button onClick={() => { setSuccess(false); setEmail(''); }}
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: '13px', padding: 0 }}>
                    try again
                  </button>
                </p>
              </div>
              <Link to="/login" style={{ display: 'block', textAlign: 'center', color: '#6366f1', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                ← Back to Login
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>
                🔑
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Forgot password?</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px', lineHeight: 1.6 }}>
                No worries! Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email address</label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    backgroundColor: '#fff', borderRadius: '10px', padding: '0 14px',
                    border: `1.5px solid ${focusedField === 'email' ? '#6366f1' : '#e2e8f0'}`,
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{ fontSize: '15px', flexShrink: 0 }}>✉️</span>
                    <input
                      style={{ flex: 1, border: 'none', outline: 'none', padding: '13px 0', fontSize: '14px', color: '#0f172a', backgroundColor: 'transparent', width: '100%' }}
                      type="email" placeholder="you@example.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} required />
                  </div>
                </div>

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
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
                      Sending reset link...
                    </span>
                  ) : 'Send Reset Link →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link to="/login"
                  onMouseEnter={linkHover.onMouseEnter} onMouseLeave={linkHover.onMouseLeave}
                  style={{ color: linkHover.hovered ? '#4338ca' : '#6366f1', fontWeight: 600, textDecoration: 'none', fontSize: '14px', transition: 'all 0.2s ease' }}>
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;