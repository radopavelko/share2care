// screens-groups.jsx — group switcher, create group, manage members, Lend (share your things)

const { useState: useStateG } = React;

function CheckDot({ on }) {
  const T = window.THEME;
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
      border: on ? 'none' : `2px solid ${T.line}`, background: on ? T.accent : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {on && <window.Icon name="check" size={15} color="#fff" stroke={3} />}
    </div>
  );
}

function groupCount(app, gid) {
  return app.items.filter(it => (it.groups || []).includes(gid)).length;
}

// ── MEMBER PICKER (reused) ─────────────────────────────────────
function MemberPicker({ candidates, selected, onToggle, onInvite }) {
  const T = window.THEME;
  const [name, setName] = useStateG('');
  const invite = () => { const n = name.trim(); if (n) { onInvite(n); setName(''); } };
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
        {candidates.map(m => {
          const on = selected.includes(m.id);
          return (
            <button key={m.id} onClick={() => onToggle(m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px',
              border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
            }}>
              <window.Avatar user={m} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{m.full}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft }}>{m.unit}</div>
              </div>
              <CheckDot on={on} />
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') invite(); }}
          placeholder="Invite someone by name…" style={{ ...window.inputStyle(T), flex: 1 }} />
        <window.Btn variant="soft" size="md" onClick={invite}>Invite</window.Btn>
      </div>
    </div>
  );
}

// ── GROUP SWITCHER ─────────────────────────────────────────────
function GroupSwitcherSheet({ app }) {
  const T = window.THEME;
  return (
    <window.Sheet open={app.modal === 'switcher'} onClose={app.closeModal} title="Your groups">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {app.groups.map(g => {
          const active = g.id === app.group.id;
          const others = g.members.filter(m => m !== 'u1');
          return (
            <div key={g.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16,
              border: `1.5px solid ${active ? T.accent : T.lineSoft}`, background: active ? T.accentSoft : T.surface,
            }}>
              <button onClick={() => app.switchGroup(g.id)} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <window.AvatarStack ids={others} size={32} max={3} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 16, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft }}>{g.members.length} members · {groupCount(app, g.id)} items</div>
                </div>
                {active && <CheckDot on />}
              </button>
              <button onClick={() => app.openManage(g.id)} title="Manage" style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0, cursor: 'pointer',
                border: `1.5px solid ${T.line}`, background: T.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><window.Icon name="user" size={18} color={T.inkSoft} /></button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <window.Btn variant="primary" full size="lg" onClick={() => app.openModal('createGroup')}>
          <window.Icon name="plus" size={19} /> Create a new group
        </window.Btn>
      </div>
    </window.Sheet>
  );
}

// ── CREATE GROUP ───────────────────────────────────────────────
function CreateGroupSheet({ app }) {
  const T = window.THEME;
  const [name, setName] = useStateG('');
  const [sel, setSel] = useStateG([]);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const create = () => { if (name.trim()) app.createGroup(name.trim(), sel); };

  return (
    <window.Sheet open={app.modal === 'createGroup'} onClose={app.closeModal} title="New group">
      <window.Field label="Group name">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Garden Street, Book Club…" style={window.inputStyle(T)} autoFocus />
      </window.Field>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 4 }}>Who’s in it?</div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft, marginBottom: 12 }}>You’ll be added automatically. {sel.length > 0 ? `${sel.length} selected.` : ''}</div>
      <MemberPicker candidates={app.contacts} selected={sel} onToggle={toggle}
        onInvite={n => { const id = app.inviteMember(n); setSel(s => [...s, id]); }} />
      <div style={{ marginTop: 20 }}>
        <window.Btn variant="primary" full size="lg" disabled={!name.trim()} onClick={create}>
          Create group{sel.length ? ` · ${sel.length + 1} members` : ''}
        </window.Btn>
      </div>
    </window.Sheet>
  );
}

// ── MANAGE GROUP (members) ─────────────────────────────────────
function ManageGroupSheet({ app }) {
  const T = window.THEME;
  const g = app.groups.find(x => x.id === app.manageGroupId);
  const [sel, setSel] = useStateG([]);
  if (!g) return null;
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const candidates = app.contacts.filter(m => !g.members.includes(m.id));
  const memberList = g.members.map(id => window.MEMBERS[id]).filter(Boolean);

  return (
    <window.Sheet open={app.modal === 'manageGroup'} onClose={app.closeModal} title={g.name}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11.5, letterSpacing: 0.4, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 10 }}>{g.members.length} members</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
        {memberList.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 4px' }}>
            <window.Avatar user={m} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{m.full}{m.you ? ' (You)' : ''}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft }}>{m.unit}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: T.lineSoft, margin: '14px 0' }} />
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: T.ink, marginBottom: 12 }}>Add members</div>
      {candidates.length === 0 ? (
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.inkFaint, marginBottom: 8 }}>Everyone you know is already in this group. Invite someone new below.</div>
      ) : null}
      <MemberPicker candidates={candidates} selected={sel} onToggle={toggle}
        onInvite={n => { const id = app.inviteMember(n); setSel(s => [...s, id]); }} />
      <div style={{ marginTop: 20 }}>
        {sel.length > 0
          ? <window.Btn variant="primary" full size="lg" onClick={() => { app.addMembers(g.id, sel); setSel([]); }}>Add {sel.length} to {g.name}</window.Btn>
          : <window.Btn variant="ghost" full size="lg" onClick={app.closeModal}>Done</window.Btn>}
      </div>
    </window.Sheet>
  );
}

