// screens-lend.jsx — add / edit an item (photo, name, note, groups).

const { useState: useStateG, useRef: useRefG } = React;

// Shared form used by both the add and edit sheets.
function ItemForm({ app, item, onSubmit, submitLabel }) {
  const T = window.THEME;
  const [name, setName] = useStateG(item ? item.name : '');
  const [desc, setDesc] = useStateG(item ? (item.desc || '') : '');
  const [gsel, setGsel] = useStateG(() => item ? (item.groups || []) : (app.groupId ? [app.groupId] : []));
  const [file, setFile] = useStateG(null);
  const [preview, setPreview] = useStateG('');
  const [busy, setBusy] = useStateG(false);
  const fileRef = useRefG(null);
  const ready = name.trim() && !busy;
  const previewItem = { name, photoURL: preview || (item ? item.photoURL : '') };

  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setPreview(URL.createObjectURL(f));
  };
  const toggleG = (id) => setGsel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const submit = async () => {
    setBusy(true);
    await onSubmit({ name: name.trim(), desc: desc.trim(), file, groups: gsel });
    if (preview) URL.revokeObjectURL(preview);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
      <button onClick={() => fileRef.current && fileRef.current.click()} style={{ width: '100%', border: 'none', background: 'none', padding: 0, cursor: 'pointer', marginBottom: 18 }}>
        <div style={{ position: 'relative' }}>
          <window.ItemThumb item={previewItem} height={150} radius={16} />
          <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '6px 11px', fontFamily: T.font, fontSize: 12.5, fontWeight: 600, color: T.ink }}>
            <window.Icon name="camera" size={14} /> {previewItem.photoURL ? 'Change photo' : 'Add photo'}
          </div>
        </div>
      </button>

      <window.Field label="Name">
        <input autoFocus={!item} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cordless drill" style={window.inputStyle(T)} />
      </window.Field>

      <window.Field label="Note (optional)">
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Accessories, quirks, pickup notes…" style={{ ...window.inputStyle(T), resize: 'none' }} />
      </window.Field>

      {app.groups.length > 0 && (
        <window.Field label="Share with">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {app.groups.map(g => {
              const on = gsel.includes(g.id);
              return (
                <button key={g.id} onClick={() => toggleG(g.id)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 999, cursor: 'pointer',
                  fontFamily: T.font, fontSize: 13.5, fontWeight: 600,
                  border: `1px solid ${on ? 'transparent' : T.line}`, background: on ? T.accentGrad : T.surface,
                  color: on ? T.onAccent : T.inkSoft, WebkitTapHighlightColor: 'transparent',
                }}>
                  <window.Icon name={on ? 'check' : 'users'} size={14} /> {g.name}
                </button>
              );
            })}
          </div>
          <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkFaint, marginTop: 8 }}>
            {gsel.length ? 'Members of those groups can see and borrow it.' : 'Not shared — only you will see it.'}
          </div>
        </window.Field>
      )}

      <window.Btn variant="primary" full size="lg" disabled={!ready} onClick={submit}>
        {busy ? 'Saving…' : submitLabel}
      </window.Btn>
    </div>
  );
}

function NewItemSheet({ app }) {
  if (app.modal !== 'newItem') return null;
  return (
    <window.Sheet open title="Add a thing" onClose={app.closeModal}>
      <ItemForm app={app} onSubmit={app.addItem} submitLabel="Add to shelf" />
    </window.Sheet>
  );
}

function EditItemSheet({ app }) {
  if (app.modal !== 'editItem') return null;
  const item = app.items.find(i => i.id === app.modalArg);
  if (!item || item.ownerUid !== app.uid) return null;
  return (
    <window.Sheet open title="Edit" onClose={app.closeModal}>
      <ItemForm key={item.id} app={app} item={item} onSubmit={(d) => app.editItem(item.id, d)} submitLabel="Save" />
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <button onClick={() => app.deleteItem(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: window.THEME.font, fontSize: 14, fontWeight: 600, color: window.THEME.over, padding: 8 }}>
          Remove this thing
        </button>
      </div>
    </window.Sheet>
  );
}

// Owner picks who has the item (from the members of the groups it's shared
// with), or marks it home.
function LendToSheet({ app }) {
  if (app.modal !== 'lendTo') return null;
  const T = window.THEME;
  const item = app.items.find(i => i.id === app.modalArg);
  if (!item || item.ownerUid !== app.uid) return null;
  const holder = window.holderOf(item);

  const gids = item.groups || [];
  const pool = gids.length ? app.allGroups.filter(g => gids.includes(g.id)) : app.groups;
  const ids = [...new Set(pool.flatMap(g => g.memberUids || []))].filter(id => id !== app.uid && app.members[id]);

  const Row = ({ id, name, sub, on, onClick, avatar }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 14, cursor: 'pointer',
      border: `1px solid ${on ? 'transparent' : T.line}`, background: on ? T.accentSoft : T.surface, WebkitTapHighlightColor: 'transparent',
    }}>
      {avatar}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.ink }}>{name}</div>
        {sub && <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkSoft }}>{sub}</div>}
      </div>
      {on && <window.Icon name="check" size={18} color={T.accentText} />}
    </button>
  );

  return (
    <window.Sheet open title="Who has it?" onClose={app.closeModal}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Row name="Nobody — it’s home" sub="Mark as returned" on={!holder} onClick={() => app.returnItem(item.id)}
          avatar={<div style={{ width: 36, height: 36, borderRadius: '50%', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Icon name="box" size={18} color={T.inkSoft} /></div>} />
        {ids.map(id => {
          const m = app.members[id];
          return <Row key={id} name={m.full || m.name} sub={holder === id ? `Has it${window.fmtSince(item.takenAt) ? ' · since ' + window.fmtSince(item.takenAt) : ''}` : null}
            on={holder === id} onClick={() => app.lendTo(item.id, id)} avatar={<window.Avatar user={id} size={36} />} />;
        })}
      </div>
      {ids.length === 0 && (
        <div style={{ fontFamily: T.font, fontSize: 13.5, color: T.inkFaint, marginTop: 12, lineHeight: 1.5, textWrap: 'pretty' }}>
          {gids.length ? 'No other members in this item’s groups yet.' : 'Share this item with a group to pick from its members.'}
        </div>
      )}
    </window.Sheet>
  );
}

Object.assign(window, { NewItemSheet, EditItemSheet, LendToSheet });
