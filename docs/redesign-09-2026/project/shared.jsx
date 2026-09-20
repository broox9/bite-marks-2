// shared.jsx — restaurant data + small placeholder helpers shared by every variant

const SPOTS = [
  { name: 'Felina Steak Jersey City', addr: '2 Chapel Ave Unit 2, Jersey City, NJ 07305', city: 'Jersey City, NJ', rating: 4.3, mine: 4.5, visited: true, dist: 4,  tags: ['Steak', 'View'], hero: true },
  { name: 'Filé Gumbo Bar',           addr: '276 Church St, New York, NY 10013',           city: 'Tribeca, NY',   rating: 4.5, mine: 5.0, visited: true, dist: 12, tags: ['Cajun', 'Cozy'] },
  { name: 'The Nephew Supper Club',   addr: '271 W 119th St, New York, NY 10026',          city: 'Harlem, NY',    rating: 4.6, mine: 4.0, visited: false, dist: 18, tags: ['Supper', 'Live music'] },
  { name: "Cuz's Fish Stand",         addr: 'Paradise Beach, Bridgetown, Saint Michael',   city: 'Barbados',      rating: 4.8, mine: 4.8, visited: true, dist: 2103, tags: ['Caribbean', 'Beach'] },
  { name: 'Champers Restaurant',      addr: "Skeetes Hill, Bridgetown, Saint Michael",     city: 'Barbados',      rating: 4.4, mine: 4.2, visited: true, dist: 2110, tags: ['Caribbean'] },
  { name: 'Savvy On The Bay',         addr: '46 Henshaw Ave, New York, NY 10038',          city: 'FiDi, NY',      rating: 4.1, mine: null, visited: false, dist: 30, tags: ['Bar', 'Waterfront'] },
  { name: 'Bobwhite Counter',         addr: '94 Stanton St, New York, NY 10002',           city: 'LES, NY',       rating: 4.7, mine: 4.5, visited: true, dist: 28, tags: ['Southern', 'Casual'] },
  { name: "Rabbit's Chicken & Waffles", addr: '91 W 125th St, New York, NY 10027',         city: 'Harlem, NY',    rating: 4.5, mine: 4.6, visited: true, dist: 19, tags: ['Soul', 'Brunch'] },
  { name: 'Don Angie',                addr: '103 Greenwich Ave, New York, NY 10014',       city: 'West Village',  rating: 4.7, mine: null, visited: false, dist: 26, tags: ['Italian', 'Date'] },
  { name: 'Yo\u2019s Apothecary \u8449\u5ba4', addr: '19 Orchard St, New York, NY 10002',  city: 'LES, NY',       rating: 4.3, mine: null, visited: false, dist: 29, tags: ['Cocktails'] },
  { name: 'Nowon East Village',       addr: '507 E 6th St, New York, NY 10009',            city: 'East Village',  rating: 4.5, mine: 4.5, visited: true, dist: 27, tags: ['Korean'] },
  { name: 'BLT Prime',                addr: '1032 Lexington Ave, New York, NY 10021',      city: 'UES, NY',       rating: 4.2, mine: null, visited: false, dist: 23, tags: ['Steak'] },
  { name: "Christo's",                addr: '290 Broad St, Bloomfield, NJ 07003',          city: 'Bloomfield, NJ',rating: 4.4, mine: 4.3, visited: true, dist: 14, tags: ['Italian', 'Local'] },
  { name: 'Jambo Hanare',             addr: '3-chōme 27-9 Hongō, Bunkyō City, Tokyo',      city: 'Tokyo, JP',     rating: 4.9, mine: null, visited: false, dist: 6745, tags: ['Sushi'] },
  { name: "Delmonico's",              addr: '56 Beaver St, New York, NY 10004',            city: 'FiDi, NY',      rating: 4.3, mine: null, visited: false, dist: 31, tags: ['Steak', 'Classic'] },
  { name: 'Hawksmoor NYC',            addr: '109 E 22nd St, New York, NY 10010',           city: 'Gramercy, NY',  rating: 4.4, mine: 4.4, visited: true, dist: 25, tags: ['Steak'] },
  { name: "Mark's Off Madison",       addr: '41 Madison Ave Ground Level, NY 10010',       city: 'NoMad, NY',     rating: 4.5, mine: null, visited: false, dist: 25, tags: ['Brunch', 'Deli'] },
  { name: '53',                       addr: '53 W 53rd St, New York, NY 10019',            city: 'Midtown, NY',   rating: 4.6, mine: null, visited: false, dist: 22, tags: ['Tasting'] },
  { name: 'Blu On The Hudson',        addr: '1200 Hudson St, Weehawken, NJ 07086',         city: 'Weehawken, NJ', rating: 4.2, mine: 4.0, visited: true, dist: 5,  tags: ['Italian', 'View'] },
  { name: 'Au Cheval',                addr: '33 Cortlandt Alley, New York, NY 10013',      city: 'Tribeca, NY',   rating: 4.7, mine: 5.0, visited: true, dist: 27, tags: ['Burger'] },
  { name: 'The LDLA',                 addr: '102 Sinatra Dr, Hoboken, NJ 07030',           city: 'Hoboken, NJ',   rating: 4.0, mine: null, visited: false, dist: 8,  tags: ['Waterfront'] },
  { name: '4 Charles Prime Rib',      addr: '4 Charles St, New York, NY 10014',            city: 'West Village',  rating: 4.8, mine: null, visited: false, dist: 26, tags: ['Steak', 'Speakeasy'] },
  { name: 'COTE Korean Steakhouse',   addr: '16 W 22nd St, New York, NY 10010',            city: 'Flatiron, NY',  rating: 4.8, mine: 4.9, visited: true, dist: 25, tags: ['Korean BBQ'] },
  { name: 'Razza',                    addr: '275 Grove St, Jersey City, NJ 07302',         city: 'Jersey City',   rating: 4.7, mine: 4.8, visited: true, dist: 3,  tags: ['Pizza'] },
  { name: 'Rezdôra',                  addr: '27 E 20th St, New York, NY 10003',            city: 'Flatiron, NY',  rating: 4.8, mine: null, visited: false, dist: 24, tags: ['Italian', 'Tasting'] },
  { name: 'Din Tai Fung',             addr: '1 Vanderbilt Ave, New York, NY 10017',        city: 'Midtown, NY',   rating: 4.6, mine: 4.7, visited: true, dist: 22, tags: ['Dumplings'] },
  { name: 'Tatiana by Kwame Onwuachi',addr: '10 Lincoln Center Plaza, NY 10023',           city: 'UWS, NY',       rating: 4.7, mine: null, visited: false, dist: 25, tags: ['New American'] },
];

