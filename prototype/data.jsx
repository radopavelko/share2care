// data.jsx — domain model, seed data, date + category helpers for Share2

const TODAY = new Date(2026, 4, 31); // May 31, 2026 — fixed "today" for the prototype

function addDays(n) {
  const d = new Date(TODAY);
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
  return Math.round((d - TODAY) / 86400000);
}
function relativeDue(iso) {
  const n = daysUntil(iso);
  if (n < 0) return { label: `${Math.abs(n)}d overdue`, tone: 'over' };
  if (n === 0) return { label: 'Due today', tone: 'soon' };
  if (n === 1) return { label: 'Due tomorrow', tone: 'soon' };
  if (n <= 3) return { label: `Due in ${n} days`, tone: 'soon' };
  return { label: `Due ${fmtDate(iso)}`, tone: 'ok' };
}

// Topical real sample photos by keyword (deterministic via lock seed), tile fallback on error
function flickr(kw, n) {
  return 'https://loremflickr.com/600/450/' + encodeURIComponent(kw) + '?lock=' + n;
}
function slugKeyword(name) {
  const w = (name || '').toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/)[0];
  return w || 'object';
}

// ── People Maya knows (roster) ─────────────────────────────────
const BASE_MEMBERS = {
  u1:  { id: 'u1',  name: 'Maya',   full: 'Maya Reyes',     unit: 'Apt 3B', color: '#C2693F', you: true },
  u2:  { id: 'u2',  name: 'Devon',  full: 'Devon Clarke',   unit: 'Apt 1A', color: '#7C9A6B' },
  u3:  { id: 'u3',  name: 'Priya',  full: 'Priya Anand',    unit: 'Apt 2C', color: '#B5728A' },
  u4:  { id: 'u4',  name: 'Otis',   full: 'Otis Boone',     unit: 'Apt 1D', color: '#6E84A3' },
  u5:  { id: 'u5',  name: 'Greta',  full: 'Greta Lind',     unit: 'Apt 4A', color: '#B7913F' },
  u6:  { id: 'u6',  name: 'Sam',    full: 'Sam Okafor',     unit: 'Apt 2B', color: '#8A6FA8' },
  u7:  { id: 'u7',  name: 'Nina',   full: 'Nina Halvorsen', unit: 'Friend', color: '#C77F55' },
  u8:  { id: 'u8',  name: 'Theo',   full: 'Theo Maddox',    unit: 'Friend', color: '#5E8C7D' },
  u9:  { id: 'u9',  name: 'Marcus', full: 'Marcus Webb',    unit: 'Friend', color: '#A86A6A' },
  u10: { id: 'u10', name: 'Elena',  full: 'Elena Reyes',    unit: 'Mom',    color: '#9A7BB0' },
  u11: { id: 'u11', name: 'Carlos', full: 'Carlos Reyes',   unit: 'Brother',color: '#5F8AA0' },
  u12: { id: 'u12', name: 'Lucia',  full: 'Lucia Reyes',    unit: 'Sister', color: '#C28A4A' },
  u13: { id: 'u13', name: 'Hana',   full: 'Hana Kim',       unit: 'Contact',color: '#8AA06B' },
  u14: { id: 'u14', name: 'Jules',  full: 'Jules Romano',   unit: 'Contact',color: '#A86A8E' },
};

// ── Groups Maya belongs to ─────────────────────────────────────
const BASE_GROUPS = [
  { id: 'g1', name: 'Maple Court',  sub: 'Apartment building', members: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] },
  { id: 'g2', name: 'Weekend Crew', sub: 'Friends',            members: ['u1', 'u7', 'u8', 'u9'] },
  { id: 'g3', name: 'Reyes Family', sub: 'Family',             members: ['u1', 'u10', 'u11', 'u12'] },
];

// ── Categories ─────────────────────────────────────────────────
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

