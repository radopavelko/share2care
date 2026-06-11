// screens-browse.jsx — Shelf (browse) + Item detail + borrow sheet + form helpers

const { useState: useStateB } = React;

function ownerLabel(id, uid) {
  const u = window.MEMBERS[id];
  if (!u) return '';
  return id === uid ? 'You' : u.name;
}

function AvatarStack({ ids, size = 30, max = 4 }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  const T = window.THEME;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((id, i) => (
        <div key={id} style={{ marginLeft: i ? -10 : 0 }}><window.Avatar user={id} size={size} ring /></div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -10, width: size, height: size, borderRadius: '50%',
          background: T.surface, border: `2px solid ${T.surface}`, boxShadow: `0 0 0 1px ${T.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'DM Sans, sans-serif', fontSize: size * 0.34, fontWeight: 700, color: T.inkSoft,
        }}>+{extra}</div>
      )}
    </div>
  );
}

// First-run guidance shown when the shelf is empty: three clear steps and the
// two actions that matter (add a thing, create a group).
function GetStartedCard({ app }) {
  const T = window.THEME;
  const steps = [
    { icon: 'box', title: 'Add something you own', sub: 'A drill, a tent, a board game — anything worth sharing.' },
    { icon: 'users', title: 'Create a group', sub: 'From the You tab — then invite people with a link or their email.' },
    { icon: 'swap', title: 'Borrow each other’s things', sub: 'Ask, lend, and return — all in one place.' },
  ];
  return (
    <div style={{ padding: '14px 20px 0' }}>
      <window.Card style={{ padding: '22px 20px' }}>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 21, color: T.ink, letterSpacing: -0.3 }}>Get started</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.inkSoft, marginTop: 4, marginBottom: 18 }}>Three steps and you’re sharing.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 20 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: T.accentSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><window.Icon name={s.icon} size={18} color={T.accentDeep} /></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14.5, color: T.ink }}>{s.title}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.inkSoft, marginTop: 1, lineHeight: 1.45, textWrap: 'pretty' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <window.Btn variant="primary" full onClick={() => app.openModal('newItem')}>
          <window.Icon name="plus" size={18} /> Add your first thing
        </window.Btn>
      </window.Card>
    </div>
  );
}

// ── BROWSE / SHELF ─────────────────────────────────────────────
function BrowseScreen({ app }) {
  const T = window.THEME;
  const uid = app.uid;
  const [q, setQ] = useStateB('');
  const [cat, setCat] = useStateB('All');
  const incoming = app.requests.filter(r => r.toUid === uid && r.status === 'pending');

  // Members to show in the header avatar stack: the current group's members, or
  // on "All things" everyone across the groups you belong to — with you always
  // first so your own icon (same Google photo as the You tab) leads the row.
  const circleIds = app.group
    ? (app.group.memberUids || [])
    : [...new Set(app.groups.flatMap(g => g.memberUids || []))];
  const stackIds = [uid, ...circleIds.filter(id => id !== uid)].filter(id => app.members[id]);
  const cats = ['All', ...window.CATEGORIES];
  const gid = app.groupId;
  const myGroupIds = app.groups.map(g => g.id);
  let list = app.items.filter(it => {
    // A selected group shows ONLY items explicitly shared with it. "All things"
    // shows your own items plus items shared into any group you belong to —
    // never items from people outside your groups.
    const okGroup = gid
      ? (Array.isArray(it.groups) && it.groups.includes(gid))
      : (it.ownerUid === uid || (Array.isArray(it.groups) && it.groups.some(g => myGroupIds.includes(g))));
    const okCat = cat === 'All' || window.normCat(it.cat) === cat;
    const okQ = !q || (it.name + ' ' + window.normCat(it.cat) + ' ' + ownerLabel(it.ownerUid, uid)).toLowerCase().includes(q.toLowerCase());
    return okGroup && okCat && okQ;
  });
  const rank = { available: 0, pending: 1, out: 2 };
  list = list.slice().sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3));

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '46px 20px 6px' }}>
        <div style={{ marginBottom: 12 }}>
          <window.GroupSwitcher app={app} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 28, color: T.ink, letterSpacing: -0.5, lineHeight: 1.05 }}>{app.group ? app.group.name : 'The shelf'}</span>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, color: T.inkSoft, marginTop: 3 }}>{stackIds.length} {stackIds.length === 1 ? 'member' : 'members'} · {list.length} {list.length === 1 ? 'thing' : 'things'}</div>
          </div>
          {/* All members of the current group, you first (matches the You tab). */}
          {stackIds.length > 0 && <AvatarStack ids={stackIds} size={36} max={5} />}
        </div>
      </div>

      <div style={{ padding: '12px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: '11px 14px', boxShadow: T.shadowSm }}>
          <window.Icon name="browse" size={19} color={T.inkFaint} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the shelf…" style={{
            border: 'none', outline: 'none', background: 'transparent', flex: 1,
            fontFamily: 'DM Sans, sans-serif', fontSize: 15.5, color: T.ink, minWidth: 0,
          }} />
          {q && <button onClick={() => setQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.inkFaint, display: 'flex' }}><window.Icon name="x" size={17} /></button>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '6px 20px 10px', scrollbarWidth: 'none' }} className="no-sb">
        {cats.map(c => {
          const meta = window.CAT_META[c];
          const accent = (meta && meta.chip) || T.accent;
          const on = cat === c;
          return (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 999,
              fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${on ? accent : T.line}`,
              background: on ? accent : T.surface,
              color: on ? '#fff' : T.inkSoft, whiteSpace: 'nowrap',
              transition: 'all .14s ease',
            }}>
              {meta && meta.icon && <window.Icon name={meta.icon} size={14} color={on ? '#fff' : accent} />}
              {c}
            </button>
          );
        })}
      </div>

      {incoming.length > 0 && (
        <div style={{ padding: '4px 20px 8px' }}>
          <div onClick={() => app.goTab('borrows')} style={{
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            background: T.accentSoft, borderRadius: 16, padding: '12px 14px',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <window.Icon name="bell" size={19} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14.5, color: T.accentDeep }}>{incoming.length} {incoming.length === 1 ? 'request' : 'requests'} for your things</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.accentDeep, opacity: 0.8 }}>Tap to review in My Loans</div>
            </div>
            <window.Icon name="chevron" size={18} color={T.accentDeep} />
          </div>
        </div>
      )}

      <div style={{ padding: '6px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {list.map(it => (
          <window.Card key={it.id} onClick={() => app.openItem(it.id)} style={{ borderRadius: 18 }}>
            <div style={{ padding: 7 }}>
              <window.ItemThumb item={it} height={112} radius={13} />
            </div>
            <div style={{ padding: '2px 11px 13px' }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink, lineHeight: 1.2, marginBottom: 7, textWrap: 'pretty' }}>{it.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
                <window.Avatar user={it.ownerUid} size={18} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft }}>{ownerLabel(it.ownerUid, uid)}</span>
              </div>
              <window.StatusBadge status={it.status} due={it.due} small />
            </div>
          </window.Card>
        ))}
        {/* Add tile: in a group, choose new vs. one of your existing things;
            on "All things", go straight to the new-item form. */}
        {!q && list.length > 0 && (
          <button
            onClick={() => app.openModal(app.group ? 'addToShelf' : 'newItem')}
            style={{
              minHeight: 180, borderRadius: 18, cursor: 'pointer',
              border: `1.5px dashed ${T.line}`, background: 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 9, color: T.inkSoft, WebkitTapHighlightColor: 'transparent',
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13, background: T.accentSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><window.Icon name="plus" size={20} color={T.accentDeep} /></div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13.5 }}>Add</span>
          </button>
        )}
      </div>
      {list.length === 0 && (
        q ? (
          <div style={{ textAlign: 'center', padding: '46px 30px', color: T.inkFaint, fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>
            Nothing matches “{q}”.
          </div>
        ) : app.group ? (
          <div style={{ textAlign: 'center', padding: '42px 30px', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ fontSize: 15, color: T.inkFaint, marginBottom: 14, textWrap: 'pretty' }}>Nothing in {app.group.name} yet.</div>
            <window.Btn variant="soft" size="sm" onClick={() => app.openModal('addToShelf')}>
              <window.Icon name="plus" size={16} /> Add things
            </window.Btn>
          </div>
        ) : (
          <GetStartedCard app={app} />
        )
      )}
    </div>
  );
}

