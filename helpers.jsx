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

const CATEGORIES = ['Tools', 'Kitchen', 'Outdoors', 'Tech', 'Home', 'Kids', 'Sports', 'Books & Games'];
const CAT_META = {
  'Tools':         { tint: '#ECE3D4', shape: 'circle' },
  'Kitchen':       { tint: '#EEDFD7', shape: 'square' },
  'Outdoors':      { tint: '#DEE7DC', shape: 'diamond' },
  'Tech':          { tint: '#E2E2DA', shape: 'circle' },
  'Home':          { tint: '#E9E2D1', shape: 'square' },
  'Kids':          { tint: '#EDE1D4', shape: 'diamond' },
  'Sports':        { tint: '#DDE6E2', shape: 'circle' },
  'Books & Games': { tint: '#ECE0D8', shape: 'square' },
};

Object.assign(window, {
  todayMidnight, addDays, isoFromOffset, fmtDate, daysUntil, relativeDue,
  CATEGORIES, CAT_META,
  MEMBERS: {}, // live lookup of users, synced by App
});
