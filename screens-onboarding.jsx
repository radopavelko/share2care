// screens-onboarding.jsx — three intro pages shown once, on a user's first
// sign-in: welcome, what ShareKeep is about, and how to use it.
// "Next" advances, "Skip" (or finishing) marks the user onboarded.

const { useState: useStateO } = React;

function OnboardRow({ icon, iconColor, iconBg, title, sub }) {
  const T = window.THEME;
  return (
    <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><window.Icon name={icon} size={19} color={iconColor} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: T.ink }}>{title}</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: T.inkSoft, marginTop: 2, lineHeight: 1.45, textWrap: 'pretty' }}>{sub}</div>
      </div>
    </div>
  );
}

function Onboarding({ onDone }) {
  const T = window.THEME;
  const [page, setPage] = useStateO(0);
  const last = page === 2;

  const heading = (lines) => (
    <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 26, color: T.ink, letterSpacing: -0.5, lineHeight: 1.08, textTransform: 'uppercase' }}>
      {lines.map((l, i) => <div key={i} style={l.red ? { color: T.accent } : undefined}>{l.t}</div>)}
    </div>
  );

  const pages = [
    // 1 · Welcome
    <div key="p1" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, padding: '0 30px' }}>
      <window.BrandMark size={84} />
      <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 27, color: T.ink, letterSpacing: -0.5, lineHeight: 1.1, textTransform: 'uppercase' }}>
        Welcome to<br /><span style={{ color: T.accent }}>ShareKeep</span>
      </div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: T.inkSoft, maxWidth: 250, lineHeight: 1.55, textWrap: 'pretty' }}>
        The shelf you share with people you trust.
      </div>
    </div>,

    // 2 · The hook
    <div key="p2" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 28px' }}>
      {heading([{ t: 'Share more,' }, { t: 'buy less', red: true }])}
      <OnboardRow icon="heart" iconColor={T.accent} iconBg={T.accentSoft}
        title="Borrow & lend" sub="Everyday things move between neighbours, not stores." />
      <OnboardRow icon="tag" iconColor={T.ink} iconBg={T.surfaceAlt}
        title="Sell or give away" sub="Done with something? Pass it on — priced or free." />
      <OnboardRow icon="users" iconColor={T.good} iconBg={T.goodSoft}
        title="Only your groups" sub="You see your circles’ things. Nobody else’s." />
    </div>,

    // 3 · Walkthrough
    <div key="p3" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 17, padding: '0 28px' }}>
      {heading([{ t: 'How it works' }])}
      <OnboardRow icon="plus" iconColor={T.accent} iconBg={T.accentSoft}
        title="1 · Add your things" sub="Photo, name, category — 30 seconds." />
      <OnboardRow icon="users" iconColor={T.accent} iconBg={T.accentSoft}
        title="2 · Make a group" sub="From the You tab. Invite with a link or email." />
      <OnboardRow icon="browse" iconColor={T.accent} iconBg={T.accentSoft}
        title="3 · Browse the shelf" sub="Ask to borrow, buy, or take for free." />
      <OnboardRow icon="swap" iconColor={T.accent} iconBg={T.accentSoft}
        title="4 · Loans tab" sub="Approve requests and track returns." />
    </div>,
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 22px 0' }}>
        <button onClick={onDone} style={{
          border: 'none', background: 'none', cursor: 'pointer', padding: 6,
          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: T.inkFaint,
          WebkitTapHighlightColor: 'transparent',
        }}>Skip</button>
      </div>

      <div key={page} style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'screenIn .28s cubic-bezier(.16,1,.3,1) both' }}>
        {pages[page]}
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingBottom: 18 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            height: 7, borderRadius: 4, transition: 'all .2s ease',
            width: i === page ? 20 : 7,
            background: i === page ? T.accent : T.line,
          }} />
        ))}
      </div>

      <div style={{ padding: '0 24px max(30px, env(safe-area-inset-bottom))' }}>
        <window.Btn variant="primary" full size="lg" onClick={() => (last ? onDone() : setPage(page + 1))}>
          {last ? 'Get started' : 'Next'}
        </window.Btn>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding });
