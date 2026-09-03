// helpers.jsx — small utilities. Data is live from Firestore.

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Firestore Timestamp (or Date/ms) → "12 Mar"
function fmtSince(ts) {
  if (!ts) return '';
  const d = ts && ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// Who currently has an item. New items carry holderUid; older ones used
// status/borrowerUid, so fall back to those.
function holderOf(it) {
  if (!it) return null;
  if (it.holderUid !== undefined) return it.holderUid || null;
  return it.status === 'out' && it.borrowerUid ? it.borrowerUid : null;
}

Object.assign(window, {
  fmtDate, fmtSince, holderOf,
  MEMBERS: {}, // live lookup of users, synced by App
});