// ── ITEM DETAIL ────────────────────────────────────────────────
function ItemDetail({ app, item }) {
  const T = window.THEME;
  const uid = app.uid;
  const [sheet, setSheet] = useStateB(false);
  const owner = window.MEMBERS[item.ownerUid];
  const isMine = item.ownerUid === uid;
  const borrower = item.borrowerUid ? window.MEMBERS[item.borrowerUid] : null;
  const myPending = app.requests.find(r => r.itemId === item.id && r.fromUid === uid && r.status === 'pending');
  const market = window.marketInfo(item);

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, zIndex: 150, overflowY: 'auto', animation: 'screenIn .28s cubic-bezier(.16,1,.3,1) both' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ padding: '7px 7px 0' }}>
          <window.ItemThumb item={item} height={290} radius={20} />
        </div>
        <button onClick={app.closeItem} style={{
          position: 'absolute', top: 52, left: 18, width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)', backdropFilter: 'blur(6px)',
        }}><window.Icon name="back" size={21} color={T.ink} /></button>
      </div>

      <div style={{ padding: '18px 20px 140px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11.5, letterSpacing: 0.4, color: T.inkFaint, textTransform: 'lowercase' }}>{window.normCat(item.cat)}{item.cond && item.cond !== 'Good' ? ` · ${item.cond}` : ''}</div>
            <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 27, color: T.ink, letterSpacing: -0.5, margin: '5px 0 0', lineHeight: 1.1 }}>{item.name}</h1>
          </div>
          <div style={{ marginTop: 4 }}><window.StatusBadge status={item.status} due={item.due} /></div>
        </div>

        {market && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <window.Icon name={market.icon} size={19} color={market.color} />
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 21, color: market.color, letterSpacing: -0.3 }}>{market.label}</span>
          </div>
        )}

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15.5, lineHeight: 1.55, color: T.inkSoft, margin: '16px 0 22px', textWrap: 'pretty' }}>{item.desc}</p>

        {owner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: T.surface, border: `1px solid ${T.lineSoft}`, borderRadius: 18, padding: 14, boxShadow: T.shadowSm }}>
            <window.Avatar user={owner} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15.5, color: T.ink }}>{isMine ? 'You' : owner.full}</div>
              {!isMine && owner.email && (
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.inkSoft, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{owner.email}</div>
              )}
            </div>
          </div>
        )}

        {isMine && app.groups.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 9 }}>Shared with</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {app.groups.map(g => {
                const on = (item.groups || []).includes(g.id);
                return (
                  <button key={g.id} onClick={() => app.toggleItemGroup(item, g.id)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 999,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13.5, fontWeight: 600,
                    border: `1.5px solid ${on ? T.accent : T.line}`,
                    background: on ? T.accent : T.surface, color: on ? '#fff' : T.inkSoft,
                    transition: 'all .14s ease', WebkitTapHighlightColor: 'transparent',
                  }}>
                    <window.Icon name={on ? 'check' : 'plus'} size={15} color={on ? '#fff' : T.inkFaint} />
                    {g.name}
                  </button>
                );
              })}
            </div>
            {(!item.groups || item.groups.length === 0) && (
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkFaint, marginTop: 8 }}>Not in a group yet — only you can see it.</div>
            )}
          </div>
        )}

        {item.status === 'out' && borrower && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.inkSoft, padding: '0 4px' }}>
            <window.Icon name="clock" size={17} color={T.warn} />
            {item.borrowerUid === uid ? `You have this until ${window.fmtDate(item.due)}` : `With ${borrower.name} · back ${window.fmtDate(item.due)}`}
          </div>
        )}
        {myPending && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.accentDeep, padding: '0 4px' }}>
            <window.Icon name="clock" size={17} color={T.accent} />
            Request sent — waiting for {owner ? owner.name : 'the owner'} to confirm
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px max(30px, env(safe-area-inset-bottom))', background: `linear-gradient(to top, ${T.bg} 72%, transparent)` }}>
        {isMine ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {item.status === 'gone' ? (
              <window.Btn variant="soft" full size="lg" onClick={() => app.markReturned(item.id)}>
                <window.Icon name="box" size={18} /> Put back on shelf
              </window.Btn>
            ) : (
              <window.Btn variant="primary" full size="lg" onClick={() => app.openModal('editItem', item.id)}>
                <window.Icon name="edit" size={18} /> Edit item
              </window.Btn>
            )}
            {item.status === 'gone' ? (
              <window.Btn variant="ghost" full size="lg" onClick={() => app.openModal('editItem', item.id)}>
                <window.Icon name="edit" size={18} /> Edit
              </window.Btn>
            ) : (
              <window.Btn variant="ghost" full size="lg" onClick={() => app.goTab('borrows')}>My Loans</window.Btn>
            )}
          </div>
        ) : myPending ? (
          <window.Btn variant="soft" full size="lg" disabled>Request pending…</window.Btn>
        ) : item.status === 'available' ? (
          market ? (
            <window.Btn variant="primary" full size="lg" onClick={() => setSheet(true)}>
              <window.Icon name={market.icon} size={19} /> {market.kind === 'sell' ? 'I’m interested' : 'I’ll take it'}
            </window.Btn>
          ) : (
            <window.Btn variant="primary" full size="lg" onClick={() => setSheet(true)}>
              <window.Icon name="heart" size={19} /> Ask to borrow
            </window.Btn>
          )
        ) : market ? (
          <window.Btn variant="soft" full size="lg" disabled>{item.status === 'gone' ? 'Already taken' : 'Someone asked first…'}</window.Btn>
        ) : (
          <window.Btn variant="ghost" full size="lg" onClick={() => app.notifyWhenFree(item)}>
            <window.Icon name="bell" size={18} /> Notify me when it’s free
          </window.Btn>
        )}
      </div>

      {market
        ? <InterestSheet app={app} item={item} market={market} open={sheet} onClose={() => setSheet(false)} />
        : <BorrowSheet app={app} item={item} open={sheet} onClose={() => setSheet(false)} />}
    </div>
  );
}

