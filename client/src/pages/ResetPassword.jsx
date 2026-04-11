import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const btnHover = useHover();

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://biztrack-production-fc4d.up.railway.app/api/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#fff', borderRadius: '10px', padding: '0 14px',
    border: `1.5px solid ${
      field === 'confirm' && confirmPassword
        ? password === confirmPassword ? '#10b981' : '#ef4444'
        : focusedField === field ? '#6366f1' : '#e2e8f0'
    }`,
    boxShadow: focusedField === field ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
    transition: 'all 0.2s ease',
  });

  const sharedInput = {
    flex: 1, border: 'none', outline: 'none',
    padding: '13px 0', fontSize: '14px',
    color: '#0f172a', backgroundColor: 'transparent', width: '100%',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <Logo size={38} showText={true} textColor="#0f172a" />
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
                ✅
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>Password reset!</h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: '0 0 24px' }}>
                Your password has been changed successfully. Redirecting you to login in 3 seconds...
              </p>
              <Link to="/login" style={{ display: 'inline-block', backgroundColor: '#6366f1', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
                Go to Login →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>
                🔒
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Set new password</h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px', lineHeight: 1.6 }}>
                Your new password must be at least 6 characters long.
              </p>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>New Password</label>
                  <div style={inputStyle('password')}>
                    <span style={{ fontSize: '15px', flexShrink: 0 }}>🔑</span>
                    <input style={sharedInput} type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} required />
                    <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', fontSize: '15px', flexShrink: 0, userSelect: 'none' }}>
                      {showPassword ? '🙈' : '👁️'}
                    </span>
                  </div>
                  {password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ height: '4px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '99px', transition: 'width 0.3s ease', width: password.length >= 10 ? '100%' : password.length >= 6 ? '60%' : '30%', backgroundColor: password.length >= 10 ? '#10b981' : password.length >= 6 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: password.length >= 10 ? '#10b981' : password.length >= 6 ? '#d97706' : '#dc2626' }}>
                        {password.length >= 10 ? 'Strong password' : password.length >= 6 ? 'Medium strength' : 'Too short'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Confirm New Password</label>
                  <div style={inputStyle('confirm')}>
                    <span style={{ fontSize: '15px', flexShrink: 0 }}>🔑</span>
                    <input style={sharedInput} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter new password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} required />
                    <span onClick={() => setShowConfirm(!showConfirm)} style={{ cursor: 'pointer', fontSize: '15px', flexShrink: 0, userSelect: 'none' }}>
                      {showConfirm ? '🙈' : '👁️'}
                    </span>
                  </div>
                  {confirmPassword && (
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: password === confirmPassword ? '#10b981' : '#dc2626' }}>
                      {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
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
                      Resetting password...
                    </span>
                  ) : 'Reset Password →'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>
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

export default ResetPassword;