// Subtle striped SVG placeholder with a monospace explainer label baked in.
// Pass color tokens for fg + bg so each variant can theme it.
function placeholderUrl({ label = 'photo', bg = '#efece6', stripe = '#e3dfd4', fg = '#5a5247', w = 800, h = 600 } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="14" fill="${bg}"/>
        <rect width="2" height="14" fill="${stripe}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#p)"/>
    <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="14" fill="${fg}" letter-spacing="1">
      <text x="20" y="${h - 20}">${label}</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function Placeholder({ label, bg, stripe, fg, style }) {
  return (
    <div style={{
      backgroundImage: `url("${placeholderUrl({ label, bg, stripe, fg })}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      ...style,
    }} />
  );
}

// Star/glyph helpers — simple inline SVGs (allowed: simple shapes).
const StarIcon = ({ size = 14, color = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinejoin="round">
    <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
  </svg>
);
const PinIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);
const CheckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 12 10 17 19 7"/>
  </svg>
);
const ArrowIcon = ({ size = 14, color = 'currentColor', dir = 'left' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === 'right' ? 'scaleX(-1)' : 'none' }}>
    <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
  </svg>
);
const ChevronRight = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const ExternalIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
  </svg>
);
const PlusIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SearchIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
// --- Cuisine glyphs (simple line shapes, keyed off a spot's primary tag) ---
const gp = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const SteakIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M5.5 9.5c1.5-4 6-6 10-4.5s4.5 6 2.5 9-7 4.5-10.5 2.5-3.5-4.5-2-7z"/><path d="M9 11.5c1-1.8 3.2-2.6 5-1.8s2.3 3 1.3 4.6"/>
  </svg>
);
const PizzaIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M12 3.5 20.5 19c-5.5 2.5-11.5 2.5-17 0L12 3.5z"/><circle cx="10" cy="12" r="1.1" fill={color} stroke="none"/><circle cx="14" cy="14.5" r="1.1" fill={color} stroke="none"/><circle cx="11.5" cy="16.5" r="1.1" fill={color} stroke="none"/>
  </svg>
);
const SushiIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <rect x="3.5" y="12" width="17" height="7" rx="3"/><path d="M4.5 12c1-3.5 4-5.5 7.5-5.5S18.5 8.5 19.5 12"/><path d="M8.5 9.5 10 6.5M14 6.5l1.5 3"/>
  </svg>
);
const NoodleIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M3.5 11.5h17c0 4.5-3.8 8-8.5 8s-8.5-3.5-8.5-8z"/><path d="M8 8.5c0-2 1-3.5 2.5-4M13 8.5c0-2.5 1.2-4 3-4.5"/>
  </svg>
);
const DumplingIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M4 16.5c0-4.7 3.6-8 8-8s8 3.3 8 8H4z"/><path d="M4.5 16.5c1-2.2 2.2-3.4 3.5-3.6M20 16.5c-1-2.2-2.4-3.4-3.7-3.6M12 12.8v3.7"/>
  </svg>
);
const FishIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M3 12c3-4 7-6 11-6 3 0 5 1.5 6.5 3.5-1.5 2-3.5 3.5-6.5 3.5"/><path d="M3 12c3 4 7 6 11 6"/><path d="M20.5 9.5 22 12l-1.5 2.5"/><circle cx="7.5" cy="10.5" r=".7" fill={color} stroke="none"/>
  </svg>
);
const ChickenIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M14 4.5c3 0 5.5 2.4 5.5 5.4 0 2.6-1.9 4.4-4 5.1l-4.6 4.5-2.4-.3-.3-2.4 4.5-4.6c.7-2.1 2.5-4 5.1-4" /><path d="M8.2 16.8 5 20"/>
  </svg>
);
const CocktailIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M4 5.5h16L12 13.5 4 5.5z"/><path d="M12 13.5v5M8.5 18.5h7"/>
  </svg>
);
const CupIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M4.5 7.5h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-6z"/><path d="M16.5 9.5h2a2.5 2.5 0 0 1 0 5h-2"/>
  </svg>
);
const FlameIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M12 3.5c3.5 3 6 5.6 6 9.2A6 6 0 0 1 6 12.7c0-2 .9-3.6 2.4-5.2.4 1.4 1.2 2.2 2.2 2.4-.4-2.6.1-4.6 1.4-6.4z"/>
  </svg>
);
const UtensilIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...gp}>
    <path d="M7 3.5v6.5a2 2 0 0 0 4 0V3.5M9 12v8.5"/><path d="M16 3.5c1.8 0 3 1.4 3 3.2s-1 3-2.2 3.3l.4 10.5h-2.4l.4-10.5C14 9.7 13 8.5 13 6.7c0-1.8 1.2-3.2 3-3.2z"/>
  </svg>
);

const CUISINE_ICONS = {
  steak: SteakIcon, pizza: PizzaIcon, sushi: SushiIcon, noodle: NoodleIcon, dumpling: DumplingIcon,
  fish: FishIcon, chicken: ChickenIcon, cocktail: CocktailIcon, cup: CupIcon, flame: FlameIcon, utensil: UtensilIcon,
};
const CUISINE_MAP = {
  steak: 'steak', pizza: 'pizza', sushi: 'sushi', italian: 'noodle', dumplings: 'dumpling',
  caribbean: 'fish', cajun: 'fish', seafood: 'fish', southern: 'chicken', soul: 'chicken',
  cocktails: 'cocktail', bar: 'cocktail', speakeasy: 'cocktail', brunch: 'cup', deli: 'cup',
  korean: 'flame', 'korean bbq': 'flame', burger: 'burger', tasting: 'utensil', supper: 'utensil',
  'new american': 'utensil', waterfront: 'fish',
};
function cuisineKey(spot) {
  for (const tag of spot.tags || []) {
    const k = CUISINE_MAP[String(tag).toLowerCase()];
    if (k) return k;
  }
  return 'utensil';
}
function CuisineIcon({ spot, size = 22, color = 'currentColor' }) {
  const k = cuisineKey(spot);
  if (k === 'burger') return <BurgerLogo size={size} color={color} />;
  const C = CUISINE_ICONS[k] || UtensilIcon;
  return <C size={size} color={color} />;
}

// Tiny burger logo glyph
const BurgerLogo = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11a9 9 0 0 1 18 0"/>
    <path d="M3 14h18"/>
    <path d="M4 17h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>
    <circle cx="8" cy="8" r=".5" fill={color}/>
    <circle cx="13" cy="7" r=".5" fill={color}/>
    <circle cx="17" cy="8.5" r=".5" fill={color}/>
  </svg>
);

Object.assign(window, { SPOTS, Placeholder, placeholderUrl, StarIcon, PinIcon, CheckIcon, ArrowIcon, ChevronRight, ExternalIcon, PlusIcon, SearchIcon, BurgerLogo, CuisineIcon, cuisineKey, CUISINE_ICONS });