// ── BORROW REQUEST SHEET ───────────────────────────────────────
function BorrowSheet({ app, item, open, onClose }) {
  const T = window.THEME;
  const owner = window.MEMBERS[item.ownerUid] || { name: 'the owner' };
  const options = [
    { label: 'A couple days', days: 2 },
    { label: 'This weekend', days: 4 },
    { label: 'One week', days: 7 },
    { label: 'Two weeks', days: 14 },
  ];
  const [sel, setSel] = useStateB(2);
  const [note, setNote] = useStateB('');

  const submit = () => {
    app.requestBorrow(item.id, window.isoFromOffset(options[sel].days), note.trim());
    onClose();
  };

  return (
    <window.Sheet open={open} onClose={onClose} title={`Ask ${owner.name} to borrow`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 56 }}><window.ItemThumb item={item} height={56} radius={12} /></div>
        <div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15.5, color: T.ink }}>{item.name}</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.inkSoft }}>{window.normCat(item.cat)}</div>
        </div>
      </div>

      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: T.ink, marginBottom: 9 }}>How long do you need it?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 20 }}>
        {options.map((o, i) => (
          <button key={i} onClick={() => setSel(i)} style={{
            padding: '13px 12px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
            border: `1.5px solid ${sel === i ? T.accent : T.line}`,
            background: sel === i ? T.accentSoft : T.surface, transition: 'all .14s ease',
          }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14.5, color: sel === i ? T.accentDeep : T.ink }}>{o.label}</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>back by {window.fmtDate(window.isoFromOffset(o.days))}</div>
          </button>
        ))}
      </div>

      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: T.ink, marginBottom: 9 }}>Add a note <span style={{ color: T.inkFaint, fontWeight: 400 }}>(optional)</span></div>
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={`Hi ${owner.name}! Mind if I borrow this?`} rows={2} style={{
        width: '100%', boxSizing: 'border-box', resize: 'none', border: `1.5px solid ${T.line}`,
        borderRadius: 14, padding: '12px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14.5,
        color: T.ink, outline: 'none', marginBottom: 18, background: T.surfaceAlt,
      }} />

      <window.Btn variant="primary" full size="lg" onClick={submit}>Send request to {owner.name}</window.Btn>
    </window.Sheet>
  );
}

