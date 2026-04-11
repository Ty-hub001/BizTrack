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

const statusConfig = {
  'Planning':    { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  'In Progress': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  'Completed':   { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
};

const taskStatusConfig = {
  'Pending':     { bg: '#fef3c7', color: '#92400e' },
  'In Progress': { bg: '#dbeafe', color: '#1e40af' },
  'Done':        { bg: '#d1fae5', color: '#065f46' },
};

const getDueDateStatus = (dueDateStr) => {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: '#dc2626', bg: '#fef2f2', icon: '🔴' };
  if (diffDays <= 3) return { label: `Due in ${diffDays}d`, color: '#d97706', bg: '#fffbeb', icon: '🟡' };
  return null;
};

const ProgressBar = ({ done, total, colors }) => {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const color = pct === 100 ? '#10b981' : pct >= 50 ? '#6366f1' : '#f59e0b';
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: colors.textMuted }}>{done}/{total} tasks done</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', backgroundColor: colors.border, borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

const Projects = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const { toasts, removeToast, toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', status: 'Pending', assigned_to: '' });
  const [form, setForm] = useState({ client_id: '', title: '', description: '', status: 'Planning', start_date: '', due_date: '' });
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, name: '' });
  const [taskConfirmModal, setTaskConfirmModal] = useState({ open: false, id: null, name: '' });

  const addBtnHover = useHover();
  const saveBtnHover = useHover();
  const cancelBtnHover = useHover();
  const taskBtnHover = useHover();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('https://biztrack-production-fc4d.up.railway.app/api/projects', { headers });
      const projectList = res.data;
      setProjects(projectList);
      const counts = {};
      await Promise.all(projectList.map(async (p) => {
        const taskRes = await axios.get(`https://biztrack-production-fc4d.up.railway.app/api/projects/${p.id}/tasks`, { headers });
        counts[p.id] = { total: taskRes.data.length, done: taskRes.data.filter(t => t.status === 'Done').length };
      }));
      setTaskCounts(counts);
    } catch (err) {
      toast.error('Failed to load projects', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get('https://biztrack-production-fc4d.up.railway.app/api/clients', { headers });
      setClients(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await axios.get(`https://biztrack-production-fc4d.up.railway.app/api/projects/${projectId}/tasks`, { headers });
      setTasks(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProjects(); fetchClients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editingProject) {
        await axios.put(`https://biztrack-production-fc4d.up.railway.app/api/projects/${editingProject.id}`, form, { headers });
        toast.success('Project updated successfully', 'Updated!');
      } else {
        await axios.post('https://biztrack-production-fc4d.up.railway.app/api/projects', form, { headers });
        toast.success('Project created successfully', 'Created!');
      }
      setForm({ client_id: '', title: '', description: '', status: 'Planning', start_date: '', due_date: '' });
      setShowForm(false); setEditingProject(null); fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg); toast.error(msg, 'Error');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setForm({
      client_id: project.client_id || '', title: project.title,
      description: project.description || '', status: project.status,
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      due_date: project.due_date ? project.due_date.split('T')[0] : '',
    });
    setShowForm(true); setSelectedProject(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (project) => {
    setConfirmModal({ open: true, id: project.id, name: project.title });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://biztrack-production-fc4d.up.railway.app/api/projects/${confirmModal.id}`, { headers });
      toast.success('Project deleted', 'Deleted');
      if (selectedProject?.id === confirmModal.id) setSelectedProject(null);
      setConfirmModal({ open: false, id: null, name: '' });
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete project', 'Error');
    }
  };

  const handleViewTasks = (project) => {
    if (selectedProject?.id === project.id) { setSelectedProject(null); return; }
    setSelectedProject(project); setShowForm(false); fetchTasks(project.id);
  };

  const openDeleteTaskModal = (task) => {
    setTaskConfirmModal({ open: true, id: task.id, name: task.title });
  };

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`https://biztrack-production-fc4d.up.railway.app/api/projects/${selectedProject.id}/tasks/${taskConfirmModal.id}`, { headers });
      toast.success('Task deleted', 'Deleted');
      setTaskConfirmModal({ open: false, id: null, name: '' });
      fetchTasks(selectedProject.id); fetchProjects();
    } catch (err) {
      toast.error('Failed to delete task', 'Error');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://biztrack-production-fc4d.up.railway.app/api/projects/${selectedProject.id}/tasks`, taskForm, { headers });
      toast.success('Task added!', 'Created');
      setTaskForm({ title: '', status: 'Pending', assigned_to: '' });
      setShowTaskForm(false); fetchTasks(selectedProject.id); fetchProjects();
    } catch (err) { toast.error('Failed to add task', 'Error'); }
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
    padding: '12px 0', fontSize: '14px',
    color: colors.text, backgroundColor: 'transparent', width: '100%',
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <ConfirmModal
        isOpen={confirmModal.open}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, id: null, name: '' })}
        title="Delete Project"
        message="This project and all its tasks will be permanently removed."
        itemName={confirmModal.name}
        confirmLabel="Delete Project"
      />

      <ConfirmModal
        isOpen={taskConfirmModal.open}
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskConfirmModal({ open: false, id: null, name: '' })}
        title="Delete Task"
        message="This task will be permanently removed."
        itemName={taskConfirmModal.name}
        confirmLabel="Delete Task"
      />

      {/* Top Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: colors.text, margin: 0 }}>Projects</h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, margin: '4px 0 0' }}>{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: colors.surface, border: `1.5px solid ${colors.borderMed}`, borderRadius: '10px', padding: '0 14px', flex: isMobile ? 1 : 'none' }}>
            <span style={{ color: colors.textMuted }}>🔍</span>
            <input
              style={{ border: 'none', outline: 'none', padding: '10px 0', fontSize: '14px', width: isMobile ? '100%' : '180px', color: colors.text, backgroundColor: 'transparent' }}
              placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingProject(null); setSelectedProject(null); setForm({ client_id: '', title: '', description: '', status: 'Planning', start_date: '', due_date: '' }); }}
            onMouseEnter={addBtnHover.onMouseEnter} onMouseLeave={addBtnHover.onMouseLeave}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: addBtnHover.hovered ? 'linear-gradient(135deg, #4338ca, #7c3aed)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              transform: addBtnHover.hovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: addBtnHover.hovered ? '0 8px 20px rgba(99,102,241,0.35)' : '0 4px 12px rgba(99,102,241,0.2)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', whiteSpace: 'nowrap',
            }}>+ Add Project</button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: isMobile ? '20px' : '28px', marginBottom: '24px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0 }}>{editingProject ? '✏️ Edit Project' : '➕ New Project'}</h2>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0' }}>Fill in the project details below</p>
            </div>
            <button onClick={() => { setShowForm(false); setEditingProject(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.textMuted }}>✕</button>
          </div>
          {error && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', marginBottom: '20px', display: 'flex', gap: '8px' }}><span>⚠️</span>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {[
                { field: 'title', label: 'Project Title', icon: '📁', type: 'input', placeholder: 'Website Redesign' },
                { field: 'client_id', label: 'Client', icon: '👤', type: 'select' },
                { field: 'status', label: 'Status', icon: '🔖', type: 'status' },
                { field: 'start_date', label: 'Start Date', icon: '📅', type: 'date' },
                { field: 'due_date', label: 'Due Date', icon: '🗓️', type: 'date' },
                { field: 'description', label: 'Description', icon: '📝', type: 'textarea' },
              ].map(({ field, label, icon, type, placeholder }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: colors.textSec, marginBottom: '8px' }}>{label}</label>
                  <div style={{ ...inputStyle(field), alignItems: type === 'textarea' ? 'flex-start' : 'center', paddingTop: type === 'textarea' ? '4px' : '0' }}>
                    <span style={{ fontSize: '15px', marginTop: type === 'textarea' ? '10px' : '0' }}>{icon}</span>
                    {type === 'input' && <input style={sharedInput} type="text" placeholder={placeholder} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} onFocus={() => setFocusedField(field)} onBlur={() => setFocusedField(null)} required />}
                    {type === 'date' && <input style={sharedInput} type="date" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} onFocus={() => setFocusedField(field)} onBlur={() => setFocusedField(null)} />}
                    {type === 'select' && (
                      <select style={{ ...sharedInput, cursor: 'pointer' }} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} onFocus={() => setFocusedField(field)} onBlur={() => setFocusedField(null)}>
                        <option value="">No Client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                    {type === 'status' && (
                      <select style={{ ...sharedInput, cursor: 'pointer' }} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} onFocus={() => setFocusedField(field)} onBlur={() => setFocusedField(null)}>
                        <option>Planning</option><option>In Progress</option><option>Completed</option>
                      </select>
                    )}
                    {type === 'textarea' && <textarea style={{ ...sharedInput, height: '76px', resize: 'none', paddingTop: '10px' }} placeholder="Optional project description..." value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} onFocus={() => setFocusedField(field)} onBlur={() => setFocusedField(null)} />}
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
                }}>{editingProject ? '✓ Update Project' : '✓ Save Project'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProject(null); }}
                onMouseEnter={cancelBtnHover.onMouseEnter} onMouseLeave={cancelBtnHover.onMouseLeave}
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
          <p style={{ color: colors.textMuted, marginTop: 16 }}>Loading projects...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: colors.surface, borderRadius: '16px', boxShadow: colors.cardShadow }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>📁</p>
          <h3 style={{ color: colors.text, fontWeight: 700, marginBottom: '8px' }}>{searchTerm ? 'No projects found' : 'No projects yet'}</h3>
          <p style={{ color: colors.textMuted, fontSize: '14px' }}>{searchTerm ? 'Try a different search' : 'Click "Add Project" to get started'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(project => (
                  <ProjectCard key={project.id} project={project} taskCounts={taskCounts} isSelected={selectedProject?.id === project.id} onViewTasks={handleViewTasks} onEdit={handleEdit} onDelete={openDeleteModal} colors={colors} />
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: colors.surface, borderRadius: '16px', overflow: 'hidden', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Project', 'Client', 'Status', 'Due Date', 'Progress', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 20px', backgroundColor: colors.tableTh, color: colors.tableThText, fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: `1px solid ${colors.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(project => (
                      <ProjectRow key={project.id} project={project} taskCounts={taskCounts} isSelected={selectedProject?.id === project.id} onViewTasks={handleViewTasks} onEdit={handleEdit} onDelete={openDeleteModal} colors={colors} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tasks Panel */}
          {selectedProject && (
            <div style={{ width: isMobile ? '100%' : '320px', backgroundColor: colors.surface, borderRadius: '16px', padding: '24px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}`, flexShrink: 0, maxHeight: isMobile ? 'none' : '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>{selectedProject.title}</h3>
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => setShowTaskForm(!showTaskForm)} onMouseEnter={taskBtnHover.onMouseEnter} onMouseLeave={taskBtnHover.onMouseLeave}
                    style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: taskBtnHover.hovered ? 'linear-gradient(135deg, #4338ca, #7c3aed)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    + Task
                  </button>
                  <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: colors.textMuted }}>✕</button>
                </div>
              </div>

              {showTaskForm && (
                <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', padding: '16px', backgroundColor: colors.bg, borderRadius: '12px' }}>
                  <input style={{ border: `1.5px solid ${colors.borderMed}`, borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', color: colors.text, backgroundColor: colors.inputBg }}
                    placeholder="Task title..." value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                  <select style={{ border: `1.5px solid ${colors.borderMed}`, borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', color: colors.text, backgroundColor: colors.inputBg }}
                    value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                    <option>Pending</option><option>In Progress</option><option>Done</option>
                  </select>
                  <input style={{ border: `1.5px solid ${colors.borderMed}`, borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', color: colors.text, backgroundColor: colors.inputBg }}
                    placeholder="Assigned to..." value={taskForm.assigned_to} onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })} />
                  <button type="submit" style={{ padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Save Task</button>
                </form>
              )}

              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>✅</p>
                  <p style={{ color: colors.textMuted, fontSize: '13px' }}>No tasks yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tasks.map(task => (
                    <TaskItem key={task.id} task={task} onDelete={() => openDeleteTaskModal(task)} colors={colors} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

const ProjectCard = ({ project, taskCounts, isSelected, onViewTasks, onEdit, onDelete, colors }) => {
  const sc = statusConfig[project.status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  const dueDateStatus = getDueDateStatus(project.due_date);
  const counts = taskCounts[project.id] || { total: 0, done: 0 };
  const editHover = useHover();
  const deleteHover = useHover();
  const taskHover = useHover();
  return (
    <div style={{ backgroundColor: colors.surface, borderRadius: '14px', padding: '16px', boxShadow: colors.cardShadow, border: isSelected ? '2px solid #6366f1' : `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
            {project.title.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, color: colors.text, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.title}</p>
            {project.client_name && <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.textMuted }}>{project.client_name}</p>}
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: sc.bg, color: sc.color, flexShrink: 0, marginLeft: '8px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{project.status}
        </span>
      </div>
      {dueDateStatus && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', backgroundColor: dueDateStatus.bg, marginBottom: '10px' }}>
          <span style={{ fontSize: '12px' }}>{dueDateStatus.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: dueDateStatus.color }}>{dueDateStatus.label}</span>
        </div>
      )}
      <ProgressBar done={counts.done} total={counts.total} colors={colors} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <button onClick={() => onViewTasks(project)} onMouseEnter={taskHover.onMouseEnter} onMouseLeave={taskHover.onMouseLeave}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: isSelected || taskHover.hovered ? '#ede9fe' : '#f5f3ff', color: '#7c3aed', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease' }}>
          📋 Tasks
        </button>
        <button onClick={() => onEdit(project)} onMouseEnter={editHover.onMouseEnter} onMouseLeave={editHover.onMouseLeave}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: editHover.hovered ? '#dbeafe' : '#eff6ff', color: '#3b82f6', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease' }}>
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(project)} onMouseEnter={deleteHover.onMouseEnter} onMouseLeave={deleteHover.onMouseLeave}
          style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: deleteHover.hovered ? '#fee2e2' : '#fff1f2', color: deleteHover.hovered ? '#dc2626' : '#f43f5e', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s ease' }}>
          🗑️
        </button>
      </div>
    </div>
  );
};

const ProjectRow = ({ project, taskCounts, isSelected, onViewTasks, onEdit, onDelete, colors }) => {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const tasksHover = useHover();
  const editHover = useHover();
  const deleteHover = useHover();
  const sc = statusConfig[project.status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
  const dueDateStatus = getDueDateStatus(project.due_date);
  const counts = taskCounts[project.id] || { total: 0, done: 0 };
  const td = { padding: '16px 20px', fontSize: '14px', color: colors.textSec, borderBottom: `1px solid ${colors.border}` };
  return (
    <tr onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ backgroundColor: isSelected ? colors.bg : hovered ? colors.surfaceHover : colors.surface, transition: 'background-color 0.15s ease' }}>
      <td style={td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
            {project.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: colors.text, fontSize: '14px' }}>{project.title}</p>
            {project.description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.textMuted }}>{project.description.substring(0, 35)}{project.description.length > 35 ? '...' : ''}</p>}
          </div>
        </div>
      </td>
      <td style={td}>
        {project.client_name
          ? <span style={{ padding: '4px 10px', backgroundColor: colors.surfaceHover, borderRadius: '6px', fontSize: '13px', color: colors.textSec, fontWeight: 500 }}>{project.client_name}</span>
          : <span style={{ color: colors.textMuted }}>—</span>}
      </td>
      <td style={td}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: sc.bg, color: sc.color }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot }} />{project.status}
        </span>
      </td>
      <td style={td}>
        <div>
          <span style={{ fontSize: '13px', color: project.due_date ? colors.textSec : colors.textMuted }}>
            {project.due_date ? new Date(project.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
          </span>
          {dueDateStatus && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', padding: '2px 8px', borderRadius: '6px', backgroundColor: dueDateStatus.bg }}>
              <span style={{ fontSize: '10px' }}>{dueDateStatus.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: dueDateStatus.color }}>{dueDateStatus.label}</span>
            </div>
          )}
        </div>
      </td>
      <td style={{ ...td, minWidth: '140px' }}>
        <ProgressBar done={counts.done} total={counts.total} colors={colors} />
      </td>
      <td style={td}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { h: tasksHover, label: '📋 Tasks', bg: '#f5f3ff', hbg: '#ede9fe', color: '#7c3aed', hcolor: '#6d28d9', fn: () => onViewTasks(project) },
            { h: editHover, label: '✏️ Edit', bg: '#eff6ff', hbg: '#dbeafe', color: '#3b82f6', hcolor: '#1d4ed8', fn: () => onEdit(project) },
            { h: deleteHover, label: '🗑️', bg: '#fff1f2', hbg: '#fee2e2', color: '#f43f5e', hcolor: '#dc2626', fn: () => onDelete(project) },
          ].map(({ h, label, bg, hbg, color, hcolor, fn }, i) => (
            <button key={i} onClick={fn} onMouseEnter={h.onMouseEnter} onMouseLeave={h.onMouseLeave}
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: h.hovered ? hbg : bg, color: h.hovered ? hcolor : color, fontWeight: 600, fontSize: '12px', transform: h.hovered ? 'translateY(-1px)' : 'translateY(0)', transition: 'all 0.2s ease' }}>
              {label}
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
};

const TaskItem = ({ task, onDelete, colors }) => {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const deleteHover = useHover();
  const tc = taskStatusConfig[task.status] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: hovered ? colors.surfaceHover : colors.bg, border: `1px solid ${colors.border}`, transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'all 0.2s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
          {task.assigned_to && <p style={{ margin: '3px 0 0', fontSize: '12px', color: colors.textMuted }}>👤 {task.assigned_to}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: tc.bg, color: tc.color, whiteSpace: 'nowrap' }}>{task.status}</span>
          <button onClick={onDelete} onMouseEnter={deleteHover.onMouseEnter} onMouseLeave={deleteHover.onMouseLeave}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: deleteHover.hovered ? '#dc2626' : colors.textMuted, transform: deleteHover.hovered ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s ease' }}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default Projects;