import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  const colors = {
    bg: isDark ? '#0f172a' : '#f8fafc',
    surface: isDark ? '#1e293b' : '#ffffff',
    surfaceHover: isDark ? '#334155' : '#f8fafc',
    border: isDark ? '#334155' : '#f1f5f9',
    borderMed: isDark ? '#475569' : '#e2e8f0',
    text: isDark ? '#f1f5f9' : '#0f172a',
    textSec: isDark ? '#cbd5e1' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    sidebar: isDark ? '#020617' : '#0f172a',
    sidebarBorder: isDark ? '#0f172a' : '#1e293b',
    sidebarActive: isDark ? '#0f172a' : '#1e293b',
    inputBg: isDark ? '#0f172a' : '#ffffff',
    tableTh: isDark ? '#0f172a' : '#f8fafc',
    tableThText: isDark ? '#94a3b8' : '#64748b',
    cardShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);