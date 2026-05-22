import { API_TEAM_ALIASES } from './constants.js';

/** @type {Record<string, string>} */
let enToZh = { ...API_TEAM_ALIASES };

export function setEnToZhFromCountries(teams) {
  enToZh = { ...API_TEAM_ALIASES };
  Object.values(teams || {}).forEach((t) => {
    if (t.nameEn && t.nameZh) enToZh[t.nameEn] = t.nameZh;
  });
  Object.assign(enToZh, API_TEAM_ALIASES);
}

export function teamZh(nameEn) {
  if (!nameEn) return '—';
  return enToZh[nameEn] || API_TEAM_ALIASES[nameEn] || nameEn;
}
