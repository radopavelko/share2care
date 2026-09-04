// screens-groups.jsx — lightweight "groups" organising layer:
// a header switcher + sheets to create / join / manage groups.
// Groups are a filtering layer over the shared shelf (not a hard boundary yet).

const { useState: useStateGr, useRef: useRefGr } = React;

// ── Header pill that opens the group switcher ──────────────────
function GroupSwitcher({ app }) {
  const T = window.THEME;
  const label = app.group ? app.group.name : 'All things';
  return (
    <button onClick={() => app.openModal('groupSwitcher')} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 999,
      padding: '7px 12px', boxShadow: T.shadowSm, maxWidth: '100%',
      WebkitTapHighlightColor: 'transparent',
    }}>
      {app.group ? <window.GroupAvatar group={app.group} size={20} radius={6} /> : <window.Icon name="users" size={16} color={T.accentText} />}
      <span style={{
        fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150,
      }}>{label}</span>
      <window.Icon name="chevron" size={15} color={T.inkFaint} stroke={2.4} />
    </button>
  );
}

// ── Switcher sheet: pick a group, or create / join ─────────────
function GroupSwitcherSheet({ app }) {
  const T = window.THEME;
  const rows = [{ id: null, name: 'All things', sub: 'Your items + all your groups' }]
    .concat(app.groups.map(g => ({
      id: g.id, name: g.name, g,
      sub: `${(g.memberUids || []).length} ${(g.memberUids || []).length === 1 ? 'member' : 'members'}`,
    })));

  return (
    <window.Sheet open title="Your groups" onClose={app.closeModal}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {rows.map(r => {
          const active = (app.groupId || null) === r.id;
          return (
            <div key={r.id || 'all'} onClick={() => app.switchGroup(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              padding: '12px 14px', borderRadius: 16,
              border: `1px solid ${active ? 'transparent' : T.line}`,
              background: active ? T.accentSoft : T.surface,
            }}>
              {r.g ? <window.GroupAvatar group={r.g} size={38} /> : (
                <div style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: active ? T.accentGrad : T.surfaceAlt, color: active ? T.onAccent : T.inkSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <window.Icon name="box" size={19} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkSoft }}>{r.sub}</div>
              </div>
              {r.g && (
                <button onClick={e => { e.stopPropagation(); app.openModal('manageGroup', r.id); }} style={{
                  border: `1px solid ${T.line}`, background: T.surface, borderRadius: 10,
                  padding: '7px 11px', cursor: 'pointer', fontFamily: T.font,
                  fontSize: 12.5, fontWeight: 600, color: T.inkSoft, WebkitTapHighlightColor: 'transparent',
                }}>Manage</button>
              )}
              {active && !r.g && <window.Icon name="check" size={19} color={T.accentText} />}
            </div>
          );
        })}
      </div>

      <window.Btn variant="ghost" full onClick={() => app.openModal('joinGroup')}>
        <window.Icon name="link" size={18} /> Join a group
      </window.Btn>
      <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkFaint, textAlign: 'center', marginTop: 10 }}>
        Create new groups from the You tab.
      </div>
    </window.Sheet>
  );
}

// ── Add to shelf: something new, or share an existing item ─────
function AddToShelfSheet({ app }) {
  const T = window.THEME;
  const g = app.group;
  // your items that aren't in the current group yet
  const candidates = g
    ? app.items.filter(it => it.ownerUid === app.uid && !(it.groups || []).includes(g.id))
    : [];
  return (
    <window.Sheet open title={g ? `Add to ${g.name}` : 'Add to your shelf'} onClose={app.closeModal}>
      <window.Btn variant="primary" full size="lg" onClick={() => app.openModal('newItem')}>
        <window.Icon name="plus" size={19} /> Add something new
      </window.Btn>
      {g && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 9 }}>
            Or share one of your things
          </div>
          {candidates.length === 0 ? (
            <div style={{ fontFamily: T.font, fontSize: 13.5, color: T.inkFaint, padding: '12px 14px', background: T.surfaceAlt, borderRadius: 13, border: `1px dashed ${T.line}` }}>
              All your things are already in this group.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {candidates.map(it => (
                <ItemPickRow key={it.id} app={app} item={it} on={false}
                  onToggle={() => app.toggleItemGroup(it, g.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </window.Sheet>
  );
}

// A selectable row for one of the user's own items.
function ItemPickRow({ app, item, on, onToggle }) {
  const T = window.THEME;
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
      padding: 8, borderRadius: 13, cursor: 'pointer',
      border: `1px solid ${on ? 'transparent' : T.line}`, background: on ? T.accentSoft : T.surface,
      WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{ width: 40, flexShrink: 0 }}><window.ItemThumb item={item} height={40} radius={9} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 14.5, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontFamily: T.font, fontSize: 12, color: T.inkSoft }}>{(() => { const h = window.holderOf(item); if (!h) return 'Available'; const m = window.MEMBERS[h]; return h === app.uid ? 'With you' : `With ${m ? m.name : 'someone'}`; })()}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        border: `1.5px solid ${on ? 'transparent' : T.line}`, background: on ? T.ink : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{on && <window.Icon name="check" size={14} color="#fff" />}</div>
    </button>
  );
}

// ── Create a group ─────────────────────────────────────────────
function CreateGroupSheet({ app }) {
  const T = window.THEME;
  const [name, setName] = useStateGr('');
  const [sel, setSel] = useStateGr([]);
  const ready = name.trim().length > 0;
  const mine = app.items.filter(it => it.ownerUid === app.uid);
  const toggle = (id) => setSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <window.Sheet open title="Create a group" onClose={app.closeModal}>
      <div style={{ fontFamily: T.font, fontSize: 14, color: T.inkSoft, marginBottom: 16, textWrap: 'pretty' }}>
        Groups help you organise your shelf — like “Neighbours”, “Family”, or “Climbing crew”. You can invite people with a link or by email.
      </div>
      <window.Field label="Group name">
        <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Maple Street neighbours" style={window.inputStyle(T)} />
      </window.Field>

      <window.Field label={mine.length ? `Add your items${sel.length ? ` · ${sel.length} selected` : ''}` : 'Add your items'}>
        {mine.length === 0 ? (
          <div style={{ fontFamily: T.font, fontSize: 13.5, color: T.inkFaint, padding: '12px 14px', background: T.surfaceAlt, borderRadius: 13, border: `1px dashed ${T.line}` }}>
            You haven’t added any items yet. Create the group, then add things from the You tab.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mine.map(it => (
              <ItemPickRow key={it.id} app={app} item={it} on={sel.includes(it.id)} onToggle={() => toggle(it.id)} />
            ))}
          </div>
        )}
      </window.Field>

      <window.Btn variant="primary" full size="lg" disabled={!ready} onClick={() => app.createGroup(name, sel)}>
        <window.Icon name="users" size={18} /> Create group
      </window.Btn>
    </window.Sheet>
  );
}

