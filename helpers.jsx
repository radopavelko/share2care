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
const CATEGORIES = ['Tools', 'Home', 'Outdoor', 'Tech', 'Other', 'Give Away', 'Sell'];
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
  'Tools':     { tint: '#ECE3D4', shape: 'circle',  icon: 'tools'  },
  'Home':      { tint: '#EEDFD7', shape: 'square',  icon: 'home'   },
  'Outdoor':   { tint: '#DEE7DC', shape: 'diamond', icon: 'tree'   },
  'Tech':      { tint: '#E2E2DA', shape: 'circle',  icon: 'screen' },
  'Other':     { tint: '#E9E2D1', shape: 'square',  icon: 'dots'   },
  'Give Away': { tint: '#E0EBDC', shape: 'circle',  icon: 'gift',  chip: '#6E8B66' },
  'Sell':      { tint: '#F2E6C8', shape: 'diamond', icon: 'tag',   chip: '#B07A2E' },
};

Object.assign(window, {
  todayMidnight, addDays, isoFromOffset, fmtDate, daysUntil, relativeDue,
  CATEGORIES, CAT_META, normCat,
  MEMBERS: {}, // live lookup of users, synced by App
});
