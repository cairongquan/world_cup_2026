import { TEAM_ISO } from './constants.js';

/** @type {Record<string, string>} */
let flagByZh = {};

export function setFlagMapping(teams) {
  flagByZh = { ...teams };
}

export function flagCdnUrl(name) {
  const mapped = flagByZh[name];
  if (mapped) return mapped.replace('/w320/', '/w80/');
  const iso = TEAM_ISO[name];
  if (!iso) return '';
  return `https://flagcdn.com/w80/${iso.replace(/_/g, '-')}.png`;
}

export function flagPath(name) {
  const cdn = flagCdnUrl(name);
  if (cdn) return cdn;
  const iso = TEAM_ISO[name];
  return iso ? `assets/flags/${iso.replace(/-/g, '_')}.png` : '';
}

/** Mapbox Popup 用 HTML 字符串 */
export function flagImgHtml(name, className = 'flag-img') {
  const src = flagPath(name);
  if (!src) return '';
  const local = TEAM_ISO[name] ? `assets/flags/${TEAM_ISO[name].replace(/-/g, '_')}.png` : '';
  const fallback = flagCdnUrl(name);
  const err = local && fallback && local !== src
    ? `this.dataset.fb='1';this.src='${fallback}'`
    : '';
  return `<img class="${className}" src="${src}" alt="${name}" title="${name}" loading="lazy"${err ? ` onerror="if(this.dataset.fb!=='1'){${err}}"` : ''}>`;
}
