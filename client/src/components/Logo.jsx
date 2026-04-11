const Logo = ({ size = 36, showText = true, textColor = '#ffffff' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="url(#grad)" />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Chart bars */}
        <rect x="8" y="22" width="5" height="10" rx="1.5" fill="white" opacity="0.6" />
        <rect x="15" y="16" width="5" height="16" rx="1.5" fill="white" opacity="0.8" />
        <rect x="22" y="10" width="5" height="22" rx="1.5" fill="white" />
        {/* Trend arrow */}
        <path d="M29 12 L33 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M30 8 L33 8 L33 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showText && (
        <span style={{
          color: textColor,
          fontWeight: 800,
          fontSize: size * 0.5,
          letterSpacing: '-0.5px',
          fontFamily: "'Segoe UI', sans-serif",
        }}>
          Biz<span style={{ opacity: 0.75 }}>Track</span>
        </span>
      )}
    </div>
  );
};

export default Logo;