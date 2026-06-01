// app.jsx — Share2 app shell: state, actions, routing, tab bar, tweaks

const { useState, useEffect, useRef, useMemo } = React;
const STORE_KEY = 'share2_state_v4';

const ACCENTS = {
  '#C2693F': { accent: '#C2693F', accentDeep: '#A8542F', accentSoft: '#F3E1D5' }, // clay
  '#C08A2E': { accent: '#C08A2E', accentDeep: '#9E6F1F', accentSoft: '#F2E7CF' }, // amber
  '#5C7FA3': { accent: '#5C7FA3', accentDeep: '#496888', accentSoft: '#DEE6EE' }, // denim
  '#8A6FA8': { accent: '#8A6FA8', accentDeep: '#705690', accentSoft: '#E9E2F0' }, // plum
};
const INVITE_COLORS = ['#C2693F', '#7C9A6B', '#B5728A', '#6E84A3', '#B7913F', '#8A6FA8', '#C77F55', '#5E8C7D'];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#C2693F",
  "autoApprove": true
}/*EDITMODE-END*/;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return window.seedState();
}

function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // apply accent tweak to shared theme (read at child render time)
  const a = ACCENTS[t.accent] || ACCENTS['#C2693F'];
  window.THEME.accent = a.accent;
  window.THEME.accentDeep = a.accentDeep;
  window.THEME.accentSoft = a.accentSoft;

  const init = loadState();
  const [members, setMembers] = useState(init.members);
  const [groups, setGroups] = useState(init.groups);
  const [currentGroupId, setCurrentGroupId] = useState(init.currentGroupId);
  const [items, setItems] = useState(init.items);
  const [requests, setRequests] = useState(init.requests);
  const [tab, setTab] = useState('browse');
  const [detailId, setDetailId] = useState(null);
  const [modal, setModal] = useState(null);
  const [manageGroupId, setManageGroupId] = useState(null);
  const [toastData, setToastData] = useState(null);
  const toastTimer = useRef(null);
  const scrollRef = useRef(null);

  // keep the live member lookup in sync for components that read window.MEMBERS
  window.MEMBERS = members;

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ members, groups, currentGroupId, items, requests })); } catch (e) {}
  }, [members, groups, currentGroupId, items, requests]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab, currentGroupId]);

  const toast = (msg, icon) => {
    setToastData({ msg, icon, k: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastData(null), 2700);
  };

  const T = window.THEME;
  const group = groups.find(g => g.id === currentGroupId) || groups[0];
  const contacts = Object.values(members).filter(m => !m.you);

  const app = useMemo(() => ({
    items, requests, groups, members, group, contacts, modal, manageGroupId,

    goTab: (x) => { setDetailId(null); setModal(null); setTab(x); },
    openItem: (id) => setDetailId(id),
    closeItem: () => setDetailId(null),
    openModal: (m) => setModal(m),
    closeModal: () => setModal(null),
    openManage: (gid) => { setManageGroupId(gid); setModal('manageGroup'); },

    // ── Groups ──────────────────────────────────────────────────
    switchGroup: (gid) => { setCurrentGroupId(gid); setDetailId(null); setModal(null); setTab('browse'); },

    createGroup: (name, memberIds) => {
      const id = 'g' + Date.now();
      setGroups(prev => [...prev, { id, name, sub: 'New group', members: ['u1', ...memberIds] }]);
      setCurrentGroupId(id);
      setModal(null); setDetailId(null); setTab('lend');
      toast(`Created ${name}`, 'check');
    },

    addMembers: (gid, memberIds) => {
      setGroups(prev => prev.map(g => g.id === gid
        ? { ...g, members: [...g.members, ...memberIds.filter(m => !g.members.includes(m))] }
        : g));
      setModal(null);
      toast(`Added ${memberIds.length} ${memberIds.length === 1 ? 'member' : 'members'}`, 'check');
    },

    inviteMember: (name) => {
      const id = 'u' + Date.now();
      const color = INVITE_COLORS[Object.keys(members).length % INVITE_COLORS.length];
      const first = name.trim().split(/\s+/)[0];
      setMembers(prev => ({ ...prev, [id]: { id, name: first, full: name.trim(), unit: 'Invited', color } }));
      return id;
    },

    // ── Sharing your things into a group ────────────────────────
    shareItem: (itemId, gid) => {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, groups: [...new Set([...(i.groups || []), gid])] } : i));
      const it = items.find(i => i.id === itemId);
      toast(`${it ? it.name : 'Item'} added to ${(groups.find(g => g.id === gid) || {}).name}`, 'check');
    },
    unshareItem: (itemId, gid) => {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, groups: (i.groups || []).filter(x => x !== gid) } : i));
      toast(`Removed from ${(groups.find(g => g.id === gid) || {}).name}`, 'x');
    },

    // ── Borrowing ───────────────────────────────────────────────
    requestBorrow: (itemId, due, note) => {
      const it = items.find(i => i.id === itemId);
      const owner = members[it.owner];
      const rid = 'r' + Date.now();
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'pending' } : i));
      setRequests(prev => [...prev, { id: rid, itemId, from: 'u1', to: it.owner, due, note, status: 'pending', dir: 'out', group: currentGroupId }]);
      toast(`Request sent to ${owner.name}`, 'check');

      if (t.autoApprove) {
        setTimeout(() => {
          setRequests(prev => {
            const r = prev.find(x => x.id === rid);
            if (!r || r.status !== 'pending') return prev;
            setItems(its => its.map(i => i.id === itemId ? { ...i, status: 'out', borrower: 'u1', due } : i));
            toast(`${owner.name} said yes! Due ${window.fmtDate(due)}`, 'check');
            return prev.map(x => x.id === rid ? { ...x, status: 'approved' } : x);
          });
        }, 3600);
      }
    },

    respondRequest: (reqId, accept) => {
      const r = requests.find(x => x.id === reqId);
      if (!r) return;
      const from = members[r.from];
      if (accept) {
        setItems(prev => prev.map(i => i.id === r.itemId ? { ...i, status: 'out', borrower: r.from, due: r.due } : i));
        setRequests(prev => prev.map(x => x.id === reqId ? { ...x, status: 'approved' } : x));
        toast(`Lent to ${from.name} · back ${window.fmtDate(r.due)}`, 'check');
      } else {
        setItems(prev => prev.map(i => i.id === r.itemId ? { ...i, status: 'available' } : i));
        setRequests(prev => prev.map(x => x.id === reqId ? { ...x, status: 'declined' } : x));
        toast(`Declined ${from.name}’s request`, 'x');
      }
    },

    returnItem: (itemId) => {
      const it = items.find(i => i.id === itemId);
      const owner = members[it.owner];
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'available', borrower: null, due: null } : i));
      toast(`Returned to ${owner.name}`, 'check');
      setDetailId(null);
    },

    markReturned: (itemId) => {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'available', borrower: null, due: null } : i));
      toast('Back on your shelf', 'box');
    },

    notifyWhenFree: (it) => toast(`We’ll ping you when ${it.name} is free`, 'bell'),

    addItem: (data) => {
      const id = 'i' + Date.now();
      const img = window.flickr(window.slugKeyword(data.name), Date.now() % 100000);
      setItems(prev => [{ id, owner: 'u1', status: 'available', borrower: null, due: null, img, groups: [currentGroupId], ...data }, ...prev]);
      toast(`Added to ${group.name}`, 'box');
      setModal(null); setTab('browse');
    },

    reset: () => {
      const s = window.seedState();
      setMembers(s.members); setGroups(s.groups); setCurrentGroupId(s.currentGroupId);
      setItems(s.items); setRequests(s.requests);
      setDetailId(null); setModal(null); setTab('browse');
      toast('Demo data reset', 'check');
    },
  }), [items, requests, groups, members, group, contacts, modal, manageGroupId, currentGroupId, t.autoApprove]);

  const incomingCount = requests.filter(r => r.dir === 'in' && r.status === 'pending').length;
  const detailItem = detailId ? items.find(i => i.id === detailId) : null;

  const screens = {
    browse: <window.BrowseScreen app={app} />,
    lend: <window.LendScreen app={app} />,
    borrows: <window.BorrowsScreen app={app} />,
    you: <window.ProfileScreen app={app} />,
  };

  const tabs = [
    { id: 'browse', label: 'Shelf', icon: 'browse' },
    { id: 'lend', label: 'Lend', icon: 'plus' },
    { id: 'borrows', label: 'Loans', icon: 'swap', badge: incomingCount },
    { id: 'you', label: 'You', icon: 'user' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: T.bg, overflow: 'hidden' }}>
      <div ref={scrollRef} className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
        {screens[tab]}
      </div>

      {detailItem && <window.ItemDetail app={app} item={detailItem} />}

      {/* Tab bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100,
        padding: '10px 18px 30px',
        background: `linear-gradient(to top, ${T.bg} 62%, ${T.bg}f2 84%, transparent)`,
      }}>
        <div style={{
          display: 'flex', background: T.surface, borderRadius: 20,
          border: `1px solid ${T.lineSoft}`, boxShadow: '0 6px 20px rgba(60,45,30,0.1)',
          padding: '7px 6px',
        }}>
          {tabs.map(tb => {
            const active = tab === tb.id && !detailItem;
            return (
              <button key={tb.id} onClick={() => app.goTab(tb.id)} style={{
                flex: 1, border: 'none', background: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 0', position: 'relative', WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{ position: 'relative' }}>
                  <window.Icon name={tb.icon} size={23} color={active ? T.accent : T.inkFaint} stroke={active ? 2.3 : 2} />
                  {tb.badge > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -7, minWidth: 16, height: 16, padding: '0 4px',
                      borderRadius: 9, background: T.accent, color: '#fff', fontSize: 10.5, fontWeight: 700,
                      fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 0 2px ${T.surface}`,
                    }}>{tb.badge}</span>
                  )}
                </div>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: active ? 700 : 500, color: active ? T.accent : T.inkFaint }}>{tb.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <window.Toast toast={toastData} />

      {/* Group sheets */}
      <window.GroupSwitcherSheet app={app} />
      <window.CreateGroupSheet app={app} />
      <window.ManageGroupSheet app={app} />

      {/* Tweaks */}
      <window.TweaksPanel>
        <window.TweakSection label="Look" />
        <window.TweakColor label="Accent" value={t.accent}
          options={['#C2693F', '#C08A2E', '#5C7FA3', '#8A6FA8']}
          onChange={(v) => setTweak('accent', v)} />
        <window.TweakSection label="Demo" />
        <window.TweakToggle label="Auto-approve requests" value={t.autoApprove}
          onChange={(v) => setTweak('autoApprove', v)} />
      </window.TweaksPanel>
    </div>
  );
}

function Root() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#E7DECF' }}>
      <window.IOSDevice>
        <App />
      </window.IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
