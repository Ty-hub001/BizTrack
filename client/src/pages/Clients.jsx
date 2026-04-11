import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import { Toast, useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
};

const Clients = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const { toasts, removeToast, toast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, name: '' });

  const addBtnHover = useHover();
  const saveBtnHover = useHover();
  const cancelBtnHover = useHover();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get('https://biztrack-production-fc4d.up.railway.app/api/clients', { headers });
      setClients(res.data);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editingClient) {
        await axios.put(`https://biztrack-production-fc4d.up.railway.app/api/clients/${editingClient.id}`, form, { headers });
        toast.success('Client updated successfully', 'Updated!');
      } else {
        await axios.post('https://biztrack-production-fc4d.up.railway.app/api/clients', form, { headers });
        toast.success('Client added successfully', 'Created!');
      }
      setForm({ name: '', email: '', phone: '', company: '' });
      setShowForm(false); setEditingClient(null); fetchClients();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg); toast.error(msg, 'Error');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '', company: client.company || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (client) => {
    setConfirmModal({ open: true, id: client.id, name: client.name });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://biztrack-production-fc4d.up.railway.app/api/clients/${confirmModal.id}`, { headers });
      toast.success('Client deleted', 'Deleted');
      setConfirmModal({ open: false, id: null, name: '' });
      fetchClients();
    } catch (err) {
      toast.error('Failed to delete client', 'Error');
    }
  };

  const handleCancel = () => {
    setShowForm(false); setEditingClient(null);
    setForm({ name: '', email: '', phone: '', company: '' }); setError('');
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    padding: '12px 0', fontSize: '14px',
    color: colors.text, backgroundColor: 'transparent', width: '100%',
  };

  const fields = [
    { field: 'name', label: 'Full Name', icon: '👤', placeholder: 'John Doe', type: 'text', required: true },
    { field: 'email', label: 'Email Address', icon: '✉️', placeholder: 'john@example.com', type: 'email' },
    { field: 'phone', label: 'Phone Number', icon: '📞', placeholder: '+234 800 000 0000', type: 'text' },
    { field: 'company', label: 'Company', icon: '🏢', placeholder: 'Acme Corp', type: 'text' },
  ];

  return (
    <Layout>
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirmModal.open}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, id: null, name: '' })}
        title="Delete Client"
        message="This client and all their data will be permanently removed."
        itemName={confirmModal.name}
        confirmLabel="Delete Client"
      />

      {/* Top Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: colors.text, margin: 0 }}>Clients</h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, margin: '4px 0 0' }}>{clients.length} total client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: colors.surface, border: `1.5px solid ${colors.borderMed}`, borderRadius: '10px', padding: '0 14px', flex: isMobile ? 1 : 'none' }}>
            <span style={{ color: colors.textMuted, fontSize: '14px' }}>🔍</span>
            <input
              style={{ border: 'none', outline: 'none', padding: '10px 0', fontSize: '14px', width: isMobile ? '100%' : '180px', color: colors.text, backgroundColor: 'transparent' }}
              placeholder="Search clients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingClient(null); setForm({ name: '', email: '', phone: '', company: '' }); }}
            onMouseEnter={addBtnHover.onMouseEnter} onMouseLeave={addBtnHover.onMouseLeave}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: addBtnHover.hovered ? 'linear-gradient(135deg, #4338ca, #7c3aed)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              transform: addBtnHover.hovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: addBtnHover.hovered ? '0 8px 20px rgba(99,102,241,0.35)' : '0 4px 12px rgba(99,102,241,0.2)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', whiteSpace: 'nowrap',
            }}>+ Add Client</button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: isMobile ? '20px' : '28px', marginBottom: '24px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0 }}>{editingClient ? '✏️ Edit Client' : '➕ Add New Client'}</h2>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0' }}>{editingClient ? 'Update client information' : 'Fill in the details below'}</p>
            </div>
            <button onClick={handleCancel} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}>✕</button>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {fields.map(({ field, label, icon, placeholder, type, required }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSec, marginBottom: '8px' }}>{label}</label>
                  <div style={inputStyle(field)}>
                    <span style={{ fontSize: '15px' }}>{icon}</span>
                    <input
                      style={sharedInput} type={type} placeholder={placeholder} value={form[field]}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      onFocus={() => setFocusedField(field)} onBlur={() => setFocusedField(null)} required={required} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button type="submit" onMouseEnter={saveBtnHover.onMouseEnter} onMouseLeave={saveBtnHover.onMouseLeave}
                style={{
                  padding: '12px 28px', borderRadius: '10px', border: 'none',
                  background: saveBtnHover.hovered ? 'linear-gradient(135deg, #4338ca, #7c3aed)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  transform: saveBtnHover.hovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: saveBtnHover.hovered ? '0 8px 20px rgba(99,102,241,0.35)' : '0 4px 12px rgba(99,102,241,0.2)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                {editingClient ? '✓ Update Client' : '✓ Save Client'}
              </button>
              <button type="button" onClick={handleCancel} onMouseEnter={cancelBtnHover.onMouseEnter} onMouseLeave={cancelBtnHover.onMouseLeave}
                style={{
                  padding: '12px 24px', borderRadius: '10px', border: `1.5px solid ${colors.borderMed}`,
                  backgroundColor: cancelBtnHover.hovered ? colors.surfaceHover : colors.surface,
                  color: colors.textSec, fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: colors.textMuted, marginTop: 16 }}>Loading clients...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: colors.surface, borderRadius: '16px', boxShadow: colors.cardShadow }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>👥</p>
          <h3 style={{ color: colors.text, fontWeight: 700, marginBottom: '8px' }}>{searchTerm ? 'No clients found' : 'No clients yet'}</h3>
          <p style={{ color: colors.textMuted, fontSize: '14px' }}>{searchTerm ? 'Try a different search term' : 'Click "Add Client" to get started'}</p>
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(client => (
            <ClientCard key={client.id} client={client} onEdit={handleEdit} onDelete={openDeleteModal} colors={colors} />
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: colors.surface, borderRadius: '16px', overflow: 'hidden', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Client', 'Email', 'Phone', 'Company', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '14px 20px', backgroundColor: colors.tableTh, color: colors.tableThText, fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <ClientRow key={client.id} client={client} onEdit={handleEdit} onDelete={openDeleteModal} colors={colors} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

const ClientCard = ({ client, onEdit, onDelete, colors }) => {
  const editHover = useHover();
  const deleteHover = useHover();
  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: '14px', padding: '16px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, color: colors.text, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</p>
          {client.company && <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.textMuted }}>{client.company}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        {client.email && <p style={{ margin: 0, fontSize: '13px', color: colors.textSec }}>✉️ {client.email}</p>}
        {client.phone && <p style={{ margin: 0, fontSize: '13px', color: colors.textSec }}>📞 {client.phone}</p>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onEdit(client)} onMouseEnter={editHover.onMouseEnter} onMouseLeave={editHover.onMouseLeave}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: editHover.hovered ? '#dbeafe' : '#eff6ff', color: editHover.hovered ? '#1d4ed8' : '#3b82f6', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease' }}>
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(client)} onMouseEnter={deleteHover.onMouseEnter} onMouseLeave={deleteHover.onMouseLeave}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: deleteHover.hovered ? '#fee2e2' : '#fff1f2', color: deleteHover.hovered ? '#dc2626' : '#f43f5e', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease' }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

const ClientRow = ({ client, onEdit, onDelete, colors }) => {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const editHover = useHover();
  const deleteHover = useHover();
  const td = { padding: '16px 20px', fontSize: '14px', color: colors.textSec, borderBottom: `1px solid ${colors.border}` };
  return (
    <tr onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ backgroundColor: hovered ? colors.surfaceHover : colors.surface, transition: 'background-color 0.15s ease' }}>
      <td style={td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
            {client.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, color: colors.text }}>{client.name}</span>
        </div>
      </td>
      <td style={td}>{client.email || '—'}</td>
      <td style={td}>{client.phone || '—'}</td>
      <td style={td}>
        {client.company
          ? <span style={{ padding: '4px 10px', backgroundColor: colors.surfaceHover, borderRadius: '6px', fontSize: '13px', color: colors.textSec, fontWeight: 500 }}>{client.company}</span>
          : '—'}
      </td>
      <td style={td}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onEdit(client)} onMouseEnter={editHover.onMouseEnter} onMouseLeave={editHover.onMouseLeave}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: editHover.hovered ? '#dbeafe' : '#eff6ff', color: editHover.hovered ? '#1d4ed8' : '#3b82f6', fontWeight: 600, fontSize: '12px', transform: editHover.hovered ? 'translateY(-1px)' : 'translateY(0)', transition: 'all 0.2s ease' }}>
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(client)} onMouseEnter={deleteHover.onMouseEnter} onMouseLeave={deleteHover.onMouseLeave}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: deleteHover.hovered ? '#fee2e2' : '#fff1f2', color: deleteHover.hovered ? '#dc2626' : '#f43f5e', fontWeight: 600, fontSize: '12px', transform: deleteHover.hovered ? 'translateY(-1px)' : 'translateY(0)', transition: 'all 0.2s ease' }}>
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Clients;