// screens-borrows.jsx — Loans (who has what) + You (profile, groups, your things)

function LoanRow({ app, it, action, actionLabel, subtitle }) {
  const T = window.THEME;
  return (
    <window.Card style={{ padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 54, flexShrink: 0, cursor: 'pointer' }} onClick={() => app.openItem(it.id)}><window.ItemThumb item={it} height={54} radius={11} /></div>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => app.openItem(it.id)}>
          <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15.5, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.inkSoft, marginTop: 2 }}>{subtitle}</div>
        </div>
        <window.Btn variant="soft" size="sm" onClick={action}>{actionLabel}</window.Btn>
      </div>
    </window.Card>
  );
}

// ── LOANS ──────────────────────────────────────────────────────
function BorrowsScreen({ app }) {
  const T = window.THEME;
  const uid = app.uid;
  const have = app.items.filter(it => window.holderOf(it) === uid && it.ownerUid !== uid);
  const out = app.items.filter(it => it.ownerUid === uid && window.holderOf(it) && window.holderOf(it) !== uid);
  const nameOf = id => { const m = window.MEMBERS[id]; return m ? m.name : 'someone'; };
  const sinceOf = it => { const s = window.fmtSince(it.takenAt); return s ? ` · since ${s}` : ''; };
  // Completed loans involving me (my things, or things I held), newest first.
  const toMs = t => (t && t.toDate ? t.toDate() : t ? new Date(t) : new Date(0)).getTime();
  const history = app.items
    .flatMap(it => (it.history || []).map(h => ({ ...h, item: it })))
    .filter(h => h.item.ownerUid === uid || h.holderUid === uid)
    .sort((a, b) => toMs(b.to) - toMs(a.to))
    .slice(0, 100);

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '54px 20px 16px' }}>
        <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 30, color: T.ink, letterSpacing: -0.8 }}>Loans</div>
        <div style={{ fontFamily: T.font, fontSize: 13.5, color: T.inkSoft, marginTop: 2 }}>Who has what right now</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ marginBottom: 26 }}>
          <window.SectionLabel count={have.length}>You have</window.SectionLabel>
          {have.length === 0 ? <window.EmptyHint text="You’re not holding anyone’s things right now." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {have.map(it => (
                <LoanRow key={it.id} app={app} it={it} actionLabel="Return" action={() => app.returnItem(it.id)}
                  subtitle={`${nameOf(it.ownerUid)}’s${sinceOf(it)}`} />
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 26 }}>
          <window.SectionLabel count={out.length}>Out with others</window.SectionLabel>
          {out.length === 0 ? <window.EmptyHint text="All your things are home." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {out.map(it => (
                <LoanRow key={it.id} app={app} it={it} actionLabel="Got it back" action={() => app.returnItem(it.id)}
                  subtitle={`With ${nameOf(window.holderOf(it))}${sinceOf(it)}`} />
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <window.SectionLabel count={history.length || null}>History</window.SectionLabel>
          {history.length === 0 ? <window.EmptyHint text="Completed loans will show up here." /> : (
            <window.Card style={{ maxHeight: 300, overflowY: 'auto' }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderTop: i ? `1px solid ${T.lineSoft}` : 'none' }}>
                  <window.Avatar user={h.holderUid} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.font, fontSize: 14, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <b style={{ fontWeight: 600 }}>{h.holderUid === uid ? 'You' : nameOf(h.holderUid)}</b> had <b style={{ fontWeight: 600 }}>{h.item.name}</b>
                    </div>
                    <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkSoft, marginTop: 1 }}>
                      {h.item.ownerUid === uid ? 'yours' : `${nameOf(h.item.ownerUid)}’s`} · {window.fmtSince(h.from) ? `${window.fmtSince(h.from)} – ` : ''}{window.fmtSince(h.to)}
                    </div>
                  </div>
                </div>
              ))}
            </window.Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── YOU ────────────────────────────────────────────────────────
function ProfileScreen({ app }) {
  const T = window.THEME;
  const uid = app.uid;
  const me = app.me;
  const myItems = app.items.filter(it => it.ownerUid === uid);

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '60px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <window.Avatar user={me} size={80} />
        <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 22, color: T.ink, marginTop: 12, letterSpacing: -0.5 }}>{me.full}</div>
        {me.email && <div style={{ fontFamily: T.font, fontSize: 14, color: T.inkSoft, marginTop: 3 }}>{me.email}</div>}
      </div>

      <div style={{ padding: '26px 20px 0' }}>
        <window.SectionLabel count={app.groups.length}>Your groups</window.SectionLabel>
        {app.groups.length === 0 ? (
          <window.EmptyHint text="No groups yet. Create one and invite people with a link or their email." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {app.groups.map(g => (
              <window.Card key={g.id} onClick={() => app.openModal('manageGroup', g.id)} style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <window.GroupAvatar group={g} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                    <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkSoft, marginTop: 1 }}>
                      {(g.memberUids || []).length} {(g.memberUids || []).length === 1 ? 'member' : 'members'}{g.ownerUid === uid ? ' · admin' : ''}
                    </div>
                  </div>
                  <window.Icon name="chevron" size={17} color={T.inkFaint} />
                </div>
              </window.Card>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <window.Btn variant="ghost" full onClick={() => app.openModal('createGroup')}><window.Icon name="plus" size={17} /> New group</window.Btn>
          <window.Btn variant="ghost" full onClick={() => app.openModal('joinGroup')}><window.Icon name="link" size={17} /> Join</window.Btn>
        </div>
      </div>

      <div style={{ padding: '26px 20px 0' }}>
        <window.SectionLabel count={myItems.length}>Your things</window.SectionLabel>
        {myItems.length === 0 ? <window.EmptyHint text="Nothing yet. Add something you’re happy to lend." /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myItems.map(it => (
              <window.Card key={it.id} onClick={() => app.openItem(it.id)} style={{ padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, flexShrink: 0 }}><window.ItemThumb item={it} height={48} radius={10} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: 15, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                    <div style={{ fontFamily: T.font, fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>
                      {(it.groups || []).length ? `${(it.groups || []).length} ${(it.groups || []).length === 1 ? 'group' : 'groups'}` : 'Not shared'}
                    </div>
                  </div>
                  <window.StatusPill item={it} uid={uid} small />
                </div>
              </window.Card>
            ))}
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          <window.Btn variant="primary" full onClick={() => app.openModal('newItem')}><window.Icon name="plus" size={17} /> Add a thing</window.Btn>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <window.Btn variant="ghost" size="sm" onClick={app.signOut}><window.Icon name="logout" size={16} /> Sign out</window.Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BorrowsScreen, ProfileScreen });
