// r1-refined.jsx — R1 layout (map-first listings, search drawer, detail), themeable.
// r1Light = original R1 palette/type. r1Dark = D2 "After-hours" palette + type on the same layout.

const r1Sans = `'Plus Jakarta Sans', system-ui, sans-serif`;
const r1Light = {
  ink: '#15140F', ink2: '#3A3833', ink3: '#6E6A60', ink4: '#A29C8E',
  bg: '#FFFFFF', surface: '#FFFFFF', panel: '#FAF7F1', panel2: '#F2EDE2', line: '#E8E2D6',
  orange: '#E55F1A', orangeSoft: '#FCEADD', onAccent: '#FFFFFF',
  green: '#11A36B', greenSoft: '#DFF4E9', greenDeep: '#0E8A5B',
  star: '#D9A24B', starSoft: '#FBEFD7',
  mapLand: '#F1EBDD', mapWater: '#CFE0DC', mapPark: '#DCE6CE', mapRoad: '#FFFFFF', mapRoadAlt: '#FFE9C2',
  tabBg: '#15140F', tabFg: '#FFFFFF', tabCount: 'rgba(255,255,255,0.6)',
  scrim: 'rgba(20,15,10,0.42)', badgeBg: 'rgba(15,15,15,0.78)', badgeFg: '#FFFFFF',
  hero: { bg: '#E9DDC8', stripe: '#D9C8AA', fg: '#5a4a2a' },
  danger: '#D64533',
  shadow1: '0 2px 6px rgba(0,0,0,0.10)',
  shadow2: '0 4px 14px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05)',
  shadow3: '0 10px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
  fabShadow: '0 10px 24px rgba(17,163,107,0.45), 0 2px 6px rgba(0,0,0,0.1)',
  drawerShadow: '0 -16px 40px rgba(0,0,0,0.18)',
  font: r1Sans, display: r1Sans, mono: r1Sans,
  brandSize: 17, brandWeight: 800, nameSize: 22, nameWeight: 800, nameTracking: -0.5,
  eyebrowSize: 11, eyebrowWeight: 700, eyebrowTracking: 0.8,
  // control geometry (D2 After-hours system)
  rSm: 4, rMd: 6, rLg: 8, rCard: 8,
  ctlLabelWeight: 700,
  chipOn: { bg: '#F2EDE2', fg: '#15140F', border: '#15140F' },
  chipOff: { bg: 'transparent', fg: '#6E6A60', border: '#E8E2D6' },
};
const r1Dark = {
  ink: '#F2EBDD', ink2: '#C7BCA8', ink3: '#857B6B', ink4: '#5E554A',
  bg: '#0E0B07', surface: '#171310', panel: '#171310', panel2: '#221C16', line: '#2E251D',
  orange: '#E1A444', orangeSoft: '#3A2A14', onAccent: '#0E0B07',
  green: '#8FB37A', greenSoft: '#1C261A', greenDeep: '#8FB37A',
  star: '#E1A444', starSoft: '#3A2A14',
  mapLand: '#15110C', mapWater: '#0F1516', mapPark: '#171D14', mapRoad: '#2A231B', mapRoadAlt: '#3A2A14',
  tabBg: '#F2EBDD', tabFg: '#0E0B07', tabCount: 'rgba(14,11,7,0.55)',
  scrim: 'rgba(4,3,1,0.62)', badgeBg: '#3A2A14', badgeFg: '#E1A444',
  hero: { bg: '#1a140d', stripe: '#27201a', fg: '#5a4a2a' },
  danger: '#C76A4E',
  shadow1: '0 2px 6px rgba(0,0,0,0.5)',
  shadow2: '0 4px 14px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
  shadow3: '0 10px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)',
  fabShadow: '0 10px 24px rgba(143,179,122,0.35), 0 2px 6px rgba(0,0,0,0.4)',
  drawerShadow: '0 -16px 40px rgba(0,0,0,0.6)',
  font: `'Inter Tight', system-ui, sans-serif`, display: `'DM Serif Display', Georgia, serif`, mono: `'IBM Plex Mono', ui-monospace, monospace`,
  brandSize: 22, brandWeight: 400, nameSize: 30, nameWeight: 400, nameTracking: -0.6,
  eyebrowSize: 10, eyebrowWeight: 500, eyebrowTracking: 1.8,
  rSm: 4, rMd: 6, rLg: 8, rCard: 8,
  ctlLabelWeight: 500,
  chipOn: { bg: '#221C16', fg: '#F2EBDD', border: '#F2EBDD' },
  chipOff: { bg: 'transparent', fg: '#857B6B', border: '#2E251D' },
};
const r1 = r1Light;
const R1ThemeCtx = React.createContext(r1Light);
const useR1 = () => React.useContext(R1ThemeCtx);
function R1Theme({ theme, children }) { return <R1ThemeCtx.Provider value={theme}>{children}</R1ThemeCtx.Provider>; }
const r1Eyebrow = (t, extra) => ({ fontFamily: t.mono, fontSize: t.eyebrowSize, fontWeight: t.eyebrowWeight, letterSpacing: t.eyebrowTracking, textTransform: 'uppercase', color: t.ink3, ...extra });
const r1Num = (t, extra) => ({ fontFamily: t.mono, fontVariantNumeric: 'tabular-nums', ...extra });
// D2-style control label: mono, uppercase, tracked
const r1CtlLabel = (t, extra) => ({ fontFamily: t.mono, fontSize: 10, fontWeight: t.ctlLabelWeight, letterSpacing: 1.5, textTransform: 'uppercase', ...extra });
// Chip / tab with the D2 on-off contrast: filled + bordered when on, bare when off
const r1Chip = (t, on, extra) => {
  const s = on ? t.chipOn : t.chipOff;
  return { display: 'inline-flex', alignItems: 'center', gap: 7, background: s.bg, color: s.fg, border: `1px solid ${s.border}`, borderRadius: t.rSm, padding: '7px 10px', ...r1CtlLabel(t), ...extra };
};

