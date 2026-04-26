import { colors } from './theme';

export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function catColor(category) {
  const map = {
    politics:      colors.catPolitics,
    business:      colors.catBusiness,
    tech:          colors.catTech,
    sports:        colors.catSports,
    entertainment: colors.catEnt,
    health:        colors.catHealth,
    science:       colors.catScience,
    general:       colors.catGeneral,
  };
  return map[category] || colors.saffron;
}

const FAVICON_PALETTES = [
  { bg: '#2a3550', color: '#9bb0e0' },
  { bg: '#3d2a40', color: '#d09bd5' },
  { bg: '#2a4035', color: '#88d4b0' },
  { bg: '#403330', color: '#e0a890' },
  { bg: '#352a40', color: '#b09bd5' },
  { bg: '#2a3828', color: '#90d490' },
];

export function faviconPalette(index) {
  return FAVICON_PALETTES[index % FAVICON_PALETTES.length];
}

export function formatCategory(category) {
  if (!category) return '';
  return category.charAt(0).toUpperCase() + category.slice(1);
}
