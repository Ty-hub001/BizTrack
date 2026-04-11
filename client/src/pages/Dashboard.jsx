import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../components/Layout';
import { Toast, useToast } from '../components/Toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b'];

const useHover = () => {
  const [hovered, setHovered] = useState(false);
  return { hovered, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
};

const StatCard = ({ card }) => {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{
      background: card.gradient, borderRadius: '16px', padding: '24px',
      transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
      boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.18)' : '0 4px 24px rgba(0,0,0,0.08)',
      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', cursor: 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 8px', fontWeight: 500 }}>{card.label}</p>
          <h2 style={{ color: '#fff', fontSize: '36px', fontWeight: 800, margin: '0 0 4px' }}>{card.value}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>{card.sub}</p>
        </div>
        <div style={{
          fontSize: '28px',
          transform: hovered ? 'scale(1.2) rotate(-8deg)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>{card.icon}</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { token } = useAuth();
  const { colors } = useTheme();
  const { toasts, removeToast, toast } = useToast();
  const [stats, setStats] = useState({ totalClients: 0, totalProjects: 0, pendingTasks: 0, doneTasks: 0 });
  const [recentClients, setRecentClients] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [projectChartData, setProjectChartData] = useState([]);
  const [taskChartData, setTaskChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [profile, setProfile] = useState(null);

  const viewAllClientsHover = useHover();
  const viewAllProjectsHover = useHover();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, projectsRes, profileRes] = await Promise.all([
          axios.get('http://localhost:5000/api/clients', { headers }),
          axios.get('http://localhost:5000/api/projects', { headers }),
          axios.get('http://localhost:5000/api/auth/profile', { headers }),
        ]);

        const clients = clientsRes.data;
        const projects = projectsRes.data;
        setProfile(profileRes.data);

        const statusCount = { Planning: 0, 'In Progress': 0, Completed: 0 };
        projects.forEach(p => { if (statusCount[p.status] !== undefined) statusCount[p.status]++; });
        setProjectChartData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

        let pending = 0, inProgress = 0, done = 0;
        const taskResults = await Promise.all(projects.map(p => axios.get(`http://localhost:5000/api/projects/${p.id}/tasks`, { headers })));
        taskResults.forEach(res => {
          res.data.forEach(t => {
            if (t.status === 'Pending') pending++;
            else if (t.status === 'In Progress') inProgress++;
            else if (t.status === 'Done') done++;
          });
        });

        setTaskChartData([
          { name: 'Pending', value: pending },
          { name: 'In Progress', value: inProgress },
          { name: 'Done', value: done },
        ]);

        setStats({ totalClients: clients.length, totalProjects: projects.length, pendingTasks: pending, doneTasks: done });
        setRecentClients(clients.slice(0, 4));
        setRecentProjects(projects.slice(0, 4));
        toast.success('Dashboard loaded successfully', 'Welcome back!');
      } catch (err) {
        toast.error('Failed to load dashboard data', 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusBadge = (status) => {
    const map = {
      'Planning': { bg: '#fef3c7', color: '#92400e' },
      'In Progress': { bg: '#dbeafe', color: '#1e40af' },
      'Completed': { bg: '#d1fae5', color: '#065f46' },
    };
    const st = map[status] || { bg: '#f3f4f6', color: '#374151' };
    return (
      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, backgroundColor: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{status}</span>
    );
  };

  const cards = [
    { label: 'Total Clients', value: stats.totalClients, icon: '👥', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', sub: 'registered clients' },
    { label: 'Total Projects', value: stats.totalProjects, icon: '📁', gradient: 'linear-gradient(135deg, #10b981, #059669)', sub: 'active projects' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: '⏳', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', sub: 'awaiting action' },
    { label: 'Completed Tasks', value: stats.doneTasks, icon: '✅', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', sub: 'tasks done' },
  ];

  const tooltipStyle = {
    borderRadius: 8, border: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    fontSize: 13, backgroundColor: colors.surface, color: colors.text,
  };

  return (
    <Layout>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: colors.text, margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: '14px', color: colors.textMuted, margin: '4px 0 0' }}>Welcome back — here's what's happening</p>
        </div>
        {!isMobile && (
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '16px',
              overflow: 'hidden', border: '2px solid #6366f1',
              flexShrink: 0, cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {profile?.avatar
                ? <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile?.name?.charAt(0).toUpperCase() || 'U'
              }
            </div>
          </Link>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: colors.textMuted, marginTop: 16 }}>Loading your data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '20px', marginBottom: '24px' }}>
            {cards.map((card, i) => <StatCard key={i} card={card} />)}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '20px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>Projects by Status</h3>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 20px' }}>Overview of all project stages</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={projectChartData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: colors.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {projectChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>Task Breakdown</h3>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0 0 20px' }}>Distribution across all projects</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={taskChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {taskChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 12, color: colors.textSec }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Row */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '20px' }}>
            {/* Recent Clients */}
            <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>Recent Clients</h3>
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Latest added clients</p>
                </div>
                <Link to="/clients" onMouseEnter={viewAllClientsHover.onMouseEnter} onMouseLeave={viewAllClientsHover.onMouseLeave}
                  style={{ fontSize: '13px', color: viewAllClientsHover.hovered ? '#4338ca' : '#6366f1', textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>
                  View all →
                </Link>
              </div>
              {recentClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>👥</p>
                  <p style={{ color: colors.textMuted, fontSize: '14px' }}>No clients yet</p>
                </div>
              ) : recentClients.map(client => (
                <RecentItem key={client.id} colors={colors}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.company || client.email || '—'}</p>
                  </div>
                </RecentItem>
              ))}
            </div>

            {/* Recent Projects */}
            <div style={{ backgroundColor: colors.surface, borderRadius: '16px', padding: isMobile ? '16px' : '24px', boxShadow: colors.cardShadow, border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>Recent Projects</h3>
                  <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Latest project activity</p>
                </div>
                <Link to="/projects" onMouseEnter={viewAllProjectsHover.onMouseEnter} onMouseLeave={viewAllProjectsHover.onMouseLeave}
                  style={{ fontSize: '13px', color: viewAllProjectsHover.hovered ? '#4338ca' : '#6366f1', textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>
                  View all →
                </Link>
              </div>
              {recentProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>📁</p>
                  <p style={{ color: colors.textMuted, fontSize: '14px' }}>No projects yet</p>
                </div>
              ) : recentProjects.map(project => (
                <RecentItem key={project.id} colors={colors}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                    {project.title.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: colors.textMuted }}>{project.client_name || 'No client'}</p>
                  </div>
                  {statusBadge(project.status)}
                </RecentItem>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

const RecentItem = ({ children, colors }) => {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 8px', borderBottom: `1px solid ${colors.border}`,
      backgroundColor: hovered ? colors.surfaceHover : 'transparent',
      borderRadius: hovered ? '10px' : '0',
      transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      transition: 'all 0.2s ease', cursor: 'pointer',
    }}>
      {children}
    </div>
  );
};

export default Dashboard;