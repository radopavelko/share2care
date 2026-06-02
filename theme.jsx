// theme.jsx — design tokens + shared presentational components for Share2

const THEME = {
  bg:        '#F3EDE5',
  surface:   '#FFFFFF',
  surfaceAlt:'#FBF6EF',
  ink:       '#2C2722',
  inkSoft:   '#6F665C',
  inkFaint:  '#A89E92',
  line:      '#E8E0D5',
  lineSoft:  '#F0EAE1',
  accent:    '#C2693F',
  accentDeep:'#A8542F',
  accentSoft:'#F3E1D5',
  good:      '#6E8B66',
  goodSoft:  '#E4EADD',
  warn:      '#B07A2E',
  over:      '#B0503B',
  shadow:    '0 1px 2px rgba(60,45,30,0.05), 0 8px 22px rgba(60,45,30,0.07)',
  shadowSm:  '0 1px 2px rgba(60,45,30,0.06)',
};

function Icon({ name, size = 22, color = 'currentColor', stroke = 2 }) {
  const p = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    browse:  <><circle cx="11" cy="11" r="7" {...p} /><path d="M20 20l-3.2-3.2" {...p} /></>,
    swap:    <><path d="M7 7h11l-3-3M17 17H6l3 3" {...p} /></>,
    plus:    <><path d="M12 5v14M5 12h14" {...p} /></>,
    user:    <><circle cx="12" cy="8" r="4" {...p} /><path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" {...p} /></>,
    back:    <><path d="M15 5l-7 7 7 7" {...p} /></>,
    check:   <><path d="M4 12l5 5L20 6" {...p} /></>,
    x:       <><path d="M6 6l12 12M18 6L6 18" {...p} /></>,
    clock:   <><circle cx="12" cy="12" r="8" {...p} /><path d="M12 8v4l3 2" {...p} /></>,
    pin:     <><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" {...p} /><circle cx="12" cy="10" r="2.4" {...p} /></>,
    chevron: <><path d="M9 6l6 6-6 6" {...p} /></>,
    camera:  <><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" {...p} /><circle cx="12" cy="13" r="3.4" {...p} /></>,
    arrowOut:<><path d="M5 12h13M13 6l6 6-6 6" {...p} /></>,
    arrowIn: <><path d="M19 12H6M11 6l-6 6 6 6" {...p} /></>,
    bell:    <><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" {...p} /><path d="M10 20a2 2 0 004 0" {...p} /></>,
    heart:   <><path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0112 6a4.2 4.2 0 018 3.2C20 14.5 12 20 12 20z" {...p} /></>,
    box:     <><path d="M4 8l8-4 8 4-8 4-8-4zM4 8v8l8 4 8-4V8M12 12v8" {...p} /></>,
    logout:  <><path d="M15 12H4M11 6l-6 6 6 6" {...p} /><path d="M14 4h5v16h-5" {...p} /></>,
    users:   <><circle cx="9" cy="8" r="3.4" {...p} /><path d="M3.5 19c1-3.2 3.4-4.2 5.5-4.2s4.5 1 5.5 4.2" {...p} /><path d="M16 5.2a3.2 3.2 0 010 5.8M17.5 14.6c1.8.5 3.2 1.7 4 4.4" {...p} /></>,
    link:    <><path d="M9.5 13.5l5-5M8 11l-2 2a3.2 3.2 0 004.5 4.5l2-2M16 13l2-2A3.2 3.2 0 0013.5 6.5l-2 2" {...p} /></>,
    mail:    <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...p} /><path d="M4 7l8 5.5L20 7" {...p} /></>,
    copy:    <><rect x="9" y="9" width="11" height="11" rx="2.5" {...p} /><path d="M5 15H4.5A1.5 1.5 0 013 13.5v-9A1.5 1.5 0 014.5 3h9A1.5 1.5 0 0115 4.5V5" {...p} /></>,
    trash:   <><path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>{paths[name]}</svg>;
}

// Avatar — shows the member's Google photo when available, else initials on a warm tint.
function Avatar({ user, size = 40, ring = false }) {
  const u = typeof user === 'string' ? window.MEMBERS[user] : user;
  if (!u) return null;
  const ringStyle = ring ? `0 0 0 2.5px ${THEME.surface}, 0 0 0 4px ${(u.color || THEME.accent)}33` : 'none';
  if (u.photoURL) {
    return (
      <img src={u.photoURL} alt={u.name || ''} referrerPolicy="no-referrer"
        onError={e => { e.currentTarget.style.display = 'none'; }}
        style={{
          width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'cover',
          boxShadow: ringStyle, userSelect: 'none',
        }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: u.color || THEME.accent, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 600,
      fontSize: size * 0.4, letterSpacing: 0.2,
      boxShadow: ringStyle, userSelect: 'none',
    }}>{(u.name || '?')[0]}</div>
  );
}

