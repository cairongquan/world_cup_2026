/**
 * 额外头像数据源：手动映射、多语言维基、SportsDB 详情、Openverse 等
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { lookupTmId, TM_CDN, TM_CDN_ALT } from './player-meta.mjs';
import { probeImageUrl, sleep } from './image-probe.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OVERRIDES_PATH = path.join(ROOT, 'data', 'player-photo-overrides.json');
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/3';
const UA = 'WorldCup2026-SquadViewer/1.0';

const NAT_LANGS = {
  japan: ['ja', 'en'],
  morocco: ['es', 'ar', 'fr', 'en'],
  brazil: ['pt', 'en'],
  paraguay: ['es', 'en'],
  jordan: ['ar', 'en'],
  iraq: ['ar', 'en'],
  uzbekistan: ['en', 'uz'],
  tunisia: ['ar', 'fr', 'en'],
  'south korea': ['ko', 'en'],
  spain: ['es', 'en'],
  uruguay: ['es', 'en'],
};

let overridesCache;

function loadOverrides() {
  if (overridesCache) return overridesCache;
  if (!fs.existsSync(OVERRIDES_PATH)) {
    overridesCache = { urls: {}, searchAs: {} };
    return overridesCache;
  }
  overridesCache = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
  return overridesCache;
}

export function getSearchAlias(nameEn) {
  return loadOverrides().searchAs?.[nameEn] || null;
}

export async function tryManualOverride(nameEn) {
  const url = loadOverrides().urls?.[nameEn];
  if (!url) return null;
  if (await probeImageUrl(url)) return { url, source: 'override' };
  return null;
}

async function wikiThumb(lang, title) {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
    '&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*';
  const res = await fetch(api, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0];
  return page?.missing ? null : page?.thumbnail?.source || null;
}

async function wikiSearch(lang, query) {
  const searchUrl =
    `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}` +
    '&srlimit=6&format=json&origin=*';
  const res = await fetch(searchUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data.query?.search || [];
}

function langsForNationality(nationalityEn) {
  const key = String(nationalityEn || '').toLowerCase();
  return NAT_LANGS[key] || ['en'];
}

function isFootballHit(hit) {
  const text = `${hit.title} ${hit.snippet}`.toLowerCase();
  return /football|soccer|futebol|futbol|fußball|footballer|futebolista|calcio|足球|選手|midfielder|forward|goalkeeper|defender/.test(
    text,
  );
}

export async function tryWikipediaI18n(nameEn, nationalityEn) {
  const searchName = getSearchAlias(nameEn) || nameEn;
  const langs = langsForNationality(nationalityEn);

  for (const lang of langs) {
    const direct = await wikiThumb(lang, searchName);
    if (direct && (await probeImageUrl(direct))) return { url: direct, source: `wikipedia-${lang}` };

    const queries = [
      searchName,
      `${searchName} ${nationalityEn}`,
      `${searchName} footballer`,
      `${searchName} football`,
    ].filter((q, i, a) => q.trim() && a.indexOf(q) === i);

    for (const q of queries) {
      const hits = await wikiSearch(lang, q);
      for (const hit of hits) {
        if (hit.title.toLowerCase() !== searchName.toLowerCase() && !isFootballHit(hit)) continue;
        const thumb = await wikiThumb(lang, hit.title);
        if (thumb && (await probeImageUrl(thumb))) return { url: thumb, source: `wikipedia-${lang}` };
      }
      await sleep(40);
    }
  }
  return null;
}

async function sportsDbLookupPlayer(idPlayer) {
  const url = `${SPORTSDB_API}/lookupplayer.php?id=${idPlayer}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;
  const data = await res.json();
  return data.players?.[0] || null;
}

export async function trySportsDbDetail(nameEn, nationalityEn) {
  const searchUrl = `${SPORTSDB_API}/searchplayers.php?p=${encodeURIComponent(nameEn)}`;
  const res = await fetch(searchUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;
  const data = await res.json();
  const soccer = (data.player || []).filter((p) => p.strSport === 'Soccer');
  if (!soccer.length) return null;

  const nat = nationalityEn.toLowerCase();
  const sorted = soccer.sort((a, b) => Number(b.relevance || 0) - Number(a.relevance || 0));
  const candidates = nat
    ? sorted.filter((p) => (p.strNationality || '').toLowerCase().includes(nat) || nat.includes((p.strNationality || '').toLowerCase()))
    : sorted;
  const list = candidates.length ? candidates : sorted;

  for (const brief of list.slice(0, 3)) {
    const full = await sportsDbLookupPlayer(brief.idPlayer);
    if (!full) continue;

    for (const img of [full.strThumb, full.strCutout, full.strRender].filter(Boolean)) {
      if (await probeImageUrl(img)) return { url: img, source: 'thesportsdb-lookup' };
    }

    const tmId = full.idTransferMkt || lookupTmId(nameEn);
    if (tmId) {
      for (const base of [TM_CDN, TM_CDN_ALT]) {
        for (const size of ['header', 'big', 'medium']) {
          const url = `${base.replace('/medium', `/${size}`)}/${tmId}.jpg`;
          if (await probeImageUrl(url)) return { url, source: 'transfermarkt-sportsdb' };
        }
      }
    }

    if (full.idWikidata) {
      const wdUrl = await wikidataImageById(full.idWikidata);
      if (wdUrl && (await probeImageUrl(wdUrl))) return { url: wdUrl, source: 'wikidata-sportsdb' };
    }
    await sleep(50);
  }
  return null;
}

async function wikidataImageById(entityId) {
  const api =
    `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entityId}&property=P18&format=json&origin=*`;
  const res = await fetch(api, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;
  const data = await res.json();
  const file = data.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  if (!file) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=320`;
}

export async function tryWikidataFromWikiTitle(nameEn, searchAlias) {
  const title = searchAlias || nameEn;
  const api =
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageprops&format=json&origin=*`;
  const res = await fetch(api, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0];
  const qid = page?.pageprops?.wikibase_item;
  if (!qid) return null;
  const url = await wikidataImageById(qid);
  if (url && (await probeImageUrl(url))) return { url, source: 'wikidata-wiki' };
  return null;
}

export async function tryOpenverse(nameEn, nationalityEn) {
  const searchName = getSearchAlias(nameEn) || nameEn;
  const queries = [`${searchName} football player`, `${searchName} ${nationalityEn} soccer`].filter(
    (q, i, a) => q.trim() && a.indexOf(q) === i,
  );
  for (const q of queries) {
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=5&license=cc0,by,by-sa`;
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
    if (!res.ok) continue;
    const data = await res.json();
    for (const item of data.results || []) {
      if (item.url && (await probeImageUrl(item.url))) return { url: item.url, source: 'openverse' };
    }
    await sleep(40);
  }
  return null;
}

export async function tryWikimediaCommons(nameEn, searchAlias) {
  const q = `${searchAlias || nameEn} football`;
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}` +
    '&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=320&format=json&origin=*';
  const res = await fetch(api, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data.query?.pages || {};
  for (const page of Object.values(pages)) {
    const url = page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url;
    if (url && (await probeImageUrl(url))) return { url, source: 'commons' };
  }
  return null;
}
