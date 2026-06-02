/**
 * 多数据源解析球员头像 URL（按优先级依次尝试）
 */
import { lookupTmId, TM_CDN, TM_CDN_ALT } from './player-meta.mjs';
import {
  tryManualOverride,
  tryWikipediaI18n,
  trySportsDbDetail,
  tryWikidataFromWikiTitle,
  tryOpenverse,
  tryWikimediaCommons,
  getSearchAlias,
} from './photo-sources-extra.mjs';
import { probeImageUrl, sleep } from './image-probe.mjs';
import { setupHttpProxy } from './http-fetch.mjs';

export { probeImageUrl, sleep };

const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php';
const UA = 'WorldCup2026-SquadViewer/1.0 (local photo fetch)';

function pickBest(soccer, nationalityEn) {
  if (!soccer.length) return null;
  if (nationalityEn) {
    const nat = nationalityEn.toLowerCase();
    const matched = soccer.filter((p) => {
      const n = (p.strNationality || '').toLowerCase();
      return n === nat || n.includes(nat) || nat.includes(n);
    });
    if (matched.length) {
      return matched.sort((a, b) => Number(b.relevance || 0) - Number(a.relevance || 0))[0];
    }
  }
  return soccer.sort((a, b) => Number(b.relevance || 0) - Number(a.relevance || 0))[0];
}

function sportsDbImageUrls(player) {
  return [player.strThumb, player.strCutout, player.strRender].filter(Boolean);
}

export function extractTmId(photo) {
  if (!photo || typeof photo !== 'string') return null;
  const m = photo.match(/(?:transfermarkt|tmssl\.akamaized\.net)[^"']*?\/(\d+)\.jpg/i);
  return m?.[1] || null;
}

export function extractRemotePhoto(photo) {
  if (!photo || typeof photo !== 'string') return null;
  if (photo.startsWith('assets/')) return null;
  if (photo.includes('ui-avatars.com')) return null;
  if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(photo) || photo.includes('thesportsdb.com') || photo.includes('wikimedia')) {
    return photo.replace('www.thesportsdb.com', 'r2.thesportsdb.com');
  }
  return null;
}

async function searchSportsDbOnce(query, nationalityEn) {
  setupHttpProxy();
  const url = `${SPORTSDB_API}?p=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const soccer = (data.player || []).filter(
    (p) => p.strSport === 'Soccer' && (p.strThumb || p.strCutout || p.strRender),
  );
  return pickBest(soccer, nationalityEn);
}

export async function tryTheSportsDb(nameEn, nationalityEn) {
  const last = nameEn.split(/\s+/).pop();
  const queries = [
    nameEn,
    nationalityEn ? `${nameEn} ${nationalityEn}` : '',
    `${nameEn} footballer`,
    last,
    nationalityEn ? `${last} ${nationalityEn}` : '',
    `${last} footballer`,
  ].filter((q, i, a) => q?.trim() && a.indexOf(q) === i);

  for (const q of queries) {
    const hit = await searchSportsDbOnce(q, nationalityEn);
    if (hit) {
      for (const imgUrl of sportsDbImageUrls(hit)) {
        if (await probeImageUrl(imgUrl)) return { url: imgUrl, source: 'thesportsdb' };
      }
    }
    await sleep(60);
  }
  return null;
}

export async function tryTransfermarkt(nameEn, existingPhoto) {
  const tmId = lookupTmId(nameEn) || extractTmId(existingPhoto);
  if (!tmId) return null;
  for (const base of [TM_CDN, TM_CDN_ALT]) {
    const url = `${base}/${tmId}.jpg`;
    if (await probeImageUrl(url)) return { url, source: 'transfermarkt' };
  }
  return null;
}

export async function tryExistingRemote(existingPhoto) {
  const url = extractRemotePhoto(existingPhoto);
  if (!url) return null;
  if (await probeImageUrl(url)) return { url, source: 'existing' };
  return null;
}

async function wikipediaThumbForTitle(title) {
  const api =
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
    '&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*';
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0];
  return page?.thumbnail?.source || null;
}

export async function tryWikipedia(nameEn, nationalityEn) {
  const queries = [
    `${nameEn} ${nationalityEn} footballer`,
    `${nameEn} footballer`,
    `${nameEn} football`,
    nameEn,
  ].filter((q, i, a) => q.trim() && a.indexOf(q) === i);

  for (const q of queries) {
    const searchUrl =
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}` +
      '&srlimit=4&format=json&origin=*';
    const res = await fetch(searchUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) continue;
    const data = await res.json();
    for (const hit of data.query?.search || []) {
      const thumb = await wikipediaThumbForTitle(hit.title);
      if (thumb && (await probeImageUrl(thumb))) return { url: thumb, source: 'wikipedia' };
    }
    await sleep(40);
  }
  return null;
}