function R1Map({ pins = [], style }) {
  const t = useR1();
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: t.mapLand, ...style }}>
      <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M -20 380 C 80 360 150 400 220 380 C 290 360 360 400 460 380 L 460 700 L -20 700 Z" fill={t.mapWater} />
        <path d="M -20 60 C 80 70 180 50 260 80 C 340 100 400 90 460 110 L 460 -20 L -20 -20 Z" fill={t.mapWater} />
        <rect x="180" y="160" width="80" height="140" fill={t.mapPark} rx="3" />
        <circle cx="70" cy="240" r="34" fill={t.mapPark} />
        <g stroke={t.mapRoad} strokeWidth="10" strokeLinecap="round">
          <line x1="-20" y1="180" x2="440" y2="170" /><line x1="-20" y1="290" x2="440" y2="300" />
          <line x1="70" y1="-20" x2="90" y2="520" /><line x1="230" y1="-20" x2="250" y2="520" /><line x1="340" y1="-20" x2="360" y2="520" />
        </g>
        <line x1="-20" y1="230" x2="440" y2="220" stroke={t.mapRoadAlt} strokeWidth="6" />
        <line x1="180" y1="-20" x2="200" y2="520" stroke={t.mapRoadAlt} strokeWidth="6" />
      </svg>
      {pins.map((p, i) => {
        const fill = p.active ? t.orange : (p.visited ? t.green : t.surface);
        const fg = p.active || p.visited ? t.onAccent : t.ink;
        return (
          <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: fill, color: fg, padding: '3px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: t.font, boxShadow: p.active ? `0 6px 14px ${t.orange}66` : '0 2px 5px rgba(0,0,0,0.18)', border: p.active ? 'none' : `1px solid ${p.visited ? t.greenDeep : t.line}`, whiteSpace: 'nowrap' }}>
              {p.visited && !p.active && <CheckIcon size={9} color={fg} />}
              {p.active && <StarIcon size={9} color={fg} fill={fg} />}
              {p.label}
            </div>
            <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${fill}`, margin: '-1px auto 0' }} />
          </div>
        );
      })}
    </div>
  );
}

function R1Pill({ children, bg, fg, border }) {
  const t = useR1();
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color: fg, border: `1px solid ${border || 'transparent'}`, fontSize: 11, padding: '5px 8px', borderRadius: t.rSm, ...r1CtlLabel(t), letterSpacing: 1.2 }}>{children}</span>;
}

function R1MobileShell({ children }) {
  const t = useR1();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: t.font, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 18px 0', fontSize: 11, color: t.ink2, fontWeight: 700, fontFamily: t.mono }}>
        <div>9:41</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center', opacity: 0.85 }}>
          <span style={{ letterSpacing: -1 }}>••••</span><span>5G</span>
          <span style={{ width: 16, height: 9, border: `1px solid ${t.ink2}`, borderRadius: 2, position: 'relative' }}><span style={{ position: 'absolute', inset: 1, background: t.ink2, width: 11, borderRadius: 1 }} /></span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: t.orange }}>
          <BurgerLogo size={20} color={t.orange} />
          <div style={{ fontFamily: t.display, fontWeight: t.brandWeight, fontSize: t.brandSize, letterSpacing: -0.3, color: t.display === t.font ? t.orange : t.ink }}>Bite Marks</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 32, height: 32, borderRadius: t.rMd, background: t.panel2, border: `1px solid ${t.line}`, display: 'grid', placeItems: 'center' }}><span style={{ fontSize: 15, color: t.ink2 }}>≡</span></div>
      </div>
      {children}
    </div>
  );
}

const R1SlidersIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.5" fill={color}/><circle cx="15" cy="16" r="2.5" fill={color}/></svg>
);
const R1TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>
);
const R1ChevronUD = ({ size = 16, color = 'currentColor', up }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'none' : 'scaleY(-1)' }}><polyline points="6 15 12 9 18 15"/></svg>
);

function R1FilterTabs({ active = 'All', expanded = false }) {
  const t = useR1();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px 10px', background: t.bg, borderBottom: `1px solid ${t.line}` }}>
      {[['All', 70], ['Visited', 38], ['To try', 32]].map(([l, n]) => (
        <div key={l} style={r1Chip(t, l === active)}>
          {l}<span style={{ opacity: 0.6, ...r1Num(t, { fontSize: 10 }) }}>{n}</span>
        </div>
      ))}
      <div title={expanded ? 'Show map' : 'Expand list'} style={{ marginLeft: 'auto', width: 32, height: 32, borderRadius: t.rMd, background: expanded ? t.chipOn.bg : 'transparent', border: `1px solid ${expanded ? t.chipOn.border : t.line}`, display: 'grid', placeItems: 'center' }}>
        <R1ChevronUD size={16} color={expanded ? t.ink : t.ink2} up={!expanded} />
      </div>
    </div>
  );
}

function R1Card({ spot, open = false }) {
  const t = useR1();
  const ACT = 68;
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${t.line}` }}>
      {/* revealed actions */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, display: 'flex' }}>
        <div style={{ width: ACT, background: t.danger, color: '#fff', display: 'grid', placeItems: 'center' }}><R1TrashIcon size={18} color="#fff" /></div>
        <div style={{ width: ACT, background: t.green, color: t.onAccent, display: 'grid', placeItems: 'center' }}><PinIcon size={18} color={t.onAccent} /></div>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 18px', paddingRight: open ? 12 : 18, marginRight: open ? ACT * 2 : 0, background: open ? t.panel2 : t.bg, transition: 'margin-right 220ms cubic-bezier(.2,.7,.3,1)' }}>
        <div style={{ width: 48, height: 48, borderRadius: t.rMd, background: open ? t.surface : t.panel2, border: `1px solid ${t.line}`, display: 'grid', placeItems: 'center' }}>
          <CuisineIcon spot={spot} size={24} color={t.orange} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.name}</div>
          <div style={{ fontSize: 12, color: t.ink3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.city} · {spot.tags.join(' · ')}</div>
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', ...r1Num(t) }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: t.ink2, fontWeight: 600 }}><StarIcon size={11} color={t.star} fill={t.star} /> {spot.rating.toFixed(1)}</span>
            <span style={{ color: t.ink3 }}>{spot.dist < 100 ? `${spot.dist} mi` : `${(spot.dist / 1000).toFixed(1)}k mi`}</span>
            {spot.visited && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: t.greenDeep }}><span style={{ width: 6, height: 6, borderRadius: 99, background: t.green }} /><span style={r1CtlLabel(t)}>Visited</span></span>}
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: t.rMd, border: `1px solid ${open ? t.green : 'transparent'}`, background: open ? t.surface : 'transparent', display: 'grid', placeItems: 'center' }}>
          <R1SlidersIcon size={16} color={open ? t.greenDeep : t.ink3} />
        </div>
      </div>
    </div>
  );
}

