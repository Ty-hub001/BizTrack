import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { Toast, useToast } from '../components/Toast';

const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
};

const Profile = () => {
  const { token } = useAuth();
  const { colors, isDark } = useTheme();
  const { toasts, removeToast, toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [focusedField, setFocusedField] = useState(null);
  const [nameForm, setNameForm] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const fileInputRef = useRef(null);

  const saveBtnHover = useHover();
  const pwBtnHover = useHover();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://biztrack-production-fc4d.up.railway.app/api/auth/profile', { headers });
        setProfile(res.data);
        setNameForm(res.data.name);
      } catch (err) {
        toast.error('Failed to load profile', 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file', 'Invalid file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB', 'File too large');
      return;
    }

    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        await axios.put('https://biztrack-production-fc4d.up.railway.app/api/auth/profile', {
          name: profile.name,
          avatar: base64,
        }, { headers });
        setProfile(prev => ({ ...prev, avatar: base64 }));
        toast.success('Profile photo updated!', 'Updated!');
      } catch (err) {
        toast.error('Failed to update photo', 'Error');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    try {
      await axios.put('https://biztrack-production-fc4d.up.railway.app/api/auth/profile', {
        name: profile.name,
        avatar: null,
      }, { headers });
      setProfile(prev => ({ ...prev, avatar: null }));
      toast.success('Profile photo removed', 'Removed');
    } catch (err) {
      toast.error('Failed to remove photo', 'Error');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    try {
      await axios.put('https://biztrack-production-fc4d.up.railway.app/api/auth/profile', { name: nameForm, avatar: profile.avatar }, { headers });
      setProfile(prev => ({ ...prev, name: nameForm }));
      toast.success('Name updated successfully', 'Updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update', 'Error');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match', 'Error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters', 'Warning');
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.put('https://biztrack-production-fc4d.up.railway.app/api/auth/profile', {
        name: profile.name,
        avatar: profile.avatar,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, { headers });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully', 'Updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password', 'Error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputStyle = (field) => ({
    display: 'flex', alignItems: 'center',
    backgroundColor: colors.inputBg,
    border: `1.5px solid ${focusedField === field ? '#6366f1' : colors.borderMed}`,
    borderRadius: '10px', padding: '0 14px', gap: '10px',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
    transition: 'all 0.2s ease',
  });

  const sharedInput = {
    flex: 1, border: 'none', outline: 'none',
    padding: '13px 0', fontSize: '14px',
    color: colors.text, backgroundColor: 'transparent',
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const tabs = [
    { id: 'info', label: '👤 Personal Info' },
    { id: 'password', label: '🔒 Change Password' },
  ];

  return (
    <Layout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: colors.text, margin: 0 }}>Profile</h1>
        <p style={{ fontSize: '14px', color: colors.textMuted, margin: '4px 0 0' }}>Manage your account information</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: colors.textMuted, marginTop: 16 }}>Loading profile...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: '24px', alignItems: 'flex-start' }}>

          {/* Profile Card */}
          <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: '28px', boxShadow: colors.cardShadow, textAlign: 'center', border: `1px solid ${colors.border}` }}>

            {/* Avatar */}
            <div style={{ position: 'relative', width: '88px', margin: '0 auto 16px' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={() => setAvatarHovered(true)}
                onMouseLeave={() => setAvatarHovered(false)}
                style={{
                  width: '88px', height: '88px', borderRadius: '50%',
                  background: profile?.avatar ? 'none' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '34px',
                  cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  border: '3px solid #6366f1',
                  transition: 'all 0.2s ease',
                  transform: avatarHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profile?.name?.charAt(0).toUpperCase()
                )}

                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: avatarHovered ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  fontSize: '20px',
                }}>
                  📷
                </div>
              </div>

              {/* Loading spinner overlay */}
              {avatarLoading && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
                </div>
              )}

              {/* Edit badge */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', cursor: 'pointer',
                  border: `2px solid ${colors.surface}`,
                }}
              >✏️</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />

            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>{profile?.name}</h2>
            <p style={{ fontSize: '14px', color: colors.textMuted, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</p>

            {/* Upload/Remove buttons */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', marginTop: '12px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${colors.borderMed}`, backgroundColor: colors.surfaceHover, color: colors.textSec, cursor: 'pointer', fontWeight: 500 }}
              >
                📷 Change photo
              </button>
              {profile?.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
              {[
                { label: 'Member since', value: memberSince },
                { label: 'Account ID', value: `#${profile?.id}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: colors.textMuted }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textSec }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '8px', padding: '10px', backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff', borderRadius: '10px', border: '1px solid #ede9fe' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#7c3aed' }}>✨ Active Account</p>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: isMobile ? '20px' : '28px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: colors.bg, borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
                    backgroundColor: activeTab === tab.id ? colors.surface : 'transparent',
                    color: activeTab === tab.id ? colors.text : colors.textMuted,
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    fontSize: isMobile ? '13px' : '14px', cursor: 'pointer',
                    boxShadow: activeTab === tab.id ? colors.cardShadow : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >{tab.label}</button>
              ))}
            </div>

            {/* Info Tab */}
            {activeTab === 'info' && (
              <form onSubmit={handleUpdateInfo}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSec, marginBottom: '8px' }}>Full Name</label>
                    <div style={inputStyle('name')}>
                      <span>👤</span>
                      <input style={sharedInput} type="text" value={nameForm}
                        onChange={e => setNameForm(e.target.value)}
                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} required />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSec, marginBottom: '8px' }}>
                      Email Address <span style={{ color: colors.textMuted, fontWeight: 400 }}>(cannot be changed)</span>
                    </label>
                    <div style={{ ...inputStyle('email'), backgroundColor: colors.bg, cursor: 'not-allowed' }}>
                      <span>✉️</span>
                      <input style={{ ...sharedInput, color: colors.textMuted, cursor: 'not-allowed' }} type="email" value={profile?.email || ''} disabled />
                      <span style={{ fontSize: '12px', color: colors.textMuted, backgroundColor: colors.surfaceHover, padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>Read only</span>
                    </div>
                  </div>
                  <button type="submit" disabled={infoLoading}
                    onMouseEnter={saveBtnHover.onMouseEnter} onMouseLeave={saveBtnHover.onMouseLeave}
                    style={{
                      padding: '13px 28px', borderRadius: '10px', border: 'none', alignSelf: 'flex-start',
                      background: infoLoading ? '#a5b4fc' : saveBtnHover.hovered ? 'linear-gradient(135deg, #4338ca, #7c3aed)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', fontWeight: 600, fontSize: '14px', cursor: infoLoading ? 'not-allowed' : 'pointer',
                      transform: saveBtnHover.hovered && !infoLoading ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: saveBtnHover.hovered && !infoLoading ? '0 8px 20px rgba(99,102,241,0.35)' : '0 4px 12px rgba(99,102,241,0.2)',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}>
                    {infoLoading ? 'Saving...' : '✓ Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { key: 'currentPassword', label: 'Current Password', icon: '🔒', show: showCurrentPw, toggle: () => setShowCurrentPw(!showCurrentPw), placeholder: 'Enter current password' },
                    { key: 'newPassword', label: 'New Password', icon: '🔑', show: showNewPw, toggle: () => setShowNewPw(!showNewPw), placeholder: 'Min. 6 characters' },
                    { key: 'confirmPassword', label: 'Confirm New Password', icon: '🔑', show: showConfirmPw, toggle: () => setShowConfirmPw(!showConfirmPw), placeholder: 'Re-enter new password' },
                  ].map(({ key, label, icon, show, toggle: togglePw, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSec, marginBottom: '8px' }}>{label}</label>
                      <div style={{
                        ...inputStyle(key),
                        borderColor: key === 'confirmPassword' && passwordForm.confirmPassword
                          ? passwordForm.newPassword === passwordForm.confirmPassword ? '#10b981' : '#ef4444'
                          : focusedField === key ? '#6366f1' : colors.borderMed,
                      }}>
                        <span>{icon}</span>
                        <input style={sharedInput} type={show ? 'text' : 'password'} placeholder={placeholder}
                          value={passwordForm[key]}
                          onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                          onFocus={() => setFocusedField(key)} onBlur={() => setFocusedField(null)} required />
                        <span onClick={togglePw} style={{ cursor: 'pointer', fontSize: '15px', userSelect: 'none' }}>{show ? '🙈' : '👁️'}</span>
                      </div>
                      {key === 'newPassword' && passwordForm.newPassword && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ height: '4px', backgroundColor: colors.border, borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '99px', transition: 'width 0.3s ease', width: passwordForm.newPassword.length >= 10 ? '100%' : passwordForm.newPassword.length >= 6 ? '60%' : '30%', backgroundColor: passwordForm.newPassword.length >= 10 ? '#10b981' : passwordForm.newPassword.length >= 6 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: passwordForm.newPassword.length >= 10 ? '#10b981' : passwordForm.newPassword.length >= 6 ? '#d97706' : '#dc2626' }}>
                            {passwordForm.newPassword.length >= 10 ? 'Strong password' : passwordForm.newPassword.length >= 6 ? 'Medium strength' : 'Too short'}
                          </p>
                        </div>
                      )}
                      {key === 'confirmPassword' && passwordForm.confirmPassword && (
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: passwordForm.newPassword === passwordForm.confirmPassword ? '#10b981' : '#dc2626' }}>
                          {passwordForm.newPassword === passwordForm.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>
                  ))}

                  <button type="submit" disabled={passwordLoading}
                    onMouseEnter={pwBtnHover.onMouseEnter} onMouseLeave={pwBtnHover.onMouseLeave}
                    style={{
                      padding: '13px 28px', borderRadius: '10px', border: 'none', alignSelf: 'flex-start',
                      background: passwordLoading ? '#a5b4fc' : pwBtnHover.hovered ? 'linear-gradient(135deg, #4338ca, #7c3aed)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', fontWeight: 600, fontSize: '14px', cursor: passwordLoading ? 'not-allowed' : 'pointer',
                      transform: pwBtnHover.hovered && !passwordLoading ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: pwBtnHover.hovered && !passwordLoading ? '0 8px 20px rgba(99,102,241,0.35)' : '0 4px 12px rgba(99,102,241,0.2)',
                      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}>
                    {passwordLoading ? 'Updating...' : '🔒 Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;