// ── Seed library ───────────────────────────────────────────────
// status: 'available' | 'pending' | 'out' ; groups: which shelves it's shared to
function seedState() {
  const items = [
    // Maya's own things — shared across different groups (some not shared yet)
    { id: 'i1',  name: 'Cordless drill',      cat: 'Tools',    owner: 'u1', cond: 'Good',     status: 'out',     borrower: 'u5', due: isoFromOffset(2), groups: ['g1', 'g2'], desc: '18V with two batteries and a full bit set. Charger in the case.' },
    { id: 'i2',  name: 'Stand mixer',         cat: 'Kitchen',  owner: 'u1', cond: 'Like new', status: 'pending', borrower: null, due: null,             groups: ['g1'],       desc: 'Tilt-head, 5qt bowl, whisk + dough hook. Heavy — bring a bag.' },
    { id: 'i3',  name: 'Projector',           cat: 'Tech',     owner: 'u1', cond: 'Good',     status: 'pending', borrower: null, due: null,             groups: ['g1', 'g2'], desc: '1080p, HDMI + USB-C. Great for movie nights on the courtyard wall.' },
    { id: 'i19', name: 'Folding chairs · 4',  cat: 'Home',     owner: 'u1', cond: 'Good',     status: 'available', borrower: null, due: null,           groups: ['g2'],       desc: 'Set of four, fold flat. Carry bag included.' },
    { id: 'i20', name: 'Picnic blanket',      cat: 'Outdoors', owner: 'u1', cond: 'Like new', status: 'available', borrower: null, due: null,           groups: [],           desc: 'Big waterproof-backed blanket. Rolls up small.' },
    { id: 'i21', name: 'Power bank',          cat: 'Tech',     owner: 'u1', cond: 'Good',     status: 'available', borrower: null, due: null,           groups: [],           desc: '20,000mAh, charges a phone ~4 times. USB-C + USB-A.' },
    { id: 'i22', name: 'Roof box',            cat: 'Outdoors', owner: 'u1', cond: 'Good',     status: 'available', borrower: null, due: null,           groups: ['g3'],       desc: 'Rooftop cargo box, fits most crossbars. Great for road trips.' },

    // Maple Court (g1) neighbours
    { id: 'i4',  name: 'Pressure washer',     cat: 'Outdoors',      owner: 'u4', cond: 'Well-loved', status: 'out',       borrower: 'u1', due: isoFromOffset(3), groups: ['g1'], desc: 'Electric, 1800psi. Comes with two nozzle tips.' },
    { id: 'i5',  name: '4-person tent',       cat: 'Outdoors',      owner: 'u6', cond: 'Good',       status: 'out',       borrower: 'u1', due: isoFromOffset(6), groups: ['g1'], desc: 'Sets up in ~10 min. Footprint and stakes included.' },
    { id: 'i6',  name: 'Step ladder · 6ft',   cat: 'Tools',         owner: 'u2', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'Aluminium, fold-flat. Handy tray at the top.' },
    { id: 'i7',  name: 'Slow cooker',         cat: 'Kitchen',       owner: 'u3', cond: 'Like new',   status: 'available', borrower: null, due: null,             groups: ['g1'], desc: '6qt, programmable. Perfect for batch cooking.' },
    { id: 'i8',  name: 'Hand sander',         cat: 'Tools',         owner: 'u4', cond: 'Well-loved', status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'Orbital. A few spare sheets of sandpaper tucked inside.' },
    { id: 'i9',  name: 'Settlers of Catan',   cat: 'Books & Games', owner: 'u5', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'Base game plus the 5–6 player expansion. All pieces accounted for.' },
    { id: 'i10', name: 'Bike floor pump',     cat: 'Sports',        owner: 'u2', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'With pressure gauge. Presta + Schrader.' },
    { id: 'i11', name: 'Picnic cooler',       cat: 'Outdoors',      owner: 'u3', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: '40qt wheeled cooler. Holds ice for two days easy.' },
    { id: 'i12', name: 'Sewing machine',      cat: 'Home',          owner: 'u5', cond: 'Like new',   status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'Beginner-friendly with a quick-start card. Bobbins included.' },
    { id: 'i13', name: "Kids' scooter",       cat: 'Kids',          owner: 'u6', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'Adjustable height, ages 4–8. Helmet not included.' },
    { id: 'i14', name: 'Espresso machine',    cat: 'Kitchen',       owner: 'u2', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: '15-bar with steam wand and a portafilter tamper.' },
    { id: 'i15', name: 'Folding table',       cat: 'Home',          owner: 'u4', cond: 'Well-loved', status: 'available', borrower: null, due: null,             groups: ['g1'], desc: '6ft, folds in half. Great for parties or a yard sale.' },
    { id: 'i16', name: 'Telescope',           cat: 'Tech',          owner: 'u6', cond: 'Like new',   status: 'available', borrower: null, due: null,             groups: ['g1'], desc: '70mm refractor, tripod + two eyepieces. Easy to aim.' },
    { id: 'i17', name: 'Garment steamer',     cat: 'Home',          owner: 'u3', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'Heats in 30s. Good for that one suit you wear twice a year.' },
    { id: 'i18', name: 'Roller blades · W8',  cat: 'Sports',        owner: 'u5', cond: 'Good',       status: 'available', borrower: null, due: null,             groups: ['g1'], desc: 'Women’s 8. Wrist guards in the bag.' },

    // Weekend Crew (g2) friends
    { id: 'i23', name: 'Camping stove',       cat: 'Outdoors',      owner: 'u7', cond: 'Good',       status: 'available', borrower: null, due: null, groups: ['g2'], desc: 'Two-burner propane stove. Fuel canister not included.' },
    { id: 'i24', name: 'Bluetooth speaker',   cat: 'Tech',          owner: 'u8', cond: 'Like new',   status: 'available', borrower: null, due: null, groups: ['g2'], desc: 'Waterproof, loud, ~12h battery. Great for the beach.' },
    { id: 'i25', name: 'Action camera',       cat: 'Tech',          owner: 'u7', cond: 'Good',       status: 'available', borrower: null, due: null, groups: ['g2'], desc: 'Waterproof case + chest mount + spare battery.' },
    { id: 'i26', name: 'Cool box',            cat: 'Outdoors',      owner: 'u9', cond: 'Well-loved', status: 'available', borrower: null, due: null, groups: ['g2'], desc: '25L hard cooler. A couple of stickers, still seals great.' },
    { id: 'i27', name: 'Paddleboard',         cat: 'Sports',        owner: 'u8', cond: 'Good',       status: 'out',       borrower: 'u9', due: isoFromOffset(4), groups: ['g2'], desc: 'Inflatable SUP with pump, paddle and leash.' },

    // Reyes Family (g3)
    { id: 'i28', name: 'KitchenAid mixer',    cat: 'Kitchen',       owner: 'u10', cond: 'Like new',  status: 'available', borrower: null, due: null, groups: ['g3'], desc: 'The good one. Please return clean :)' },
    { id: 'i29', name: 'Extension ladder',    cat: 'Tools',         owner: 'u11', cond: 'Good',       status: 'available', borrower: null, due: null, groups: ['g3'], desc: 'Reaches the gutters. Heavy — two people to carry.' },
    { id: 'i30', name: 'Punch bowl set',      cat: 'Kitchen',       owner: 'u10', cond: 'Like new',   status: 'available', borrower: null, due: null, groups: ['g3'], desc: 'Glass bowl + 12 cups + ladle. For the big gatherings.' },
    { id: 'i31', name: 'Garden tiller',       cat: 'Outdoors',      owner: 'u11', cond: 'Well-loved', status: 'available', borrower: null, due: null, groups: ['g3'], desc: 'Electric tiller for turning the veggie beds.' },
    { id: 'i32', name: 'Air mattress',        cat: 'Home',          owner: 'u12', cond: 'Good',       status: 'available', borrower: null, due: null, groups: ['g3'], desc: 'Queen, with built-in pump. For when everyone stays over.' },
  ];

  const KW = {
    i1: 'drill', i2: 'mixer', i3: 'projector', i4: 'cleaning', i5: 'tent',
    i6: 'ladder', i7: 'cooking', i8: 'tools', i9: 'boardgame', i10: 'bicycle',
    i11: 'cooler', i12: 'sewing', i13: 'scooter', i14: 'espresso', i15: 'table',
    i16: 'telescope', i17: 'ironing', i18: 'skates', i19: 'chair', i20: 'blanket',
    i21: 'battery', i22: 'car', i23: 'stove', i24: 'speaker', i25: 'camera',
    i26: 'cooler', i27: 'paddleboard', i28: 'mixer', i29: 'ladder', i30: 'bowl',
    i31: 'garden', i32: 'mattress',
  };
  items.forEach((it, idx) => { it.img = flickr(KW[it.id] || slugKeyword(it.name), idx + 3); });

  const requests = [
    { id: 'r1', itemId: 'i2', from: 'u2', to: 'u1', due: isoFromOffset(5), note: 'Baking for the school sale this weekend!', status: 'pending', dir: 'in', group: 'g1' },
    { id: 'r2', itemId: 'i3', from: 'u3', to: 'u1', due: isoFromOffset(3), note: 'Courtyard movie night Saturday 🍿', status: 'pending', dir: 'in', group: 'g1' },
  ];

  return {
    members: JSON.parse(JSON.stringify(BASE_MEMBERS)),
    groups: JSON.parse(JSON.stringify(BASE_GROUPS)),
    currentGroupId: 'g1',
    items, requests,
  };
}

Object.assign(window, {
  TODAY, addDays, isoFromOffset, fmtDate, daysUntil, relativeDue, flickr, slugKeyword,
  BASE_MEMBERS, BASE_GROUPS, CATEGORIES, CAT_META, seedState,
  MEMBERS: JSON.parse(JSON.stringify(BASE_MEMBERS)), // live lookup, synced by App
});
