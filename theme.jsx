// theme.jsx — ShareKeep design tokens (minimal, Apple-like: yellow / black / grey)
// + shared presentational components.

const THEME = {
  font:       "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, system-ui, sans-serif",
  bg:         '#F4F4F2',
  surface:    '#FFFFFF',
  surfaceAlt: '#EFEFED',
  ink:        '#111111',
  inkSoft:    '#6E6E73',
  inkFaint:   '#A3A3A8',
  line:       '#E4E4E2',
  lineSoft:   '#EEEEEC',
  accent:     '#FFC300',                                              // solid yellow (small fills, dots)
  accentGrad: 'linear-gradient(135deg, #FFD84D 0%, #FFC300 100%)',    // big fills
  onAccent:   '#1A1300',                                              // text on yellow
  accentText: '#9A7400',                                              // yellow as *text* on light
  accentSoft: '#FFF5CC',
  good:       '#2E7D32',
  goodSoft:   '#E6F3E7',
  over:       '#C62828',
  dangerSoft: '#FDECEC',
  shadow:     '0 1px 2px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.05)',
  shadowSm:   '0 1px 2px rgba(0,0,0,0.04)',
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
    chevron: <><path d="M9 6l6 6-6 6" {...p} /></>,
    camera:  <><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" {...p} /><circle cx="12" cy="13" r="3.4" {...p} /></>,
    box:     <><path d="M4 8l8-4 8 4-8 4-8-4zM4 8v8l8 4 8-4V8M12 12v8" {...p} /></>,
    logout:  <><path d="M15 12H4M11 6l-6 6 6 6" {...p} /><path d="M14 4h5v16h-5" {...p} /></>,
    users:   <><circle cx="9" cy="8" r="3.4" {...p} /><path d="M3.5 19c1-3.2 3.4-4.2 5.5-4.2s4.5 1 5.5 4.2" {...p} /><path d="M16 5.2a3.2 3.2 0 010 5.8M17.5 14.6c1.8.5 3.2 1.7 4 4.4" {...p} /></>,
    link:    <><path d="M9.5 13.5l5-5M8 11l-2 2a3.2 3.2 0 004.5 4.5l2-2M16 13l2-2A3.2 3.2 0 0013.5 6.5l-2 2" {...p} /></>,
    mail:    <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...p} /><path d="M4 7l8 5.5L20 7" {...p} /></>,
    copy:    <><rect x="9" y="9" width="11" height="11" rx="2.5" {...p} /><path d="M5 15H4.5A1.5 1.5 0 013 13.5v-9A1.5 1.5 0 014.5 3h9A1.5 1.5 0 0115 4.5V5" {...p} /></>,
    trash:   <><path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12" {...p} /></>,
    edit:    <><path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20z" {...p} /><path d="M12.5 7l4.5 4.5" {...p} /></>,
    repeat:  <><path d="M17 2l4 4-4 4" {...p} /><path d="M3 11V9a4 4 0 014-4h14" {...p} /><path d="M7 22l-4-4 4-4" {...p} /><path d="M21 13v2a4 4 0 01-4 4H3" {...p} /></>,
    hand:    <><path d="M7 11.5V6.5a1.5 1.5 0 013 0V11M10 10V4.5a1.5 1.5 0 013 0V11M13 10.5V5.5a1.5 1.5 0 013 0v6.5M16 12V8.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-1.5a6 6 0 01-5-2.7L3.6 14.4a1.5 1.5 0 012.4-1.8L7 14" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>{paths[name]}</svg>;
}

