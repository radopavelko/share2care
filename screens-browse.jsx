// screens-browse.jsx — Shelf (list of things in the current group) + item detail.

const { useState: useStateB } = React;

function AvatarStack({ ids, size = 28, max = 4 }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  const T = window.THEME;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((id, i) => (
        <div key={id} style={{ marginLeft: i ? -8 : 0 }}><window.Avatar user={id} size={size} ring /></div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -8, width: size, height: size, borderRadius: '50%', background: T.surfaceAlt,
          boxShadow: `0 0 0 2px ${T.surface}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.font, fontSize: size * 0.36, fontWeight: 600, color: T.inkSoft,
        }}>+{extra}</div>
      )}
    </div>
  );
}

function ownerLabel(id, uid) {
  const u = window.MEMBERS[id];
  if (!u) return '';
  return id === uid ? 'You' : u.name;
}

// One row on the shelf.
function ItemRow({ app, it }) {
  const T = window.THEME;
  return (
    <window.Card onClick={() => app.openItem(it.id)} style={{ padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 64, flexShrink: 0 }}><window.ItemThumb item={it} height={64} radius={12} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 16, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <window.Avatar user={it.ownerUid} size={16} />
            <span style={{ fontFamily: T.font, fontSize: 13, color: T.inkSoft }}>{ownerLabel(it.ownerUid, app.uid)}</span>
          </div>
        </div>
        <window.StatusPill item={it} uid={app.uid} small />
      </div>
    </window.Card>
  );
}

// ── SHELF ──────────────────────────────────────────────────────
function BrowseScreen({ app }) {
  const T = window.THEME;
  const uid = app.uid;
  const [q, setQ] = useStateB('');

  const circleIds = app.group
    ? (app.group.memberUids || [])
    : [...new Set(app.groups.flatMap(g => g.memberUids || []))];
  const stackIds = [uid, ...circleIds.filter(id => id !== uid)].filter(id => app.members[id]);

  const gid = app.groupId;
  const myGroupIds = app.groups.map(g => g.id);
  let list = app.items.filter(it => {
    const okGroup = gid
      ? (Array.isArray(it.groups) && it.groups.includes(gid))
      : (it.ownerUid === uid || (Array.isArray(it.groups) && it.groups.some(g => myGroupIds.includes(g))));
    const okQ = !q || (it.name + ' ' + ownerLabel(it.ownerUid, uid)).toLowerCase().includes(q.toLowerCase());
    return okGroup && okQ;
  });
  // available first, then things that are out
  list = list.slice().sort((a, b) => (window.holderOf(a) ? 1 : 0) - (window.holderOf(b) ? 1 : 0));

  const add = () => app.openModal(app.group ? 'addToShelf' : 'newItem');

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: 'max(54px, calc(env(safe-area-inset-top, 0px) + 20px)) 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <window.GroupSwitcher app={app} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stackIds.length > 0 && <AvatarStack ids={stackIds} />}
            <button onClick={add} aria-label="Add" style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: T.accentGrad, color: T.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}><window.Icon name="plus" size={19} stroke={2.4} /></button>
          </div>
        </div>
        <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 30, color: T.ink, letterSpacing: -0.8, marginTop: 16 }}>
          {app.group ? app.group.name : 'Shelf'}
        </div>
        <div style={{ fontFamily: T.font, fontSize: 13.5, color: T.inkSoft, marginTop: 2 }}>
          {list.length} {list.length === 1 ? 'thing' : 'things'} · {stackIds.length} {stackIds.length === 1 ? 'member' : 'members'}
        </div>
      </div>

      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surfaceAlt, borderRadius: 13, padding: '10px 14px' }}>
          <window.Icon name="browse" size={18} color={T.inkFaint} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{
            border: 'none', outline: 'none', background: 'transparent', flex: 1, fontFamily: T.font, fontSize: 16, color: T.ink, minWidth: 0,
          }} />
          {q && <button onClick={() => setQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.inkFaint, display: 'flex' }}><window.Icon name="x" size={16} /></button>}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(it => <ItemRow key={it.id} app={app} it={it} />)}
      </div>

      {list.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 30px', fontFamily: T.font }}>
          <div style={{ fontSize: 15, color: T.inkFaint, marginBottom: 14, textWrap: 'pretty' }}>
            {q ? `Nothing matches “${q}”.` : app.group ? `Nothing in ${app.group.name} yet.` : 'Nothing on your shelf yet.'}
          </div>
          {!q && (
            <window.Btn variant="primary" onClick={add}><window.Icon name="plus" size={17} /> Add a thing</window.Btn>
          )}
          {!q && !app.group && app.groups.length === 0 && (
            <div style={{ fontSize: 13, color: T.inkFaint, marginTop: 18, lineHeight: 1.5 }}>To share with others, create a group in <b>You</b>.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ITEM DETAIL ────────────────────────────────────────────────
function ItemDetail({ app, item }) {
  const T = window.THEME;
  const uid = app.uid;
  const owner = window.MEMBERS[item.ownerUid];
  const isMine = item.ownerUid === uid;
  const holder = window.holderOf(item);
  const holderUser = holder ? window.MEMBERS[holder] : null;
  const since = window.fmtSince(item.takenAt);

  let action = null;
  if (holder === uid) {
    action = <window.Btn variant="dark" full size="lg" onClick={() => app.returnItem(item.id)}><window.Icon name="check" size={18} /> I returned it</window.Btn>;
  } else if (isMine && holder) {
    action = (
      <div style={{ display: 'flex', gap: 10 }}>
        <window.Btn variant="dark" full size="lg" onClick={() => app.returnItem(item.id)}><window.Icon name="check" size={18} /> Got it back</window.Btn>
        <window.Btn variant="ghost" size="lg" onClick={() => app.openModal('lendTo', item.id)}><window.Icon name="users" size={18} /></window.Btn>
      </div>
    );
  } else if (isMine && !holder) {
    action = <window.Btn variant="primary" full size="lg" onClick={() => app.openModal('lendTo', item.id)}><window.Icon name="hand" size={19} /> Lend to someone</window.Btn>;
  } else if (!isMine && !holder) {
    action = <window.Btn variant="primary" full size="lg" onClick={() => app.takeItem(item.id)}><window.Icon name="hand" size={19} /> I am borrowing it</window.Btn>;
  } else if (!isMine && holder) {
    action = <window.Btn variant="soft" full size="lg" disabled>With {holderUser ? holderUser.name : 'someone'}</window.Btn>;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, zIndex: 150, overflowY: 'auto', animation: 'screenIn .26s cubic-bezier(.16,1,.3,1) both' }}>
      <div style={{ position: 'relative', padding: '8px 8px 0' }}>
        <window.ItemThumb item={item} height={item.photoURL ? 420 : 200} radius={20} auto />
        <button onClick={app.closeItem} style={{
          position: 'absolute', top: 'max(52px, calc(env(safe-area-inset-top, 0px) + 14px))', left: 20, width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}><window.Icon name="back" size={20} color={T.ink} /></button>
        {isMine && (
          <button onClick={() => app.openModal('editItem', item.id)} style={{
            position: 'absolute', top: 'max(52px, calc(env(safe-area-inset-top, 0px) + 14px))', right: 20, height: 38, padding: '0 14px', borderRadius: 19,
            background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            fontFamily: T.font, fontWeight: 600, fontSize: 14, color: T.ink,
          }}><window.Icon name="edit" size={16} /> Edit</button>
        )}
      </div>

      <div style={{ padding: '20px 20px 150px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h1 style={{ fontFamily: T.font, fontWeight: 800, fontSize: 25, color: T.ink, letterSpacing: -0.6, margin: 0, lineHeight: 1.15 }}>{item.name}</h1>
          <div style={{ marginTop: 3 }}><window.StatusPill item={item} uid={uid} /></div>
        </div>
        {item.desc && <p style={{ fontFamily: T.font, fontSize: 15.5, lineHeight: 1.55, color: T.inkSoft, margin: '12px 0 0', textWrap: 'pretty' }}>{item.desc}</p>}

        <div style={{ marginTop: 20, background: T.surface, border: `1px solid ${T.lineSoft}`, borderRadius: 16, overflow: 'hidden' }}>
          {owner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
              <window.Avatar user={owner} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkFaint }}>Owner</div>
                <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.ink }}>{isMine ? 'You' : owner.full || owner.name}</div>
              </div>
            </div>
          )}
          {holderUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderTop: `1px solid ${T.lineSoft}` }}>
              <window.Avatar user={holderUser} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkFaint }}>Currently with{since ? ` · since ${since}` : ''}</div>
                <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.ink }}>{holder === uid ? 'You' : holderUser.full || holderUser.name}</div>
              </div>
            </div>
          )}
        </div>

        {isMine && app.groups.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <window.SectionLabel>Shared with</window.SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {app.groups.map(g => {
                const on = (item.groups || []).includes(g.id);
                return (
                  <button key={g.id} onClick={() => app.toggleItemGroup(item, g.id)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 999, cursor: 'pointer',
                    fontFamily: T.font, fontSize: 13.5, fontWeight: 600,
                    border: `1px solid ${on ? 'transparent' : T.line}`, background: on ? T.accentGrad : T.surface,
                    color: on ? T.onAccent : T.inkSoft, WebkitTapHighlightColor: 'transparent',
                  }}>
                    <window.Icon name={on ? 'check' : 'plus'} size={14} />
                    {g.name}
                  </button>
                );
              })}
            </div>
            {(!item.groups || item.groups.length === 0) && (
              <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkFaint, marginTop: 8 }}>Not in a group yet — only you can see it.</div>
            )}
          </div>
        )}
      </div>

      {action && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px max(30px, env(safe-area-inset-bottom))', background: `linear-gradient(to top, ${T.bg} 72%, transparent)` }}>
          {action}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { BrowseScreen, ItemDetail, AvatarStack, ownerLabel });
