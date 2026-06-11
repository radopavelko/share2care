// app.jsx — Share2 app shell: auth gate, Firestore data layer, actions, tabs.

const { useState, useEffect, useRef, useMemo } = React;

// ── Sign-in screen ─────────────────────────────────────────────
function SignIn({ onSignIn, error }) {
  const T = window.THEME;
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { await onSignIn(); } catch (e) { /* surfaced via error prop */ }
    setBusy(false);
  };
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '0 32px', background: T.bg,
    }}>
      <div style={{
        width: 76, height: 76, borderRadius: 22, background: T.accent, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
        boxShadow: '0 8px 24px rgba(194,105,63,0.34)',
      }}>
        <window.Icon name="box" size={38} color="#fff" />
      </div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 34, color: T.ink, letterSpacing: -0.6 }}>Share2</div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: T.inkSoft, marginTop: 8, maxWidth: 280, lineHeight: 1.5, textWrap: 'pretty' }}>
        Borrow and lend everyday things with people you trust.
      </div>

      <div style={{ height: 34 }} />

      <button onClick={go} disabled={busy} style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 11,
        background: '#fff', color: '#3c3c3c', border: `1.5px solid ${T.line}`,
        borderRadius: 14, padding: '14px 22px', cursor: busy ? 'default' : 'pointer',
        fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 16,
        boxShadow: T.shadowSm, opacity: busy ? 0.6 : 1, WebkitTapHighlightColor: 'transparent',
      }}>
        <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.5c-.5 2.9-2.2 5.3-4.7 7l7.2 5.6c4.2-3.9 6.6-9.6 6.6-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6l-7.9-6.2C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.6 2.2-8.7 2.2-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"/></svg>
        {busy ? 'Opening…' : 'Continue with Google'}
      </button>

      {error && (
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, color: T.over, marginTop: 18, maxWidth: 300, lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkFaint, marginTop: 26, maxWidth: 280, lineHeight: 1.5 }}>
        Create or join groups with people you trust — you only see each other's shared things.
      </div>
    </div>
  );
}

