// helpers.jsx — date helpers, categories, small utilities (no seed data; data is live from Firestore)

function todayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(n) {
  const d = todayMidnight();
  d.setDate(d.getDate() + n);
  return d;
}
function isoFromOffset(n) {
  return addDays(n).toISOString().slice(0, 10);
}
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function daysUntil(iso) {
  if (!iso) return 0;
  const d = new Date(iso + 'T00:00:00');
  return Math.round((d - todayMidnight()) / 86400000);
}
function relativeDue(iso) {
  const n = daysUntil(iso);
  if (n < 0) return { label: `${Math.abs(n)}d overdue`, tone: 'over' };
  if (n === 0) return { label: 'Due today', tone: 'soon' };
  if (n === 1) return { label: 'Due tomorrow', tone: 'soon' };
  if (n <= 3) return { label: `Due in ${n} days`, tone: 'soon' };
  return { label: `Due ${fmtDate(iso)}`, tone: 'ok' };
}

// Five broad categories plus two "intent" ones — Give Away and Sell — which get
// their own accent colour (meta.chip) so they stand out from regular lending.
// Items saved under any earlier category set are mapped via normCat so they
// keep filtering and displaying correctly.
const LEND_CATEGORIES = ['Tools', 'Home', 'Outdoor', 'Tech', 'Other'];
const MARKET_CATEGORIES = ['Give Away', 'Sell'];
const CATEGORIES = [...LEND_CATEGORIES, ...MARKET_CATEGORIES];
const LEGACY_CATS = {
  // original 8-category era
  'Kitchen': 'Home',
  'Outdoors': 'Outdoor',
  'Sports': 'Outdoor',
  'Kids': 'Other',
  'Books & Games': 'Other',
  // merged 5-category era
  'Home & Kitchen': 'Home',
  'Outdoors & Sports': 'Outdoor',
  'Kids & Games': 'Other',
};
function normCat(c) { return LEGACY_CATS[c] || c || 'Other'; }
const CAT_META = {
  'Tools':     { tint: '#F3F2EF', shape: 'circle',  icon: 'tools'  },
  'Home':      { tint: '#F6F1EC', shape: 'square',  icon: 'home'   },
  'Outdoor':   { tint: '#EFF3EE', shape: 'diamond', icon: 'tree'   },
  'Tech':      { tint: '#EFF0F3', shape: 'circle',  icon: 'screen' },
  'Other':     { tint: '#F2EFEA', shape: 'square',  icon: 'dots'   },
  'Give Away': { tint: '#F3F2EF', shape: 'circle',  icon: 'gift',  chip: '#111111' },
  'Sell':      { tint: '#FFF7E0', shape: 'diamond', icon: 'tag',   chip: '#B07A00' },
};

// For Sell / Give Away items: what little badge and flow they get.
// Returns null for regular (lending) categories.
function marketInfo(item) {
  const c = normCat(item.cat);
  // `color` is used for text/icons on light surfaces (must be readable);
  // `badgeBg`/`badgeFg` are for the small pill on item photos.
  if (c === 'Sell') return { kind: 'sell', label: (item.price || '').trim() || 'For sale', icon: 'tag', color: '#B07A00', badgeBg: '#F5B400', badgeFg: '#1A1300' };
  if (c === 'Give Away') return { kind: 'give', label: 'Free', icon: 'gift', color: '#111111', badgeBg: '#111111', badgeFg: '#FFFFFF' };
  return null;
}

Object.assign(window, {
  todayMidnight, addDays, isoFromOffset, fmtDate, daysUntil, relativeDue,
  CATEGORIES, LEND_CATEGORIES, MARKET_CATEGORIES, CAT_META, normCat, marketInfo,
  MEMBERS: {}, // live lookup of users, synced by App
});