// Avatar — Google photo when available, else an initial on the member's colour.
function Avatar({ user, size = 40, ring = false }) {
  const u = typeof user === 'string' ? window.MEMBERS[user] : user;
  if (!u) return null;
  const ringStyle = ring ? `0 0 0 2px ${THEME.surface}` : 'none';
  const initials = (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: u.color || THEME.ink, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: THEME.font, fontWeight: 600, fontSize: size * 0.42,
      boxShadow: ringStyle, userSelect: 'none',
    }}>{(u.name || '?')[0]}</div>
  );
  if (!u.photoURL) return initials;
  return <AvatarPhoto key={u.photoURL} src={u.photoURL} alt={u.name || ''} size={size} ringStyle={ringStyle} fallback={initials} />;
}
function AvatarPhoto({ src, alt, size, ringStyle, fallback }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) return fallback;
  return (
    <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', boxShadow: ringStyle, userSelect: 'none', display: 'block' }} />
  );
}

// Item photo, or a quiet grey tile with a box glyph. The whole photo is always
// shown (never cropped). With `auto`, the tile grows to the photo's own
// proportions up to `height`; otherwise it's a fixed box the photo fits inside.
function ItemThumb({ item, height = 120, radius = 14, auto = false }) {
  const base = { position: 'relative', width: '100%', borderRadius: radius, background: THEME.surfaceAlt, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  if (item.photoURL && auto) {
    return (
      <div style={base}>
        <img src={item.photoURL} alt={item.name}
          onError={e => { e.currentTarget.style.display = 'none'; }}
          style={{ width: '100%', height: 'auto', maxHeight: height, objectFit: 'contain', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{ ...base, height }}>
      <Icon name="box" size={Math.max(20, height * 0.32)} color={THEME.inkFaint} stroke={1.6} />
      {item.photoURL && (
        <img src={item.photoURL} alt={item.name} loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none'; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      )}
    </div>
  );
}

// Small status pill. tone: 'grey' | 'yellow' | 'green'
function Pill({ tone = 'grey', children, small = false }) {
  const tones = {
    grey:   { bg: THEME.surfaceAlt, fg: THEME.inkSoft },
    yellow: { bg: THEME.accentSoft, fg: THEME.accentText },
    green:  { bg: THEME.goodSoft, fg: THEME.good },
  };
  const t = tones[tone] || tones.grey;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, background: t.bg, color: t.fg,
      borderRadius: 999, padding: small ? '3px 9px' : '5px 11px', fontSize: small ? 11.5 : 12.5,
      fontWeight: 600, fontFamily: THEME.font, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// Status of an item relative to the viewer.
function StatusPill({ item, uid, small }) {
  const h = window.holderOf(item);
  if (!h) return <Pill tone="green" small={small}>Available</Pill>;
  if (h === uid) return <Pill tone="yellow" small={small}>You have it</Pill>;
  const m = window.MEMBERS[h];
  return <Pill tone="yellow" small={small}>With {m ? m.name : 'someone'}</Pill>;
}

function Btn({ children, onClick, variant = 'primary', full = false, size = 'md', disabled = false, style = {} }) {
  const sizes = { sm: { pad: '9px 14px', fs: 14 }, md: { pad: '13px 18px', fs: 15.5 }, lg: { pad: '16px 20px', fs: 16.5 } };
  const s = sizes[size];
  const variants = {
    primary: { background: disabled ? THEME.surfaceAlt : THEME.accentGrad, color: disabled ? THEME.inkFaint : THEME.onAccent, border: 'none' },
    dark:    { background: THEME.ink, color: '#fff', border: 'none' },
    soft:    { background: THEME.surfaceAlt, color: THEME.ink, border: 'none' },
    ghost:   { background: THEME.surface, color: THEME.ink, border: `1px solid ${THEME.line}` },
    danger:  { background: THEME.dangerSoft, color: THEME.over, border: 'none' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      ...v, padding: s.pad, fontSize: s.fs, width: full ? '100%' : 'auto',
      fontFamily: THEME.font, fontWeight: 600, borderRadius: 14,
      cursor: disabled ? 'default' : 'pointer', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
      transition: 'transform .12s ease, opacity .12s ease', WebkitTapHighlightColor: 'transparent',
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
      background: THEME.surface, borderRadius: 18, border: `1px solid ${THEME.lineSoft}`,
      boxShadow: THEME.shadowSm, padding: pad, overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default', transition: 'transform .14s ease', ...style,
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
      position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.32)',
      display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .2s ease both',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: THEME.surface, borderRadius: '24px 24px 0 0', padding: '12px 20px 0',
        animation: 'sheetUp .3s cubic-bezier(.16,1,.3,1) both', maxHeight: '88%', overflowY: 'auto',
      }}>
        <div style={{ width: 36, height: 5, borderRadius: 99, background: THEME.line, margin: '0 auto 14px' }} />
        {title && <div style={{ fontFamily: THEME.font, fontWeight: 700, fontSize: 20, color: THEME.ink, letterSpacing: -0.3, marginBottom: 14 }}>{title}</div>}
        {children}
        <div style={{ height: 'max(24px, env(safe-area-inset-bottom))' }} />
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 100, zIndex: 300,
      background: THEME.ink, color: '#fff', borderRadius: 14, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10, fontFamily: THEME.font, fontSize: 14.5, fontWeight: 500,
      boxShadow: '0 8px 28px rgba(0,0,0,0.22)', animation: 'toastIn .3s cubic-bezier(.16,1,.3,1) both',
    }}>
      {toast.icon && <span style={{ color: THEME.accent, display: 'flex' }}><Icon name={toast.icon} size={18} /></span>}
      <span style={{ flex: 1 }}>{toast.msg}</span>
    </div>
  );
}

// Form helpers
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: THEME.font, fontWeight: 600, fontSize: 13.5, color: THEME.inkSoft, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
function inputStyle(T) {
  return {
    width: '100%', boxSizing: 'border-box', border: `1px solid ${T.line}`, borderRadius: 13,
    padding: '13px 14px', fontFamily: T.font, fontSize: 16, color: T.ink, outline: 'none', background: T.surfaceAlt,
  };
}
function SectionLabel({ children, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '0 2px 10px' }}>
      <span style={{ fontFamily: THEME.font, fontSize: 13, fontWeight: 600, color: THEME.inkSoft }}>{children}</span>
      {count != null && <span style={{ fontFamily: THEME.font, fontSize: 12.5, color: THEME.inkFaint }}>{count}</span>}
    </div>
  );
}
function EmptyHint({ text }) {
  return (
    <div style={{ fontFamily: THEME.font, fontSize: 14, color: THEME.inkFaint, padding: '14px 16px', background: THEME.surface, borderRadius: 14, border: `1px dashed ${THEME.line}`, textWrap: 'pretty' }}>{text}</div>
  );
}

// Logo: yellow gradient tile with the box + loop badge.
function BrandMark({ size = 76 }) {
  const badge = Math.round(size * 0.38);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.27, background: THEME.accentGrad,
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
    }}>
      <Icon name="box" size={size * 0.5} color={THEME.onAccent} />
      <div style={{
        position: 'absolute', right: -badge * 0.24, bottom: -badge * 0.24, width: badge, height: badge, borderRadius: '50%',
        background: THEME.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 2.5px ${THEME.bg}`,
      }}>
        <Icon name="repeat" size={badge * 0.54} color="#fff" stroke={2.4} />
      </div>
    </div>
  );
}
function Wordmark({ size = 26 }) {
  return (
    <div style={{ fontFamily: THEME.font, fontWeight: 800, fontSize: size, color: THEME.ink, letterSpacing: -0.8, lineHeight: 1, whiteSpace: 'nowrap' }}>
      ShareKeep<span style={{ color: THEME.accentText }}>.online</span>
    </div>
  );
}

Object.assign(window, { THEME, Icon, Avatar, ItemThumb, Pill, StatusPill, Btn, Card, Sheet, Toast, Field, inputStyle, SectionLabel, EmptyHint, BrandMark, Wordmark });