// Category thumbnail — shows the uploaded photo when present, else a warm placeholder tile.
function ItemThumb({ item, height = 132, radius = 16 }) {
  const meta = window.CAT_META[item.cat] || { tint: '#E9E2D5', shape: 'circle' };
  const showTag = height >= 78;
  const shapeStyle = {
    position: 'absolute', width: '52%', aspectRatio: '1',
    background: 'rgba(255,255,255,0.55)',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
    right: '-8%', bottom: '-14%',
  };
  const shapes = {
    circle: { ...shapeStyle, borderRadius: '50%' },
    square: { ...shapeStyle, borderRadius: 18, transform: 'rotate(-8deg)' },
    diamond:{ ...shapeStyle, borderRadius: 10, transform: 'rotate(45deg)', right: '4%', bottom: '-6%', width: '40%' },
  };
  return (
    <div style={{
      position: 'relative', width: '100%', height, borderRadius: radius,
      background: meta.tint, overflow: 'hidden', flexShrink: 0,
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1.4px)',
      backgroundSize: '12px 12px',
    }}>
      <div style={shapes[meta.shape]} />
      {item.photoURL && (
        <img src={item.photoURL} alt={item.name} loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none'; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {showTag && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 2,
          fontFamily: 'DM Mono, monospace', fontSize: 10.5, letterSpacing: 0.3,
          textTransform: 'lowercase', color: THEME.inkSoft,
          background: 'rgba(255,255,255,0.82)', padding: '3px 7px', borderRadius: 6,
          backdropFilter: 'blur(2px)',
        }}>{item.cat}</div>
      )}
    </div>
  );
}

function StatusBadge({ status, due, small = false }) {
  let bg = THEME.goodSoft, fg = THEME.good, label = 'Available', dot = THEME.good;
  if (status === 'pending') { bg = THEME.accentSoft; fg = THEME.accentDeep; label = 'Requested'; dot = THEME.accent; }
  else if (status === 'out') {
    const r = due ? window.relativeDue(due) : null;
    bg = '#EFE7DA'; fg = THEME.inkSoft; dot = THEME.inkFaint; label = 'On loan';
    if (r && r.tone === 'over') { fg = THEME.over; dot = THEME.over; }
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: bg, color: fg, borderRadius: 999,
      padding: small ? '3px 9px' : '5px 11px',
      fontSize: small ? 11.5 : 12.5, fontWeight: 600,
      fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
      {label}
    </span>
  );
}

function Btn({ children, onClick, variant = 'primary', full = false, size = 'md', disabled = false, style = {} }) {
  const sizes = { sm: { pad: '9px 14px', fs: 14 }, md: { pad: '13px 18px', fs: 15.5 }, lg: { pad: '16px 20px', fs: 16.5 } };
  const s = sizes[size];
  const variants = {
    primary: { background: disabled ? '#D8CFC3' : THEME.accent, color: '#fff', border: 'none', boxShadow: disabled ? 'none' : '0 2px 10px rgba(194,105,63,0.32)' },
    soft:    { background: THEME.accentSoft, color: THEME.accentDeep, border: 'none' },
    ghost:   { background: THEME.surface, color: THEME.ink, border: `1.5px solid ${THEME.line}` },
    danger:  { background: '#FBF1EE', color: THEME.over, border: `1.5px solid #EAD3CC` },
    good:    { background: THEME.good, color: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(110,139,102,0.3)' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      ...v, padding: s.pad, fontSize: s.fs, width: full ? '100%' : 'auto',
      fontFamily: 'DM Sans, sans-serif', fontWeight: 600, borderRadius: 14,
      cursor: disabled ? 'default' : 'pointer', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
      transition: 'transform .12s ease, filter .12s ease', WebkitTapHighlightColor: 'transparent',
      ...style,
    }}
    onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
      {children}
    </button>
  );
}

function Card({ children, onClick, style = {}, pad = 0 }) {
  return (
    <div onClick={onClick} style={{
      background: THEME.surface, borderRadius: 20, boxShadow: THEME.shadowSm,
      border: `1px solid ${THEME.lineSoft}`, padding: pad, overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform .14s ease, box-shadow .14s ease', ...style,
    }}
    onMouseDown={onClick ? (e => e.currentTarget.style.transform = 'scale(0.985)') : undefined}
    onMouseUp={onClick ? (e => e.currentTarget.style.transform = 'scale(1)') : undefined}
    onMouseLeave={onClick ? (e => e.currentTarget.style.transform = 'scale(1)') : undefined}>
      {children}
    </div>
  );
}

function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(40,32,24,0.42)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .22s ease both',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: THEME.surface,
        borderRadius: '26px 26px 0 0', padding: '12px 20px 0',
        animation: 'sheetUp .3s cubic-bezier(.16,1,.3,1) both',
        maxHeight: '86%', overflowY: 'auto', boxShadow: '0 -10px 40px rgba(40,30,20,0.18)',
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 99, background: THEME.line, margin: '0 auto 14px' }} />
        {title && <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 600, fontSize: 21, color: THEME.ink, marginBottom: 14 }}>{title}</div>}
        {children}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 104, zIndex: 300,
      background: THEME.ink, color: '#fff', borderRadius: 16,
      padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 11,
      fontFamily: 'DM Sans, sans-serif', fontSize: 14.5, fontWeight: 500,
      boxShadow: '0 8px 28px rgba(0,0,0,0.28)', animation: 'toastIn .32s cubic-bezier(.16,1,.3,1) both',
    }}>
      {toast.icon && <span style={{ color: THEME.accentSoft, display: 'flex' }}><Icon name={toast.icon} size={19} /></span>}
      <span style={{ flex: 1 }}>{toast.msg}</span>
    </div>
  );
}

Object.assign(window, { THEME, Icon, Avatar, ItemThumb, StatusBadge, Btn, Card, Sheet, Toast });