// ── INTEREST SHEET (Sell / Give Away — no due date) ────────────
function InterestSheet({ app, item, market, open, onClose }) {
  const T = window.THEME;
  const owner = window.MEMBERS[item.ownerUid] || { name: 'the owner' };
  const [note, setNote] = useStateB('');

  const submit = () => {
    app.requestBorrow(item.id, null, note.trim());
    onClose();
  };

  return (
    <window.Sheet open={open} onClose={onClose} title={market.kind === 'sell' ? `Buy from ${owner.name}` : `Ask ${owner.name} for it`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 56 }}><window.ItemThumb item={item} height={56} radius={12} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15.5, color: T.ink }}>{item.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <window.Icon name={market.icon} size={14} color={market.color} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: market.color }}>{market.label}</span>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.inkSoft, marginBottom: 16, lineHeight: 1.5, textWrap: 'pretty' }}>
        {market.kind === 'sell'
          ? `${owner.name} will get your request and you can sort out payment and pickup between you.`
          : `${owner.name} will get your request — first come, first served.`}
      </div>

      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: T.ink, marginBottom: 9 }}>Add a note <span style={{ color: T.inkFaint, fontWeight: 400 }}>(optional)</span></div>
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={`Hi ${owner.name}! Still available?`} rows={2} style={{
        width: '100%', boxSizing: 'border-box', resize: 'none', border: `1.5px solid ${T.line}`,
        borderRadius: 14, padding: '12px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 14.5,
        color: T.ink, outline: 'none', marginBottom: 18, background: T.surfaceAlt,
      }} />

      <window.Btn variant="primary" full size="lg" onClick={submit}>
        <window.Icon name={market.icon} size={18} /> Send to {owner.name}
      </window.Btn>
    </window.Sheet>
  );
}

// ── shared form helpers ────────────────────────────────────────
function Field({ label, children }) {
  const T = window.THEME;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13.5, color: T.ink, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
function inputStyle(T) {
  return {
    width: '100%', boxSizing: 'border-box', border: `1.5px solid ${T.line}`,
    borderRadius: 13, padding: '12px 14px', fontFamily: 'DM Sans, sans-serif',
    fontSize: 15, color: T.ink, outline: 'none', background: T.surface,
  };
}

Object.assign(window, { BrowseScreen, ItemDetail, AvatarStack, Field, inputStyle });