function R1SearchFab({ onClick, top, right = 18 }) {
  const t = useR1();
  return (
    <button onClick={onClick} style={{ position: 'absolute', right, top, width: 56, height: 56, borderRadius: 999, border: 'none', background: t.green, boxShadow: t.fabShadow, display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 10, transition: 'top 220ms cubic-bezier(.2,.7,.3,1), right 220ms cubic-bezier(.2,.7,.3,1)' }}>
      <SearchIcon size={22} color={t.onAccent} />
    </button>
  );
}

const R1_MAP_H = 430;
function R1Listings({ expanded = false, openCard = 1 }) {
  const t = useR1();
  const mapVisible = expanded ? Math.round(R1_MAP_H * 0.1) : R1_MAP_H;
  const pins = [
    { x: 18, y: 38, label: 'Razza', visited: true }, { x: 28, y: 56, label: 'Felina', active: true }, { x: 50, y: 30, label: '4 Charles' },
    { x: 62, y: 22, label: 'COTE', visited: true }, { x: 74, y: 46, label: 'Don Angie' }, { x: 84, y: 64, label: 'Au Cheval', visited: true }, { x: 42, y: 76, label: 'Blu', visited: true },
  ];
  const ctl = { width: 32, height: 32, background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.rMd, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 700, color: t.ink2, boxShadow: t.shadow1 };
  return (
    <R1MobileShell>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: R1_MAP_H, flexShrink: 0, borderBottom: `1px solid ${t.line}` }}>
        <R1Map pins={pins} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 7, background: t.surface, color: t.ink, border: `1px solid ${t.line}`, padding: '7px 10px', borderRadius: t.rMd, boxShadow: t.shadow2, whiteSpace: 'nowrap', ...r1CtlLabel(t) }}>
          <PinIcon size={12} color={t.orange} /> Midtown, New York<span style={{ color: t.ink3 }}>· 29 mi</span>
        </div>
        <div style={{ position: 'absolute', right: 12, top: 56, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={ctl}>+</div><div style={ctl}>−</div><div style={{ ...ctl, color: t.orange }}>⌖</div>
        </div>
        <div style={{ position: 'absolute', left: 12, bottom: 12, background: t.tabBg, color: t.tabFg, padding: '6px 10px', borderRadius: t.rSm, ...r1CtlLabel(t) }}>7 spots in view</div>
      </div>
      <R1SearchFab top={mapVisible - 28} right={18 + 32 + 12} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', marginTop: expanded ? -(R1_MAP_H - mapVisible) : 0, background: t.bg, borderTopLeftRadius: expanded ? 14 : 0, borderTopRightRadius: expanded ? 14 : 0, boxShadow: expanded ? t.drawerShadow : 'none', position: 'relative', zIndex: 5, transition: 'margin-top 220ms cubic-bezier(.2,.7,.3,1)' }}>
        {expanded && <div style={{ width: 36, height: 4, borderRadius: 99, background: t.line, alignSelf: 'center', marginTop: 8, marginBottom: -6 }} />}
        <R1FilterTabs active="All" expanded={expanded} />
        <div style={{ overflow: 'auto', flex: 1 }}>{SPOTS.slice(0, 12).map((s, i) => <R1Card key={i} spot={s} open={i === openCard} />)}</div>
      </div>
      </div>
    </R1MobileShell>
  );
}