// ── Join with a code ───────────────────────────────────────────
function JoinGroupSheet({ app }) {
  const T = window.THEME;
  const [code, setCode] = useStateGr('');
  const ready = code.trim().length >= 4;
  return (
    <window.Sheet open title="Join a group" onClose={app.closeModal}>
      <div style={{ fontFamily: T.font, fontSize: 14, color: T.inkSoft, marginBottom: 16, textWrap: 'pretty' }}>
        Have an invite link? Just open it and you’ll join automatically. Otherwise, type the group’s code below.
      </div>
      <window.Field label="Group code">
        <input autoFocus value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. K7P2QR" maxLength={8}
          style={{ ...window.inputStyle(T), letterSpacing: 3, fontFamily: T.font, textTransform: 'uppercase' }} />
      </window.Field>
      <window.Btn variant="primary" full size="lg" disabled={!ready} onClick={() => app.joinByCode(code)}>
        <window.Icon name="check" size={18} /> Join group
      </window.Btn>
    </window.Sheet>
  );
}

// ── Manage a group (invite link, code, email invites, members) ──
function ManageGroupSheet({ app }) {
  const T = window.THEME;
  const g = app.allGroups.find(x => x.id === app.modalArg);
  const [email, setEmail] = useStateGr('');
  const [nameDraft, setNameDraft] = useStateGr(null); // null = not editing
  if (!g) return null;
  const isOwner = g.ownerUid === app.uid;
  const saveName = async () => {
    if (nameDraft === null) return;
    if (nameDraft.trim() && nameDraft.trim() !== g.name) { if (await app.renameGroup(g.id, nameDraft)) setNameDraft(null); }
    else setNameDraft(null);
  };
  const link = app.inviteLink(g);
  const members = (g.memberUids || []);
  const invited = (g.invitedEmails || []);

  const copy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(link);
      else { const t = document.createElement('textarea'); t.value = link; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }
      app.toast('Invite link copied', 'check');
    } catch (e) { app.toast('Could not copy link', 'x'); }
  };

  const addEmail = async () => {
    const ok = await app.inviteEmail(g.id, email);
    if (ok) setEmail('');
  };

  const fileRef = useRefGr(null);
  const pickPhoto = (e) => { const f = e.target.files && e.target.files[0]; if (f) app.setGroupPhoto(g.id, f); e.target.value = ''; };

  return (
    <window.Sheet open title={isOwner ? undefined : g.name} onClose={app.closeModal}>
      {isOwner && (
        nameDraft === null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0, fontFamily: T.font, fontWeight: 700, fontSize: 20, color: T.ink, letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
            <button onClick={() => setNameDraft(g.name)} aria-label="Rename group" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${T.line}`, background: T.surface, borderRadius: 10,
              padding: '7px 11px', cursor: 'pointer', fontFamily: T.font, fontSize: 12.5, fontWeight: 600, color: T.inkSoft, WebkitTapHighlightColor: 'transparent',
            }}><window.Icon name="edit" size={14} /> Rename</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setNameDraft(null); }}
              style={{ ...window.inputStyle(T), flex: 1, fontWeight: 700, fontSize: 18 }} />
            <window.Btn variant="dark" onClick={saveName}>Save</window.Btn>
          </div>
        )
      )}
      {/* Group picture: colour, or an uploaded photo (owner only) */}
      {isOwner && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 8 }}>Picture</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <window.GroupAvatar group={g} size={44} />
            <div style={{ display: 'flex', gap: 10 }}>
              {window.GROUP_COLORS.map(c => {
                const on = g.color === c.bg;
                return (
                  <button key={c.bg} aria-label={c.name} onClick={() => app.setGroupColor(g.id, on ? '' : c.bg)} style={{
                    width: 34, height: 34, borderRadius: '50%', background: c.bg, cursor: 'pointer', padding: 0,
                    border: `2px solid ${T.surface}`, boxShadow: on ? `0 0 0 2px ${T.ink}` : `0 0 0 1px ${T.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent',
                  }}>{on && <window.Icon name="check" size={16} color={c.fg} stroke={2.6} />}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
            <window.Btn variant="ghost" size="sm" onClick={() => fileRef.current && fileRef.current.click()}>
              <window.Icon name="camera" size={15} /> {g.photoURL ? 'Change photo' : 'Use a photo'}
            </window.Btn>
            {g.photoURL && <window.Btn variant="soft" size="sm" onClick={() => app.removeGroupPhoto(g.id)}>Remove photo</window.Btn>}
          </div>
          {g.photoURL && <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkFaint, marginTop: 8 }}>The photo is shown instead of the colour.</div>}
        </div>
      )}

      {/* Invite link */}
      <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 8 }}>Invite link</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{
          flex: 1, minWidth: 0, background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: 12,
          padding: '11px 13px', fontFamily: T.font, fontSize: 12.5, color: T.inkSoft,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{link}</div>
        <window.Btn variant="soft" onClick={copy}><window.Icon name="copy" size={17} /> Copy</window.Btn>
      </div>

      {/* Code */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontFamily: T.font, fontSize: 13.5, color: T.inkSoft }}>Or share the code</span>
        <span style={{ fontFamily: T.font, fontSize: 15, fontWeight: 500, letterSpacing: 2, color: T.accentText, background: T.accentSoft, padding: '4px 10px', borderRadius: 8 }}>{g.code}</span>
      </div>

      {/* Email invites (owner only) */}
      {isOwner && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 8 }}>Invite by email</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: invited.length ? 12 : 0 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addEmail(); }}
              placeholder="name@email.com" inputMode="email" style={{ ...window.inputStyle(T), flex: 1 }} />
            <window.Btn variant="primary" onClick={addEmail}><window.Icon name="mail" size={17} /></window.Btn>
          </div>
          {invited.map(em => (
            <div key={em} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
              <window.Icon name="mail" size={16} color={T.inkFaint} />
              <span style={{ flex: 1, minWidth: 0, fontFamily: T.font, fontSize: 14, color: T.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{em}</span>
              <span style={{ fontFamily: T.font, fontSize: 12, color: T.inkFaint }}>pending</span>
              <button onClick={() => app.removeInvite(g.id, em)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.inkFaint, display: 'flex', padding: 4 }}>
                <window.Icon name="trash" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Your items in this group */}
      {(() => {
        const mine = app.items.filter(it => it.ownerUid === app.uid);
        if (!mine.length) return null;
        const inCount = mine.filter(it => (it.groups || []).includes(g.id)).length;
        return (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 9 }}>
              Your items in this group{inCount ? ` · ${inCount}` : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mine.map(it => (
                <ItemPickRow key={it.id} app={app} item={it}
                  on={(it.groups || []).includes(g.id)}
                  onToggle={() => app.toggleItemGroup(it, g.id)} />
              ))}
            </div>
          </div>
        );
      })()}

      {/* Members */}
      <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 10 }}>
        Members · {members.length}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
        {members.map(id => {
          const m = window.MEMBERS[id];
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <window.Avatar user={id} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 14.5, color: T.ink }}>
                  {id === app.uid ? 'You' : (m ? m.full || m.name : 'Member')}
                </div>
              </div>
              {id === g.ownerUid && <span style={{ fontFamily: T.font, fontSize: 12, fontWeight: 600, color: T.accentText, background: T.accentSoft, padding: '3px 9px', borderRadius: 999 }}>Admin</span>}
            </div>
          );
        })}
      </div>
      {isOwner && (
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <button onClick={() => app.deleteGroup(g.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.over, padding: 8 }}>
            Delete group
          </button>
        </div>
      )}
    </window.Sheet>
  );
}

// ── Router: renders whichever group sheet is open ──────────────
function GroupSheets({ app }) {
  switch (app.modal) {
    case 'groupSwitcher': return <GroupSwitcherSheet app={app} />;
    case 'createGroup':   return <CreateGroupSheet app={app} />;
    case 'joinGroup':     return <JoinGroupSheet app={app} />;
    case 'manageGroup':   return <ManageGroupSheet app={app} />;
    case 'addToShelf':    return <AddToShelfSheet app={app} />;
    default: return null;
  }
}

Object.assign(window, { GroupSwitcher, GroupSheets });