// ── Main app (only mounted when signed in) ─────────────────────
function App({ me }) {
  const T = window.THEME;
  const [members, setMembers] = useState(window.MEMBERS);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState(() => {
    try { return localStorage.getItem('s2.group.' + me.id) || null; } catch (e) { return null; }
  });
  const [tab, setTab] = useState('browse');
  const [detailId, setDetailId] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalArg, setModalArg] = useState(null);
  const [toastData, setToastData] = useState(null);
  const toastTimer = useRef(null);
  const scrollRef = useRef(null);
  const claimedRef = useRef(false);

  window.MEMBERS = members;
  const uid = me.id;

  // Live data subscriptions
  useEffect(() => {
    const u1 = window.S2.subUsers(setMembers);
    const u2 = window.S2.subItems(setItems);
    const u3 = window.S2.subRequests(setRequests);
    const u4 = window.S2.subGroups(setGroups);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  // Groups I belong to, plus the currently selected one (null = all things).
  const myGroups = groups.filter(g => Array.isArray(g.memberUids) && g.memberUids.includes(uid));
  const group = groupId ? myGroups.find(g => g.id === groupId) || null : null;

  // If the saved group is one I'm no longer in (or never loaded), fall back to "all".
  useEffect(() => {
    if (groupId && groups.length && !group) setCurrentGroup(null);
  }, [groupId, groups.length, group]);

  const setCurrentGroup = (id) => {
    setGroupId(id);
    try {
      if (id) localStorage.setItem('s2.group.' + uid, id);
      else localStorage.removeItem('s2.group.' + uid);
    } catch (e) { /* ignore */ }
  };

  // Auto-claim: turn any pending email invites for me into real membership,
  // and honour a ?join=CODE invite link, once groups have loaded.
  useEffect(() => {
    if (claimedRef.current || !groups.length) return;
    const myEmail = (me.email || '').trim().toLowerCase();
    let joinedId = null;

    // email invites addressed to me
    if (myEmail) {
      groups.forEach(g => {
        const invited = (g.invitedEmails || []).map(e => e.toLowerCase());
        const isMember = (g.memberUids || []).includes(uid);
        if (invited.includes(myEmail) && !isMember) {
          window.S2.claimEmailInvite(g.id, uid, myEmail).catch(console.error);
          joinedId = joinedId || g.id;
        }
      });
    }

    // ?join=CODE link
    try {
      const code = new URLSearchParams(window.location.search).get('join');
      if (code) {
        const g = groups.find(x => (x.code || '').toUpperCase() === code.trim().toUpperCase());
        if (g) {
          if (!(g.memberUids || []).includes(uid)) window.S2.joinGroupById(g.id, uid).catch(console.error);
          joinedId = g.id;
        }
        const url = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', url);
      }
    } catch (e) { /* ignore */ }

    claimedRef.current = true;
    if (joinedId) setCurrentGroup(joinedId);
  }, [groups]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [tab]);

  const toast = (msg, icon) => {
    setToastData({ msg, icon, k: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastData(null), 2700);
  };

  const app = useMemo(() => ({
    me, uid, items, requests, members, modal, modalArg, toast,
    groups: myGroups, group, groupId, allGroups: groups,

    goTab: (x) => { setDetailId(null); setModal(null); setModalArg(null); setTab(x); },
    openItem: (id) => setDetailId(id),
    closeItem: () => setDetailId(null),
    openModal: (m, arg = null) => { setModal(m); setModalArg(arg); },
    closeModal: () => { setModal(null); setModalArg(null); },

    // ── Groups ──────────────────────────────────────────────────
    switchGroup: (id) => { setCurrentGroup(id); setModal(null); setModalArg(null); },

    createGroup: async (name, itemIds = []) => {
      const nm = (name || '').trim();
      if (!nm) return;
      // only ever share items the signed-in user actually owns
      const own = (itemIds || []).filter(id => {
        const it = items.find(x => x.id === id);
        return it && it.ownerUid === uid;
      });
      try {
        const id = await window.S2.createGroup(nm, uid);
        if (own.length) await Promise.all(own.map(itemId => window.S2.shareItemToGroup(itemId, id)));
        setCurrentGroup(id);
        setModal(null); setModalArg(null);
        toast(own.length ? `Created “${nm}” · ${own.length} item${own.length === 1 ? '' : 's'}` : `Created “${nm}”`, 'users');
      } catch (e) { console.error(e); toast('Could not create group', 'x'); }
    },

    joinByCode: async (code) => {
      const c = (code || '').trim().toUpperCase();
      if (!c) return;
      const g = groups.find(x => (x.code || '').toUpperCase() === c);
      if (!g) { toast('No group with that code', 'x'); return; }
      try {
        if (!(g.memberUids || []).includes(uid)) await window.S2.joinGroupById(g.id, uid);
        setCurrentGroup(g.id);
        setModal(null); setModalArg(null);
        toast(`Joined “${g.name}”`, 'check');
      } catch (e) { console.error(e); toast('Could not join group', 'x'); }
    },

    inviteEmail: async (groupGId, email) => {
      const em = (email || '').trim().toLowerCase();
      if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { toast('Enter a valid email', 'x'); return false; }
      try { await window.S2.addEmailInvite(groupGId, em); toast(`Invited ${em}`, 'mail'); return true; }
      catch (e) { console.error(e); toast('Could not add invite', 'x'); return false; }
    },

    removeInvite: async (groupGId, email) => {
      try { await window.S2.removeEmailInvite(groupGId, email); }
      catch (e) { console.error(e); toast('Could not remove invite', 'x'); }
    },

    toggleItemGroup: async (item, gid) => {
      const has = (item.groups || []).includes(gid);
      try {
        if (has) await window.S2.unshareItemFromGroup(item.id, gid);
        else await window.S2.shareItemToGroup(item.id, gid);
      } catch (e) { console.error(e); toast('Could not update sharing', 'x'); }
    },

    inviteLink: (g) => `${window.location.origin}${window.location.pathname}?join=${g.code}`,

    addItem: async ({ name, cat, cond, desc, file, price, groups: gids }) => {
      setModal(null); setModalArg(null);
      try {
        let photoURL = '';
        if (file) { toast('Uploading photo…', 'camera'); photoURL = await window.S2.uploadPhoto(file, uid); }
        const shareGroups = gids && gids.length ? gids : (groupId ? [groupId] : []);
        await window.S2.addItem({
          name, cat, cond, desc, photoURL, price: price || '', groups: shareGroups,
          ownerUid: uid, status: 'available', borrowerUid: null, due: null,
        });
        toast('Added to your shelf', 'box');
        setTab('browse');
      } catch (e) { console.error(e); toast('Could not add item', 'x'); }
    },

    editItem: async (itemId, { name, cat, desc, file, price }) => {
      setModal(null); setModalArg(null);
      try {
        const patch = { name, cat, desc, price: price || '' };
        if (file) { toast('Uploading photo…', 'camera'); patch.photoURL = await window.S2.uploadPhoto(file, uid); }
        await window.S2.updateItem(itemId, patch);
        toast('Item updated', 'check');
      } catch (e) { console.error(e); toast('Could not update item', 'x'); }
    },

    requestBorrow: async (itemId, due, note) => {
      const it = items.find(i => i.id === itemId);
      if (!it) return;
      const owner = members[it.ownerUid];
      try {
        await window.S2.addRequest({ itemId, fromUid: uid, toUid: it.ownerUid, due, note, status: 'pending' });
        await window.S2.updateItem(itemId, { status: 'pending' });
        toast(`Request sent to ${owner ? owner.name : 'owner'}`, 'check');
      } catch (e) { console.error(e); toast('Could not send request', 'x'); }
    },

    respondRequest: async (reqId, accept) => {
      const r = requests.find(x => x.id === reqId);
      if (!r) return;
      const from = members[r.fromUid];
      const it = items.find(x => x.id === r.itemId);
      const market = it ? window.marketInfo(it) : null;
      try {
        if (accept && !r.due && market) {
          // Sell / Give Away: no loan — the item changes hands for good.
          await window.S2.updateRequest(reqId, { status: 'approved' });
          await window.S2.updateItem(r.itemId, { status: 'gone', borrowerUid: r.fromUid, due: null });
          toast(market.kind === 'sell' ? `Sold to ${from ? from.name : 'them'}` : `Given to ${from ? from.name : 'them'}`, 'check');
        } else if (accept) {
          await window.S2.approveRequest(reqId, r.itemId, r.fromUid, r.due);
          toast(`Lent to ${from ? from.name : 'them'} · back ${window.fmtDate(r.due)}`, 'check');
        } else {
          await window.S2.updateRequest(reqId, { status: 'declined' });
          await window.S2.updateItem(r.itemId, { status: 'available' });
          toast(`Declined ${from ? from.name + '’s' : 'the'} request`, 'x');
        }
      } catch (e) { console.error(e); toast('Something went wrong', 'x'); }
    },

    returnItem: async (itemId) => {
      const it = items.find(i => i.id === itemId);
      const owner = it ? members[it.ownerUid] : null;
      try {
        await window.S2.updateItem(itemId, { status: 'available', borrowerUid: null, due: null });
        toast(`Returned to ${owner ? owner.name : 'owner'}`, 'check');
        setDetailId(null);
      } catch (e) { console.error(e); toast('Could not update', 'x'); }
    },

    markReturned: async (itemId) => {
      try {
        await window.S2.updateItem(itemId, { status: 'available', borrowerUid: null, due: null });
        toast('Back on your shelf', 'box');
      } catch (e) { console.error(e); toast('Could not update', 'x'); }
    },

    notifyWhenFree: (it) => toast(`We’ll let you know when ${it.name} is free`, 'bell'),

    signOut: () => window.S2.signOut(),
  }), [items, requests, members, modal, modalArg, groups, groupId, me, uid]);

  const incomingCount = requests.filter(r => r.toUid === uid && r.status === 'pending').length;
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

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100,
        padding: '10px 18px max(30px, env(safe-area-inset-bottom))',
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
      <window.NewItemSheet app={app} />
      <window.EditItemSheet app={app} />
      <window.GroupSheets app={app} />
    </div>
  );
}

// ── Root: waits for Firebase, manages auth state ───────────────
function Root() {
  const T = window.THEME;
  const [ready, setReady] = useState(!!(window.S2 && window.S2.ready));
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready) return;
    const onReady = () => setReady(true);
    window.addEventListener('s2-ready', onReady);
    return () => window.removeEventListener('s2-ready', onReady);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const unsub = window.S2.onAuth(async (user) => {
      setError('');
      if (!user) { setAuthUser(null); setMe(null); return; }
      try {
        const profile = await window.S2.ensureUserDoc(user);
        window.MEMBERS = { ...window.MEMBERS, [user.uid]: profile };
        setMe(profile);
        setAuthUser(user);
      } catch (e) {
        console.error(e);
        setError('Could not set up your profile. Check Firestore is enabled.');
        setAuthUser(null);
      }
    });
    return () => unsub && unsub();
  }, [ready]);

  const signIn = async () => {
    try { await window.S2.signIn(); }
    catch (e) {
      console.error(e);
      if (e && e.code === 'auth/unauthorized-domain') {
        setError('This domain isn’t authorised yet. Add it under Firebase → Authentication → Settings → Authorized domains.');
      } else if (e && e.code === 'auth/operation-not-allowed') {
        setError('Google sign-in isn’t enabled yet. Turn it on in Firebase → Authentication → Sign-in method.');
      } else if (e && e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setError('Sign-in failed. Please try again.');
      }
    }
  };

  let content;
  if (!ready || authUser === undefined) {
    content = (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <div className="pulse-dot" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 24, color: T.accent }}>Share2</div>
      </div>
    );
  } else if (!authUser || !me) {
    content = <SignIn onSignIn={signIn} error={error} />;
  } else {
    content = <App me={me} />;
  }

  return <div className="s2-phone">{content}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
