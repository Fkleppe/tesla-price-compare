// Centralized constants for the application

export const SITE_NAME = 'EVPriceHunt';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://evpricehunt.com';
export const SITE_DESCRIPTION = 'Compare prices on Tesla and EV accessories across multiple stores. Find the best deals with exclusive discount codes.';

export const TESLA_MODELS = [
  { id: 'model-3', name: 'Model 3', shortName: '3' },
  { id: 'highland', name: 'Model 3 Highland', shortName: '3 Highland' },
  { id: 'model-y', name: 'Model Y', shortName: 'Y' },
  { id: 'juniper', name: 'Model Y Juniper', shortName: 'Y Juniper' },
  { id: 'model-s', name: 'Model S', shortName: 'S' },
  { id: 'model-x', name: 'Model X', shortName: 'X' },
  { id: 'cybertruck', name: 'Cybertruck', shortName: 'Cybertruck' },
  { id: 'universal', name: 'Universal', shortName: 'Universal' },
] as const;

export const MODEL_LABELS: Record<string, string> = Object.fromEntries(
  TESLA_MODELS.map(m => [m.id, m.name])
);

export const CATEGORIES = [
  { id: 'floor-mats', name: 'Floor Mats', description: 'All-weather TPE and carpet floor mats for Tesla vehicles' },
  { id: 'cargo-mats', name: 'Cargo Mats', description: 'Trunk liners and cargo area protection for Tesla' },
  { id: 'screen-protector', name: 'Screen Protectors', description: '9H tempered glass screen protectors for Tesla touchscreens' },
  { id: 'center-console', name: 'Center Console', description: 'Center console wraps, organizers, and protective covers' },
  { id: 'charging', name: 'Charging', description: 'Home chargers, mobile connectors, and charging adapters' },
  { id: 'exterior', name: 'Exterior', description: 'Spoilers, mud flaps, and exterior styling accessories' },
  { id: 'interior', name: 'Interior', description: 'Interior upgrades for comfort, style, and protection' },
  { id: 'interior-trim', name: 'Interior Trim', description: 'Carbon fiber and premium trim pieces for Tesla interiors' },
  { id: 'wheel-covers', name: 'Wheel Covers', description: 'Aero wheel covers and hub caps for improved range' },
  { id: 'lighting', name: 'Lighting', description: 'LED upgrades, puddle lights, and ambient lighting' },
  { id: 'storage', name: 'Storage', description: 'Under-seat storage, organizers, and space solutions' },
  { id: 'camping', name: 'Camping', description: 'Camping mattresses, tents, and outdoor gear for Tesla' },
  { id: 'sunshade', name: 'Sunshades', description: 'Windshield and panoramic roof sunshades' },
  { id: 'seat-covers', name: 'Seat Covers', description: 'Custom-fit seat covers and protectors' },
  { id: 'electronics', name: 'Electronics', description: 'Phone mounts, wireless chargers, and dash cameras' },
  { id: 'spoiler', name: 'Spoilers', description: 'Performance spoilers and rear wings for Tesla' },
  { id: 'phone-mount', name: 'Phone Mounts', description: 'Magnetic and wireless charging phone mounts' },
  { id: 'mud-flaps', name: 'Mud Flaps', description: 'Paint protection mud flaps and splash guards' },
] as const;

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.name])
);

export const TOP_10_LISTS = [
  {
    id: 'mattress',
    title: 'Best Tesla Mattresses',
    description: 'Sleep comfortably on road trips with these top-rated Tesla mattresses for camping and travel.',
    keywords: ['mattress', 'camping mattress', 'air mattress', 'sleeping pad'],
  },
  {
    id: 'tent',
    title: 'Best Tesla Camping Tents',
    description: 'Turn your Tesla into a camping adventure with these premium tent attachments.',
    keywords: ['tent', 'camping tent', 'car tent', 'tailgate tent'],
  },
  {
    id: 'floor-mats',
    title: 'Best Floor Mats',
    description: 'Protect your Tesla interior with all-weather floor mats that fit perfectly.',
    keywords: ['floor mat', 'floor liner', 'all-weather mat', 'floor mats'],
  },
  {
    id: 'screen-protector',
    title: 'Best Screen Protectors',
    description: 'Keep your Tesla touchscreen scratch-free with these premium screen protectors.',
    keywords: ['screen protector', 'tempered glass', 'touch screen', 'screen film'],
  },
  {
    id: 'center-console',
    title: 'Best Center Console Accessories',
    description: 'Organize and protect your center console with these must-have accessories.',
    keywords: ['center console', 'console wrap', 'console cover', 'armrest'],
  },
  {
    id: 'charger',
    title: 'Best Charging Accessories',
    description: 'Charge faster and smarter with these top charging solutions for your Tesla.',
    keywords: ['charger', 'charging', 'wall connector', 'mobile connector', 'nema'],
  },
  {
    id: 'sunshade',
    title: 'Best Sunshades',
    description: 'Keep your Tesla cool with these effective sunshades and window covers.',
    keywords: ['sunshade', 'sun shade', 'windshield shade', 'roof shade', 'window shade'],
  },
  {
    id: 'wheel-covers',
    title: 'Best Wheel Covers & Caps',
    description: 'Upgrade your Tesla wheels with stylish covers and aero caps.',
    keywords: ['wheel cover', 'hub cap', 'hubcap', 'wheel cap', 'aero cover', 'aero wheel'],
  },
  {
    id: 'trunk-organizer',
    title: 'Best Trunk Organizers',
    description: 'Maximize your trunk space with these clever storage solutions.',
    keywords: ['trunk organizer', 'cargo net', 'trunk mat', 'frunk', 'trunk storage'],
  },
  {
    id: 'phone-mount',
    title: 'Best Phone Mounts & Chargers',
    description: 'Keep your phone secure and charged with these wireless mounts.',
    keywords: ['phone mount', 'phone holder', 'wireless charger', 'magsafe', 'phone stand'],
  },
] as const;

export const ITEMS_PER_PAGE = 48;

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

export function formatCategory(category: string): string {
  return category
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