async function wikidataImageUrl(entityId) {
  const api =
    `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entityId}&property=P18&format=json&origin=*`;
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const file = data.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (!file) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=320`;
}

export async function tryWikidata(nameEn) {
  const searchUrl =
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(nameEn)}` +
    '&language=en&format=json&origin=*&limit=6';
  const res = await fetch(searchUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = await res.json();
  for (const item of data.search || []) {
    const desc = (item.description || '').toLowerCase();
    if (desc && !desc.includes('football') && !desc.includes('soccer') && !desc.includes('association')) {
      continue;
    }
    const url = await wikidataImageUrl(item.id);
    if (url && (await probeImageUrl(url))) return { url, source: 'wikidata' };
  }
  return null;
}

/**
 * @param {{ nameEn: string, nationalityEn?: string, existingPhoto?: string }} ctx
 * @returns {Promise<{ url: string, source: string } | null>}
 */
/** 批量更新时优先 TM / 单次 SportsDB，减少 API 轮询 */
export async function resolvePlayerPhotoFast(ctx) {
  const { nameEn, nationalityEn = '', existingPhoto = '' } = ctx;
  const hit =
    (await tryManualOverride(nameEn)) ||
    (await tryTransfermarkt(nameEn, existingPhoto)) ||
    (await tryExistingRemote(existingPhoto)) ||
    (await tryWikipediaI18n(nameEn, nationalityEn));
  if (hit?.url) return hit;

  const player = await searchSportsDbOnce(nameEn, nationalityEn);
  if (player) {
    for (const imgUrl of sportsDbImageUrls(player)) {
      if (await probeImageUrl(imgUrl)) return { url: imgUrl, source: 'thesportsdb' };
    }
  }
  return null;
}

export async function resolvePlayerPhoto(ctx) {
  const { nameEn, nationalityEn = '', existingPhoto = '' } = ctx;

  const hasRemote = Boolean(extractRemotePhoto(existingPhoto));
  const alias = getSearchAlias(nameEn);
  const providers = [
    () => tryManualOverride(nameEn),
    () => tryTransfermarkt(nameEn, existingPhoto),
    ...(hasRemote ? [() => tryExistingRemote(existingPhoto)] : []),
    () => tryWikipediaI18n(nameEn, nationalityEn),
    () => tryTheSportsDb(nameEn, nationalityEn),
    () => trySportsDbDetail(nameEn, nationalityEn),
    ...(!hasRemote ? [() => tryExistingRemote(existingPhoto)] : []),
    () => tryWikipedia(nameEn, nationalityEn),
    () => tryWikidata(nameEn),
    () => tryWikidataFromWikiTitle(nameEn, alias),
    () => tryWikimediaCommons(nameEn, alias),
    () => tryOpenverse(nameEn, nationalityEn),
  ];

  for (const provider of providers) {
    try {
      const hit = await provider();
      if (hit?.url) return hit;
    } catch {
      /* 单源失败时继续尝试下一数据源 */
    }
  }
  return null;
}
