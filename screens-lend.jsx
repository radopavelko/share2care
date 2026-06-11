// screens-lend.jsx — Lend (your things) + New item form with real photo upload

const { useState: useStateG, useRef: useRefG } = React;

// Short, readable list of the group names an item is shared with.
function groupNames(app, ids) {
  if (!ids || !ids.length) return '';
  const names = ids.map(id => { const g = app.groups.find(x => x.id === id); return g ? g.name : null; }).filter(Boolean);
  if (!names.length) return '';
  return names.length <= 2 ? names.join(', ') : `${names[0]} +${names.length - 1}`;
}

// ── LEND — your shelf (everything you add is visible to your circle) ──
function LendScreen({ app }) {
  const T = window.THEME;
  const uid = app.uid;
  const mine = app.items.filter(it => it.ownerUid === uid);

  return (
    <div style={{ paddingBottom: 130 }}>
      <div style={{ padding: '54px 20px 4px' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: 0.6, color: T.accent, textTransform: 'uppercase' }}>Lend to your circle</div>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 30, color: T.ink, letterSpacing: -0.5, marginTop: 3 }}>Your things</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14.5, color: T.inkSoft, marginTop: 6, textWrap: 'pretty' }}>Add things you own, then share them with your groups so people can ask to borrow them.</div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <window.Btn variant="ghost" full size="lg" onClick={() => app.openModal('newItem')} style={{ marginBottom: 22, borderStyle: 'dashed' }}>
          <window.Icon name="plus" size={19} /> Add a new thing you own
        </window.Btn>

        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: T.inkSoft, marginBottom: 10 }}>On your shelf · {mine.length}</div>
          {mine.length === 0 ? (
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.inkFaint, padding: '14px 16px', background: T.surfaceAlt, borderRadius: 14, border: `1px dashed ${T.line}` }}>Nothing here yet — add something above.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mine.map(it => (
                <window.Card key={it.id} onClick={() => app.openItem(it.id)} style={{ padding: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 50, flexShrink: 0 }}><window.ItemThumb item={it} height={50} radius={11} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{it.name}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft, marginTop: 1 }}>
                        {window.normCat(it.cat)}{groupNames(app, it.groups) ? ' · ' + groupNames(app, it.groups) : ''}
                      </div>
                    </div>
                    <window.StatusBadge status={it.status} due={it.due} small />
                  </div>
                </window.Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── NEW ITEM form (sheet) with real photo upload ───────────────
function NewItemSheet({ app }) {
  const T = window.THEME;
  const [name, setName] = useStateG('');
  const [cat, setCat] = useStateG('');
  const [cond, setCond] = useStateG('Good');
  const [desc, setDesc] = useStateG('');
  const [file, setFile] = useStateG(null);
  const [preview, setPreview] = useStateG('');
  const [busy, setBusy] = useStateG(false);
  const [gsel, setGsel] = useStateG(() => (app.groupId ? [app.groupId] : []));
  const fileRef = useRefG(null);
  const ready = name.trim() && cat && !busy;
  const previewItem = { name: name || 'Your item', cat: cat || 'Home', cond, photoURL: preview };

  const reset = () => {
    setName(''); setCat(''); setCond('Good'); setDesc(''); setBusy(false);
    setGsel(app.groupId ? [app.groupId] : []);
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleG = (id) => setGsel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setBusy(true);
    await app.addItem({ name: name.trim(), cat, cond, desc: desc.trim() || 'Ask me anything about it!', file, groups: gsel });
    reset();
  };

  return (
    <window.Sheet open={app.modal === 'newItem'} onClose={() => { reset(); app.closeModal(); }} title="Add to your shelf">
      <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
      <button onClick={() => fileRef.current && fileRef.current.click()} style={{ width: '100%', border: 'none', background: 'none', padding: 0, cursor: 'pointer', marginBottom: 18 }}>
        {preview ? (
          <div style={{ position: 'relative' }}>
            <window.ItemThumb item={previewItem} height={150} radius={16} />
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: '6px 11px', fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, fontWeight: 600, color: T.inkSoft }}>Change photo</div>
          </div>
        ) : (
          <div style={{ height: 120, borderRadius: 16, border: `1.5px dashed ${T.line}`, background: T.surfaceAlt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: T.inkFaint }}>
            <window.Icon name="camera" size={26} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>Add a photo (optional)</span>
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

      <window.Field label="Anything to know? (optional)">
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Accessories, quirks, pickup notes…" style={{ ...window.inputStyle(T), resize: 'none' }} />
      </window.Field>

      {app.groups.length > 0 && (
        <window.Field label="Share with (optional)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {app.groups.map(g => {
              const on = gsel.includes(g.id);
              return (
                <button key={g.id} onClick={() => toggleG(g.id)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 999, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, fontWeight: 600,
                  border: `1.5px solid ${on ? T.accent : T.line}`,
                  background: on ? T.accent : T.surface, color: on ? '#fff' : T.inkSoft, transition: 'all .14s ease',
                }}>
                  <window.Icon name="users" size={14} color={on ? '#fff' : T.inkFaint} /> {g.name}
                </button>
              );
            })}
          </div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkFaint, marginTop: 8 }}>
            {gsel.length ? 'Visible to those groups.' : 'Not in a group — only you will see it.'}
          </div>
        </window.Field>
      )}

      <window.Btn variant="primary" full size="lg" disabled={!ready} onClick={submit}>
        <window.Icon name="plus" size={19} /> {busy ? 'Adding…' : 'Put on your shelf'}
      </window.Btn>
    </window.Sheet>
  );
}

Object.assign(window, { LendScreen, NewItemSheet });
