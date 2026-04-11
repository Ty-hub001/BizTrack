import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmLabel = 'Delete', itemName = '' }) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) setTimeout(() => setVisible(true), 10);
    else setVisible(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.2s ease',
    }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: colors.surface,
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          backgroundColor: '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', marginBottom: '20px',
        }}>🗑️</div>

        {/* Title */}
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>
          {title || 'Are you sure?'}
        </h2>

        {/* Message */}
        <p style={{ fontSize: '14px', color: colors.textSec, margin: '0 0 8px', lineHeight: 1.6 }}>
          {message || 'This action cannot be undone.'}
        </p>

        {/* Item name highlight */}
        {itemName && (
          <p style={{
            fontSize: '14px', fontWeight: 600,
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '8px 12px',
            margin: '0 0 24px',
          }}>
            "{itemName}"
          </p>
        )}

        {!itemName && <div style={{ marginBottom: '24px' }} />}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              border: `1.5px solid ${colors.borderMed}`,
              backgroundColor: colors.surface,
              color: colors.textSec,
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.target.style.backgroundColor = colors.surfaceHover}
            onMouseLeave={e => e.target.style.backgroundColor = colors.surface}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 20px rgba(220,38,38,0.4)'; }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(220,38,38,0.3)'; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;