function R1ListingsSearch() {
  const t = useR1();
  const sec = (extra) => r1Eyebrow(t, { fontSize: t.eyebrowSize, letterSpacing: Math.max(1.2, t.eyebrowTracking), marginBottom: 8, ...extra });
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <R1Listings openCard={-1} />
      <div style={{ position: 'absolute', inset: 0, background: t.scrim, zIndex: 50 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 60, background: t.surface, color: t.ink, borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: '10px 18px 22px', boxShadow: t.drawerShadow, height: '76%', display: 'flex', flexDirection: 'column', fontFamily: t.font }}>
        <div style={{ width: 36, height: 4, borderRadius: 99, background: t.line, alignSelf: 'center', marginBottom: 10 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: t.panel2, border: `1px solid ${t.ink3}`, borderRadius: t.rMd, marginBottom: 16 }}>
          <SearchIcon size={16} color={t.ink2} />
          <div style={{ flex: 1, color: t.ink, fontSize: 14 }}>fel<span style={{ background: t.orangeSoft, color: t.orange }}>|</span></div>
          <div style={r1CtlLabel(t, { color: t.orange, fontWeight: Math.max(600, t.ctlLabelWeight) })}>Cancel</div>
        </div>
        <div style={sec()}>Top matches</div>
        {SPOTS.slice(0, 2).map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${t.line}` }}>
            <div style={{ width: 40, height: 40, borderRadius: t.rMd, background: t.panel2, border: `1px solid ${t.line}`, display: 'grid', placeItems: 'center' }}><CuisineIcon spot={s} size={20} color={t.orange} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}><span style={{ background: t.orangeSoft, color: t.orange }}>Fel</span>{s.name.slice(3)}</div>
              <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>{s.city}</div>
            </div>
            <ChevronRight size={14} color={t.ink3} />
          </div>
        ))}
        <div style={sec({ margin: '18px 0 8px' })}>Quick filters</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['Open now', true], ['Visited', false], ['To try', false], ['Within 5 mi', false], ['★ 4.5+', true], ['Steak', false], ['Italian', false], ['Late night', false]].map(([x, on]) => (
            <span key={x} style={r1Chip(t, on)}>{x}</span>
          ))}
        </div>
        <div style={sec({ margin: '18px 0 8px' })}>Recent</div>
        {['Razza', 'Don Angie', 'COTE Korean Steakhouse'].map((n, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${t.line}`, fontSize: 14, color: t.ink2, display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: t.ink4 }}>↺</span>{n}</div>
        ))}
      </div>
    </div>
  );
}