// ── LEND — share your things into the current group ────────────
function LendScreen({ app }) {
  const T = window.THEME;
  const g = app.group;
  const mine = app.items.filter(it => it.owner === 'u1');
  const onShelf = mine.filter(it => (it.groups || []).includes(g.id));
  const off = mine.filter(it => !(it.groups || []).includes(g.id));

  const Row = ({ it }) => {
    const inG = (it.groups || []).includes(g.id);
    return (
      <window.Card style={{ padding: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 50, flexShrink: 0 }}><window.ItemThumb item={it} height={50} radius={11} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{it.name}</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft, marginTop: 1 }}>
              {it.cat}{(it.groups || []).length ? ` · on ${(it.groups || []).length} ${(it.groups || []).length === 1 ? 'shelf' : 'shelves'}` : ''}
            </div>
          </div>
          {inG
            ? <window.Btn variant="soft" size="sm" onClick={() => app.unshareItem(it.id, g.id)}><window.Icon name="check" size={16} /> On shelf</window.Btn>
            : <window.Btn variant="primary" size="sm" onClick={() => app.shareItem(it.id, g.id)}><window.Icon name="plus" size={16} /> Add</window.Btn>}
        </div>
      </window.Card>
    );
  };

  return (
    <div style={{ paddingBottom: 130 }}>
      <div style={{ padding: '54px 20px 4px' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: 0.6, color: T.accent, textTransform: 'uppercase' }}>Lend to {g.name}</div>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 30, color: T.ink, letterSpacing: -0.5, marginTop: 3 }}>Your things</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14.5, color: T.inkSoft, marginTop: 6, textWrap: 'pretty' }}>Add things you own to {g.name}’s shelf. The same item can sit on several groups’ shelves.</div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <window.Btn variant="ghost" full size="lg" onClick={() => app.openModal('newItem')} style={{ marginBottom: 22, borderStyle: 'dashed' }}>
          <window.Icon name="plus" size={19} /> Add a new thing you own
        </window.Btn>

        {off.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 10 }}>Not on this shelf</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {off.map(it => <Row key={it.id} it={it} />)}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 10 }}>On {g.name} · {onShelf.length}</div>
          {onShelf.length === 0 ? (
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.inkFaint, padding: '14px 16px', background: T.surfaceAlt, borderRadius: 14, border: `1px dashed ${T.line}` }}>Nothing of yours here yet — add something above.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {onShelf.map(it => <Row key={it.id} it={it} />)}
            </div>
          )}
        </div>
      </div>

      <NewItemSheet app={app} />
    </div>
  );
}

// ── NEW ITEM form (sheet) ──────────────────────────────────────
function NewItemSheet({ app }) {
  const T = window.THEME;
  const [name, setName] = useStateG('');
  const [cat, setCat] = useStateG('');
  const [cond, setCond] = useStateG('Good');
  const [desc, setDesc] = useStateG('');
  const [photo, setPhoto] = useStateG(false);
  const conds = ['Like new', 'Good', 'Well-loved'];
  const ready = name.trim() && cat;
  const previewItem = { name: name || 'Your item', cat: cat || 'Home', cond, img: window.flickr(window.slugKeyword(name || cat || 'object'), 7) };

  const submit = () => {
    app.addItem({ name: name.trim(), cat, cond, desc: desc.trim() || 'Ask me anything about it!' });
    setName(''); setCat(''); setCond('Good'); setDesc(''); setPhoto(false);
  };

  return (
    <window.Sheet open={app.modal === 'newItem'} onClose={app.closeModal} title={`Add to ${app.group.name}`}>
      <button onClick={() => setPhoto(p => !p)} style={{ width: '100%', border: 'none', background: 'none', padding: 0, cursor: 'pointer', marginBottom: 18 }}>
        {photo ? (
          <div style={{ position: 'relative' }}>
            <window.ItemThumb item={previewItem} height={130} radius={16} />
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '6px 11px', fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, fontWeight: 600, color: T.inkSoft }}>Photo added ✓</div>
          </div>
        ) : (
          <div style={{ height: 120, borderRadius: 16, border: `1.5px dashed ${T.line}`, background: T.surfaceAlt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: T.inkFaint }}>
            <window.Icon name="camera" size={26} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>Add a photo</span>
          </div>
        )}
      </button>

      <window.Field label="What is it?">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cordless drill" style={window.inputStyle(T)} />
      </window.Field>

      <window.Field label="Category">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {window.CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '9px 13px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, fontWeight: 600,
              border: `1.5px solid ${cat === c ? T.accent : T.line}`,
              background: cat === c ? T.accent : T.surface, color: cat === c ? '#fff' : T.inkSoft,
              transition: 'all .14s ease',
            }}>{c}</button>
          ))}
        </div>
      </window.Field>

      <window.Field label="Condition">
        <div style={{ display: 'flex', gap: 8 }}>
          {conds.map(c => (
            <button key={c} onClick={() => setCond(c)} style={{
              flex: 1, padding: '11px 8px', borderRadius: 13, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, fontWeight: 600,
              border: `1.5px solid ${cond === c ? T.accent : T.line}`,
              background: cond === c ? T.accentSoft : T.surface, color: cond === c ? T.accentDeep : T.inkSoft,
              transition: 'all .14s ease',
            }}>{c}</button>
          ))}
        </div>
      </window.Field>

      <window.Field label="Anything to know? (optional)">
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Accessories, quirks, pickup notes…" style={{ ...window.inputStyle(T), resize: 'none' }} />
      </window.Field>

      <window.Btn variant="primary" full size="lg" disabled={!ready} onClick={submit}>
        <window.Icon name="plus" size={19} /> Put on {app.group.name}’s shelf
      </window.Btn>
    </window.Sheet>
  );
}

Object.assign(window, { GroupSwitcherSheet, CreateGroupSheet, ManageGroupSheet, LendScreen });
