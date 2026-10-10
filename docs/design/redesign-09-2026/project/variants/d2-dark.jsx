// d2-dark.jsx — "Late-night kitchen." Moody dark mode with amber accents and
// cinematic full-bleed photography. Listings read like a tasting menu / vinyl
// record sleeve; the detail page is a film-still treatment.

const d2 = {
  bg: '#0E0B07',
  surface: '#171310',
  surface2: '#221C16',
  line: '#2E251D',
  ink: '#F2EBDD',
  ink2: '#C7BCA8',
  ink3: '#857B6B',
  amber: '#E1A444',
  amberSoft: '#3A2A14',
  red: '#C76A4E',
  green: '#8FB37A',
};

const d2Sans = `'Inter Tight', 'Plus Jakarta Sans', system-ui, sans-serif`;
const d2Serif = `'DM Serif Display', 'Cormorant Garamond', Georgia, serif`;
const d2Mono = `ui-monospace, 'IBM Plex Mono', SFMono-Regular, monospace`;

function D2Chrome({ children }) {
  return (
    <div style={{ width: '100%', height: '100%', background: d2.bg, color: d2.ink, fontFamily: d2Sans, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <BurgerLogo size={22} color={d2.amber} />
        <div style={{ fontFamily: d2Serif, fontSize: 22, letterSpacing: -0.6, color: d2.ink }}>Bite Marks</div>
        <div style={{ fontFamily: d2Mono, fontSize: 10, letterSpacing: 1.8, color: d2.amber, marginLeft: 8, textTransform: 'uppercase' }}>after hours</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 18, fontFamily: d2Mono, fontSize: 10, letterSpacing: 1.5, color: d2.ink2, textTransform: 'uppercase' }}>
          <div style={{ color: d2.amber }}>Spots</div>
          <div>Search</div>
          <div>Tags</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
    </div>
  );
}

function D2Row({ spot, idx }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '34px 60px 1fr auto auto', alignItems: 'center', gap: 14,
      padding: '12px 22px', borderTop: `1px solid ${d2.line}`,
    }}>
      <div style={{ fontFamily: d2Mono, fontSize: 11, color: d2.ink3, letterSpacing: 1 }}>
        {String(idx + 1).padStart(3, '0')}
      </div>
      <Placeholder label="" bg="#2a221b" stripe="#3a2f24" fg="#5a4a2a" style={{ width: 56, height: 56, borderRadius: 4 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: d2.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.name}</div>
        <div style={{ fontFamily: d2Mono, fontSize: 10, color: d2.ink3, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {spot.tags[0]?.toUpperCase()} {spot.tags[1] ? '· ' + spot.tags[1].toUpperCase() : ''} · {spot.city}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: d2.amber }}>
        <StarIcon size={11} color={d2.amber} fill={d2.amber} />
        <div style={{ fontFamily: d2Mono, fontSize: 12, color: d2.ink, fontVariantNumeric: 'tabular-nums' }}>{spot.rating.toFixed(1)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {spot.visited && <div style={{ width: 6, height: 6, borderRadius: 99, background: d2.green }} />}
        <div style={{ fontFamily: d2Mono, fontSize: 11, color: d2.ink3, minWidth: 50, textAlign: 'right' }}>{spot.dist < 100 ? `${spot.dist} mi` : `${(spot.dist / 1000).toFixed(1)}k`}</div>
      </div>
    </div>
  );
}

function D2Listings() {
  return (
    <D2Chrome>
      <div style={{ overflow: 'auto', height: '100%' }}>
        {/* Hero */}
        <div style={{ position: 'relative', height: 260, margin: '4px 22px 0' }}>
          <Placeholder label="" bg="#1c1610" stripe="#2a221b" fg="#5a4a2a" style={{ position: 'absolute', inset: 0, borderRadius: 8 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,11,7,0) 30%, rgba(14,11,7,0.92) 100%)', borderRadius: 8 }} />
          <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
            <div style={{ fontFamily: d2Mono, fontSize: 10, letterSpacing: 2, color: d2.amber, textTransform: 'uppercase', marginBottom: 8 }}>Tonight near you · 11:24 PM</div>
            <div style={{ fontFamily: d2Serif, fontSize: 36, letterSpacing: -0.8, lineHeight: 1, color: d2.ink }}>
              Still open, still worth it.
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 14, fontFamily: d2Mono, fontSize: 10, color: d2.ink2, letterSpacing: 1.4, textTransform: 'uppercase' }}>
              <span>70 spots</span><span>·</span><span>12 open now</span><span>·</span><span>Midtown radius</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 22px 8px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: d2Mono, fontSize: 10, letterSpacing: 1.5, color: d2.ink3, textTransform: 'uppercase' }}>
          <div style={{ color: d2.ink, background: d2.surface2, padding: '6px 10px', borderRadius: 4 }}>All · 70</div>
          <div style={{ padding: '6px 10px' }}>Visited · 38</div>
          <div style={{ padding: '6px 10px' }}>Open now · 12</div>
          <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: d2.ink2 }}>
            <SearchIcon size={12} color={d2.ink3} /> Search
          </div>
        </div>

        <div>
          {SPOTS.map((s, i) => <D2Row key={i} spot={s} idx={i} />)}
        </div>
      </div>
    </D2Chrome>
  );
}

