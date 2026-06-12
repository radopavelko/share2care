// screens-borrows.jsx — My Loans (requests / borrowing / lent out) + Profile

function SectionLabel({ children, count }) {
  const T = window.THEME;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 10px' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: T.inkSoft, whiteSpace: 'nowrap' }}>{children}</span>
      {count != null && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: T.inkFaint }}>{count}</span>}
    </div>
  );
}

function EmptyHint({ text }) {
  const T = window.THEME;
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.inkFaint, padding: '14px 16px', background: T.surfaceAlt, borderRadius: 14, border: `1px dashed ${T.line}`, textWrap: 'pretty' }}>{text}</div>
  );
}

// ── MY LOANS ───────────────────────────────────────────────────
function BorrowsScreen({ app }) {
  const T = window.THEME;
  const uid = app.uid;
  const byId = id => app.items.find(it => it.id === id);

  const incoming = app.requests.filter(r => r.toUid === uid && r.status === 'pending');
  const outgoing = app.requests.filter(r => r.fromUid === uid && r.status === 'pending');
  const borrowing = app.items.filter(it => it.status === 'out' && it.borrowerUid === uid);
  const lentOut = app.items.filter(it => it.ownerUid === uid && it.status === 'out' && it.borrowerUid !== uid);

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '54px 20px 14px' }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: 0.6, color: T.accent, textTransform: 'uppercase' }}>Your circle</div>
        <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 23, color: T.ink, letterSpacing: -0.5, marginTop: 3, textTransform: 'uppercase' }}>My loans</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {incoming.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <SectionLabel count={incoming.length}>Requests for you</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {incoming.map(r => {
                const it = byId(r.itemId); const from = window.MEMBERS[r.fromUid];
                if (!it || !from) return null;
                const market = !r.due ? window.marketInfo(it) : null;
                return (
                  <window.Card key={r.id} style={{ padding: 14 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 58, flexShrink: 0 }}><window.ItemThumb item={it} height={58} radius={12} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                          <window.Avatar user={from} size={20} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: T.inkSoft }}><b style={{ color: T.ink }}>{from.name}</b> {market ? (market.kind === 'sell' ? 'wants to buy' : 'will take') : 'wants'}</span>
                        </div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15.5, color: T.ink }}>{it.name}</div>
                        {market ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <window.Icon name={market.icon} size={13} color={market.color} />
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: market.color }}>{market.label}</span>
                          </div>
                        ) : (
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T.inkSoft, marginTop: 2 }}>until {window.fmtDate(r.due)}</div>
                        )}
                      </div>
                    </div>
                    {r.note && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.inkSoft, fontStyle: 'italic', background: T.surfaceAlt, borderRadius: 12, padding: '9px 12px', margin: '11px 0 0', textWrap: 'pretty' }}>“{r.note}”</div>}
                    <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
                      <window.Btn variant="good" size="sm" full onClick={() => app.respondRequest(r.id, true)}>
                        <window.Icon name="check" size={17} /> {market ? (market.kind === 'sell' ? 'Sell it' : 'Give it') : 'Lend it'}
                      </window.Btn>
                      <window.Btn variant="danger" size="sm" full onClick={() => app.respondRequest(r.id, false)}>Not now</window.Btn>
                    </div>
                  </window.Card>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 26 }}>
          <SectionLabel count={borrowing.length + outgoing.length}>You’re borrowing</SectionLabel>
          {borrowing.length + outgoing.length === 0 ? (
            <EmptyHint text="Nothing borrowed right now. Browse the shelf to find something." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {borrowing.map(it => {
                const r = window.relativeDue(it.due);
                const owner = window.MEMBERS[it.ownerUid] || { name: '?' };
                const toneColor = r.tone === 'over' ? T.over : r.tone === 'soon' ? T.warn : T.inkSoft;
                return (
                  <window.Card key={it.id} style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 52, flexShrink: 0 }} onClick={() => app.openItem(it.id)}><window.ItemThumb item={it} height={52} radius={11} /></div>
                      <div style={{ flex: 1, minWidth: 0 }} onClick={() => app.openItem(it.id)}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{it.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <window.Avatar user={it.ownerUid} size={16} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: T.inkSoft }}>{owner.name}</span>
                          <span style={{ width: 3, height: 3, borderRadius: 9, background: T.inkFaint }} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, color: toneColor }}>{r.label}</span>
                        </div>
                      </div>
                      <window.Btn variant="ghost" size="sm" onClick={() => app.returnItem(it.id)}>Return</window.Btn>
                    </div>
                  </window.Card>
                );
              })}
              {outgoing.map(r => {
                const it = byId(r.itemId); if (!it) return null;
                const owner = window.MEMBERS[it.ownerUid] || { name: '?' };
                return (
                  <window.Card key={r.id} style={{ padding: 12, opacity: 0.92 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 52, flexShrink: 0 }}><window.ItemThumb item={it} height={52} radius={11} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{it.name}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: T.accentDeep, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: 9, background: T.accent, display: 'inline-block' }} />
                          Waiting for {owner.name}
                        </div>
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: T.inkFaint }}>pending</span>
                    </div>
                  </window.Card>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <SectionLabel count={lentOut.length}>Out with others</SectionLabel>
          {lentOut.length === 0 ? (
            <EmptyHint text="None of your things are out right now." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {lentOut.map(it => {
                const r = window.relativeDue(it.due); const b = window.MEMBERS[it.borrowerUid] || { name: '?' };
                const toneColor = r.tone === 'over' ? T.over : r.tone === 'soon' ? T.warn : T.inkSoft;
                return (
                  <window.Card key={it.id} style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 52, flexShrink: 0 }}><window.ItemThumb item={it} height={52} radius={11} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{it.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <window.Avatar user={it.borrowerUid} size={16} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: T.inkSoft }}>with {b.name}</span>
                          <span style={{ width: 3, height: 3, borderRadius: 9, background: T.inkFaint }} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, fontWeight: 600, color: toneColor }}>{r.label}</span>
                        </div>
                      </div>
                      <window.Btn variant="soft" size="sm" onClick={() => app.markReturned(it.id)}>Got it back</window.Btn>
                    </div>
                  </window.Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PROFILE ────────────────────────────────────────────────────
function ProfileScreen({ app }) {
  const T = window.THEME;
  const uid = app.uid;
  const me = app.me;
  const myItems = app.items.filter(it => it.ownerUid === uid);
  const lentCount = myItems.filter(it => it.status === 'out').length;
  const borrowingCount = app.items.filter(it => it.status === 'out' && it.borrowerUid === uid).length;

  const Stat = ({ n, label }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: 'Archivo Black, sans-serif', fontWeight: 700, fontSize: 24, color: T.ink }}>{n}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: T.inkSoft, marginTop: 1 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '60px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <window.Avatar user={me} size={84} />
        <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 20, color: T.ink, marginTop: 14, letterSpacing: -0.3, textTransform: 'uppercase' }}>{me.full}</div>
        {me.email && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: T.inkSoft, marginTop: 4 }}>{me.email}</div>
        )}
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <window.Card style={{ padding: '16px 8px', display: 'flex' }}>
          <Stat n={myItems.length} label="On the shelf" />
          <div style={{ width: 1, background: T.lineSoft }} />
          <Stat n={lentCount} label="Lent out" />
          <div style={{ width: 1, background: T.lineSoft }} />
          <Stat n={borrowingCount} label="Borrowing" />
        </window.Card>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel count={app.groups.length}>Your groups</SectionLabel>
        {app.groups.length === 0 ? (
          <EmptyHint text="No groups yet. Create one and invite people with a link or their email." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {app.groups.map(g => (
              <window.Card key={g.id} onClick={() => app.openModal('manageGroup', g.id)} style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: T.accentSoft,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><window.Icon name="users" size={19} color={T.accentDeep} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: T.inkSoft, marginTop: 1 }}>
                      {(g.memberUids || []).length} {(g.memberUids || []).length === 1 ? 'member' : 'members'}{g.ownerUid === uid ? ' · you’re the admin' : ''}
                    </div>
                  </div>
                  <window.Icon name="chevron" size={17} color={T.inkFaint} />
                </div>
              </window.Card>
            ))}
          </div>
        )}
        <button onClick={() => app.openModal('createGroup')} style={{
          width: '100%', marginTop: 12, padding: '13px', borderRadius: 14, cursor: 'pointer',
          border: `1.5px dashed ${T.line}`, background: 'transparent', color: T.accentDeep,
          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}><window.Icon name="users" size={18} /> Create a group</button>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <SectionLabel count={myItems.length}>On your shelf</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myItems.map(it => (
            <window.Card key={it.id} onClick={() => app.openItem(it.id)} style={{ padding: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, flexShrink: 0 }}><window.ItemThumb item={it} height={48} radius={10} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: T.ink }}>{it.name}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: T.inkSoft, marginTop: 2 }}>{window.normCat(it.cat)}</div>
                </div>
                <window.StatusBadge status={it.status} due={it.due} small />
              </div>
            </window.Card>
          ))}
        </div>
        <button onClick={() => app.goTab('lend')} style={{
          width: '100%', marginTop: 12, padding: '13px', borderRadius: 14, cursor: 'pointer',
          border: `1.5px dashed ${T.line}`, background: 'transparent', color: T.accentDeep,
          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}><window.Icon name="plus" size={18} /> Lend something new</button>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <window.Btn variant="ghost" size="sm" onClick={app.signOut}>
            <window.Icon name="logout" size={17} /> Sign out
          </window.Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BorrowsScreen, ProfileScreen, SectionLabel });
