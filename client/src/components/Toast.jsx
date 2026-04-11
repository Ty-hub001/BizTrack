import { useEffect, useState } from 'react';

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const colors = {
  success: { bg: '#f0fdf4', border: '#86efac', color: '#15803d', progress: '#22c55e' },
  error:   { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', progress: '#ef4444' },
  warning: { bg: '#fffbeb', border: '#fcd34d', color: '#d97706', progress: '#f59e0b' },
  info:    { bg: '#eff6ff', border: '#93c5fd', color: '#2563eb', progress: '#3b82f6' },
};

export const Toast = ({ toasts, removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '360px',
      width: 'calc(100vw - 48px)',
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const c = colors[toast.type] || colors.info;

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const timer = setTimeout(() => handleRemove(), toast.duration || 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div onClick={handleRemove} style={{
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '12px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.9)',
      opacity: visible && !leaving ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{icons[toast.type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '14px', color: c.color }}>{toast.title}</p>}
        <p style={{ margin: 0, fontSize: '13px', color: c.color, opacity: 0.85, lineHeight: 1.4 }}>{toast.message}</p>
      </div>
      <button onClick={handleRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, opacity: 0.5, fontSize: '16px', padding: '0', flexShrink: 0 }}>✕</button>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', backgroundColor: c.progress, borderRadius: '0 0 12px 12px', animation: `shrink ${toast.duration || 3500}ms linear forwards` }} />
    </div>
  );
};

// Hook to use toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', title = '', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, title, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = {
    success: (message, title) => addToast(message, 'success', title),
    error: (message, title) => addToast(message, 'error', title),
    warning: (message, title) => addToast(message, 'warning', title),
    info: (message, title) => addToast(message, 'info', title),
  };

  return { toasts, removeToast, toast };
};