function D2Detail() {
  const s = SPOTS[0];
  return (
    <D2Chrome>
      <div style={{ overflow: 'auto', height: '100%' }}>
        {/* Cinematic hero */}
        <div style={{ position: 'relative', height: 360, margin: '4px 22px 0' }}>
          <Placeholder label="" bg="#1a140d" stripe="#27201a" fg="#5a4a2a" style={{ position: 'absolute', inset: 0, borderRadius: 8 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,11,7,0.6) 0%, rgba(14,11,7,0) 35%, rgba(14,11,7,0.95) 100%)', borderRadius: 8 }} />
          <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: d2Mono, fontSize: 10, letterSpacing: 1.5, color: d2.ink, textTransform: 'uppercase' }}>
            <ArrowIcon size={12} color={d2.ink} /> Back
          </div>
          <div style={{ position: 'absolute', top: 14, right: 16, fontFamily: d2Mono, fontSize: 10, letterSpacing: 1.5, color: d2.amber, textTransform: 'uppercase', background: d2.amberSoft, padding: '5px 9px', borderRadius: 999, border: `1px solid ${d2.amber}` }}>
            10 photos
          </div>
          <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>
            <div style={{ fontFamily: d2Mono, fontSize: 10, letterSpacing: 2, color: d2.amber, textTransform: 'uppercase', marginBottom: 8 }}>Entry №041 · Steakhouse</div>
            <div style={{ fontFamily: d2Serif, fontSize: 48, letterSpacing: -1.4, lineHeight: 0.95, color: d2.ink }}>{s.name}</div>
            <div style={{ marginTop: 10, color: d2.ink2, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PinIcon size={13} color={d2.amber} /> {s.addr}
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ margin: '14px 22px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: `1px solid ${d2.line}`, borderRadius: 8 }}>
          {[
            { k: 'Public', v: s.rating.toFixed(1), accent: d2.amber },
            { k: 'Mine', v: s.mine.toFixed(1), accent: d2.amber },
            { k: 'Visited', v: 'Jan ’26', accent: d2.green },
            { k: 'Distance', v: `${s.dist} mi`, accent: d2.ink2 },
          ].map((c, i) => (
            <div key={i} style={{ padding: '14px 16px', borderLeft: i ? `1px solid ${d2.line}` : 'none' }}>
              <div style={{ fontFamily: d2Mono, fontSize: 9, letterSpacing: 1.8, color: d2.ink3, textTransform: 'uppercase' }}>{c.k}</div>
              <div style={{ fontFamily: d2Serif, fontSize: 24, color: c.accent, marginTop: 4 }}>{c.v}</div>
            </div>
          ))}
        </div>

        {/* Notes block */}
        <div style={{ margin: '20px 22px 0', padding: 18, background: d2.surface, borderRadius: 8, border: `1px solid ${d2.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontFamily: d2Mono, fontSize: 10, letterSpacing: 1.8, color: d2.amber, textTransform: 'uppercase' }}>The Log</div>
            <div style={{ marginLeft: 'auto', fontFamily: d2Mono, fontSize: 10, color: d2.ink3 }}>edited 2d ago</div>
          </div>
          <div style={{ fontFamily: d2Serif, fontSize: 18, lineHeight: 1.5, color: d2.ink, fontStyle: 'italic', borderLeft: `2px solid ${d2.amber}`, paddingLeft: 14 }}>
            "Local, lowkey but dope. This one is in the cut but the view is great
            and it's overall better than the one in south orange."
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: d2Mono, fontSize: 10, color: d2.ink3, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            <span>Tags:</span>
            {['date night', 'view', 'JC local', 'special occasion'].map(t => (
              <span key={t} style={{ background: d2.surface2, color: d2.ink2, padding: '4px 8px', borderRadius: 999, letterSpacing: 1 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Links / actions */}
        <div style={{ margin: '14px 22px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Website', 'felinajc.com'], ['Menu PDF', '/2026'], ['Instagram', '@felinajc'], ['Reservation', 'Resy ↗']].map(([l, h], i) => (
            <div key={i} style={{ background: d2.surface, border: `1px solid ${d2.line}`, borderRadius: 6, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: d2Mono, fontSize: 10, letterSpacing: 1.5, color: d2.ink3, textTransform: 'uppercase' }}>{l}</div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: d2.ink }}>{h}</div>
              <ExternalIcon size={11} color={d2.ink3} />
            </div>
          ))}
        </div>

        <div style={{ margin: '0 22px 22px', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: d2.amber, color: d2.bg, padding: '14px 16px', borderRadius: 6, fontWeight: 800, fontSize: 13, textAlign: 'center', fontFamily: d2Mono, letterSpacing: 2, textTransform: 'uppercase' }}>Save the night</div>
          <div style={{ background: d2.surface, color: d2.ink2, padding: '14px 16px', borderRadius: 6, fontSize: 13, border: `1px solid ${d2.line}` }}>Delete</div>
        </div>
      </div>
    </D2Chrome>
  );
}

Object.assign(window, { D2Listings, D2Detail });