function R1Detail() {
  const t = useR1();
  const s = SPOTS[0];
  const eb = r1Eyebrow(t, { marginBottom: 5 });
  return (
    <R1MobileShell>
      <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
        <div style={{ position: 'relative', height: 240 }}>
          <Placeholder label="restaurant hero" bg={t.hero.bg} stripe={t.hero.stripe} fg={t.hero.fg} style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', top: 12, left: 12, width: 32, height: 32, borderRadius: t.rMd, background: t.surface, border: `1px solid ${t.line}`, display: 'grid', placeItems: 'center', boxShadow: t.shadow1 }}><ArrowIcon size={16} color={t.ink} /></div>
          <div style={{ position: 'absolute', top: 12, right: 12, background: t.badgeBg, color: t.badgeFg, padding: '6px 9px', borderRadius: t.rSm, ...r1CtlLabel(t) }}>10 photos</div>
          <div style={{ position: 'absolute', left: 18, right: 18, bottom: -18, background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.rCard, padding: 14, boxShadow: t.shadow3 }}>
            <div style={r1Eyebrow(t, { fontSize: 10, fontWeight: Math.max(700, t.eyebrowWeight), letterSpacing: Math.max(1.4, t.eyebrowTracking), color: t.orange })}>Steakhouse · {s.city}</div>
            <div style={{ fontFamily: t.display, fontSize: t.nameSize, fontWeight: t.nameWeight, letterSpacing: t.nameTracking, lineHeight: 1.1, marginTop: 4 }}>{s.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.ink3, marginTop: 6, fontSize: 12 }}><PinIcon size={12} color={t.ink3} /> {s.addr}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <R1Pill bg={t.starSoft} fg={t.ink} border={t.star}><StarIcon size={11} color={t.star} fill={t.star} /> {s.rating}</R1Pill>
              <R1Pill bg={t.greenSoft} fg={t.greenDeep} border={t.greenDeep}><CheckIcon size={11} color={t.greenDeep} /> Visited</R1Pill>
              <R1Pill bg="transparent" fg={t.ink3} border={t.line}>{s.dist} mi</R1Pill>
            </div>
          </div>
        </div>
        <div style={{ height: 130, margin: '34px 18px 0', position: 'relative', borderRadius: t.rCard, overflow: 'hidden', border: `1px solid ${t.line}` }}>
          <R1Map pins={[{ x: 50, y: 50, label: s.name, active: true }]} style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', right: 8, bottom: 8, background: t.surface, color: t.orange, border: `1px solid ${t.orange}`, padding: '7px 10px', borderRadius: t.rSm, boxShadow: t.shadow1, ...r1CtlLabel(t) }}>Directions ↗</div>
        </div>
        <div style={{ margin: '14px 18px 0', border: `1px solid ${t.line}`, borderRadius: t.rCard, padding: 14, background: t.surface }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Personal details</div>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: t.ink3, fontFamily: t.mono }}>edited 2d ago</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <div style={eb}>My rating</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(n => <StarIcon key={n} size={16} color={t.star} fill={n <= Math.floor(s.mine) || (n === Math.ceil(s.mine) && s.mine % 1) ? t.star : 'none'} />)}
                <div style={{ marginLeft: 4, fontWeight: 700, fontSize: 13, ...r1Num(t) }}>{s.mine.toFixed(1)}</div>
              </div>
            </div>
            <div>
              <div style={eb}>Status</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 9px', background: t.greenSoft, color: t.greenDeep, border: `1px solid ${t.greenDeep}`, borderRadius: t.rSm, ...r1CtlLabel(t) }}><CheckIcon size={12} color={t.greenDeep} /> Visited · Jan '26</div>
            </div>
          </div>
          <div style={eb}>Notes</div>
          <div style={{ border: `1px solid ${t.line}`, borderRadius: t.rMd, padding: 10, fontSize: 13, lineHeight: 1.5, color: t.ink2, background: t.panel2 }}>Local, lowkey but dope. This one is in the cut but the view is great and it's overall better than the one in south orange.</div>
        </div>
        <div style={{ margin: '12px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={r1Eyebrow(t)}>Links</div>
            <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: t.orange, border: `1px solid ${t.orange}`, borderRadius: t.rSm, padding: '5px 8px', ...r1CtlLabel(t) }}><PlusIcon size={11} color={t.orange} /> Add</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            {[['Website', 'felinajc.com'], ['Menu', '/dinner']].map(([k, v], i) => (
              <div key={i} style={{ border: `1px solid ${t.line}`, borderRadius: t.rMd, padding: '9px 10px', background: t.surface, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={r1CtlLabel(t, { color: t.ink3 })}>{k}</div>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: t.ink2 }}>{v}</div>
                <ExternalIcon size={11} color={t.ink3} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ margin: '16px 18px 24px', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: t.orange, color: t.onAccent, padding: '14px 16px', borderRadius: t.rMd, textAlign: 'center', ...r1CtlLabel(t, { fontSize: 12, fontWeight: 700, letterSpacing: 2 }) }}>Save changes</div>
          <div style={{ background: t.surface, color: t.ink2, border: `1px solid ${t.line}`, padding: '14px 16px', borderRadius: t.rMd, ...r1CtlLabel(t, { fontSize: 12 }) }}>Delete</div>
        </div>
      </div>
    </R1MobileShell>
  );
}

