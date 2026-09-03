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

        <div style={{ marginBottom: 20 }}>
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
                  <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <window.Icon name="users" size={19} color={T.accentText} />
                  </div>
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
