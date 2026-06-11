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

// Five broad categories keep browsing and the add-item form quick. Items saved
// under the old 8-category set are mapped onto these via normCat so they keep
// filtering and displaying correctly.
const CATEGORIES = ['Tools', 'Home & Kitchen', 'Outdoors & Sports', 'Tech', 'Kids & Games'];
const LEGACY_CATS = {
  'Kitchen': 'Home & Kitchen',
  'Home': 'Home & Kitchen',
  'Outdoors': 'Outdoors & Sports',
  'Sports': 'Outdoors & Sports',
  'Kids': 'Kids & Games',
  'Books & Games': 'Kids & Games',
};
function normCat(c) { return LEGACY_CATS[c] || c || 'Home & Kitchen'; }
const CAT_META = {
  'Tools':            { tint: '#ECE3D4', shape: 'circle' },
  'Home & Kitchen':   { tint: '#EEDFD7', shape: 'square' },
  'Outdoors & Sports':{ tint: '#DEE7DC', shape: 'diamond' },
  'Tech':             { tint: '#E2E2DA', shape: 'circle' },
  'Kids & Games':     { tint: '#EDE1D4', shape: 'diamond' },
};

Object.assign(window, {
  todayMidnight, addDays, isoFromOffset, fmtDate, daysUntil, relativeDue,
  CATEGORIES, CAT_META, normCat,
  MEMBERS: {}, // live lookup of users, synced by App
});