function R1Settings() {
  const t = useR1();
  const eb = r1Eyebrow(t, { marginBottom: 8 });
  const card = { margin: '0 18px', border: `1px solid ${t.line}`, borderRadius: t.rCard, background: t.surface, overflow: 'hidden' };
  const row = { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: `1px solid ${t.line}`, fontSize: 13 };
  const Seg = ({ opts, on }) => (
    <div style={{ display: 'flex', gap: 6 }}>{opts.map(o => <div key={o} style={{ ...r1Chip(t, o === on), flex: 1, justifyContent: 'center' }}>{o}</div>)}</div>
  );
  const pct = 40;
  return (
    <R1MobileShell>
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 18px 14px' }}>
          <div style={{ width: 32, height: 32, borderRadius: t.rMd, background: t.surface, border: `1px solid ${t.line}`, display: 'grid', placeItems: 'center' }}><ArrowIcon size={16} color={t.ink} /></div>
          <div style={{ fontFamily: t.display, fontSize: t.nameSize, fontWeight: t.nameWeight, letterSpacing: t.nameTracking, lineHeight: 1.1 }}>Settings</div>
        </div>

        <div style={{ ...eb, margin: '0 18px 8px' }}>Location</div>
        <div style={card}>
          <div style={{ position: 'relative', height: 110 }}>
            <R1Map pins={[{ x: 50, y: 52, label: 'Midtown', active: true }]} style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', left: 10, top: 10, background: t.tabBg, color: t.tabFg, padding: '5px 8px', borderRadius: t.rSm, ...r1CtlLabel(t) }}>Default</div>
          </div>
          <div style={{ ...row, borderTop: 'none' }}>
            <PinIcon size={14} color={t.orange} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Midtown, New York</div>
              <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>Used for distances and “spots in view”</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.orange, border: `1px solid ${t.orange}`, borderRadius: t.rSm, padding: '6px 9px', whiteSpace: 'nowrap', ...r1CtlLabel(t) }}>⌖ Use current</div>
          </div>
          <div style={{ padding: '0 14px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: t.panel2, border: `1px solid ${t.line}`, borderRadius: t.rMd }}>
              <SearchIcon size={15} color={t.ink3} />
              <div style={{ flex: 1, color: t.ink4, fontSize: 14 }}>Search for a location</div>
              <div style={{ width: 1, height: 18, background: t.line }} />
              <PinIcon size={15} color={t.ink3} />
            </div>
          </div>
        </div>

        <div style={{ ...eb, margin: '20px 18px 8px' }}>Search radius</div>
        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: t.display, fontSize: t.nameSize, fontWeight: t.nameWeight, letterSpacing: t.nameTracking, lineHeight: 1, ...r1Num(t, { fontFamily: t.display }) }}>20</div>
            <div style={r1CtlLabel(t, { color: t.ink3 })}>miles</div>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: t.ink3, ...r1Num(t) }}>41 spots inside</div>
          </div>
          <div style={{ position: 'relative', height: 28, marginTop: 12 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 12, height: 4, borderRadius: 2, background: t.panel2, border: `1px solid ${t.line}` }} />
            <div style={{ position: 'absolute', left: 0, width: `${pct}%`, top: 12, height: 4, borderRadius: 2, background: t.orange }} />
            <div style={{ position: 'absolute', left: `calc(${pct}% - 11px)`, top: 3, width: 22, height: 22, borderRadius: t.rSm, background: t.surface, border: `2px solid ${t.orange}`, boxShadow: t.shadow1 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, ...r1CtlLabel(t, { color: t.ink4, fontSize: 9 }) }}><span>1 mi</span><span>25</span><span>50 mi</span></div>
        </div>

        <div style={{ ...eb, margin: '20px 18px 8px' }}>Appearance</div>
        <div style={{ ...card, padding: 14, display: 'grid', gap: 12 }}>
          <div><div style={r1CtlLabel(t, { color: t.ink3, marginBottom: 6 })}>Theme</div><Seg opts={['Light', 'Night', 'System']} on={t === r1Dark ? 'Night' : 'Light'} /></div>
          <div><div style={r1CtlLabel(t, { color: t.ink3, marginBottom: 6 })}>Distance units</div><Seg opts={['Miles', 'Kilometers']} on="Miles" /></div>
          <div><div style={r1CtlLabel(t, { color: t.ink3, marginBottom: 6 })}>Default view</div><Seg opts={['Map + list', 'List only']} on="Map + list" /></div>
        </div>

        <div style={{ ...eb, margin: '20px 18px 8px' }}>Account</div>
        <div style={card}>
          <div style={{ ...row, borderTop: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: t.rMd, background: t.orangeSoft, color: t.orange, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>B</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>broox</div>
              <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>70 spots · 38 visited</div>
            </div>
            <ChevronRight size={16} color={t.ink3} />
          </div>
          {[['Export spots', 'CSV'], ['Notifications', 'Off']].map(([k, v]) => (
            <div key={k} style={row}><div style={{ flex: 1, fontWeight: 600 }}>{k}</div><div style={r1CtlLabel(t, { color: t.ink3 })}>{v}</div><ChevronRight size={16} color={t.ink3} /></div>
          ))}
          <div style={{ ...row, color: t.orange, fontWeight: 700 }}>Log out</div>
        </div>

        <div style={{ margin: '16px 18px 24px', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: t.orange, color: t.onAccent, padding: '14px 16px', borderRadius: t.rMd, textAlign: 'center', ...r1CtlLabel(t, { fontSize: 12, fontWeight: 700, letterSpacing: 2 }) }}>Save settings</div>
        </div>
      </div>
    </R1MobileShell>
  );
}

Object.assign(window, { R1Listings, R1ListingsSearch, R1Detail, R1Settings, R1Theme, r1Light, r1Dark });
