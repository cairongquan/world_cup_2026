#!/usr/bin/env node
/**
 * 拉取球员头像到 assets/players/
 * 数据源优先级：TheSportsDB → 已有远程链接 → Transfermarkt → Wikipedia → Wikidata
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolvePlayerPhoto } from './lib/resolve-player-photo.mjs';
import { sleep } from './lib/image-probe.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SQUADS = path.join(ROOT, 'data', 'squads.json');
const COUNTRIES = path.join(ROOT, 'data', 'countries.json');
const CACHE = path.join(ROOT, 'data', 'player-photo-cache.json');
const OUT_DIR = path.join(ROOT, 'assets', 'players');
const DELAY_MS = 100;

const PLAYER_KEYS = ['goalkeepers', 'defenders', 'midfielders', 'forwards', 'keyPlayers'];

const FETCH_IMAGE = {
  headers: { 'User-Agent': 'WorldCup2026-SquadViewer/1.0', Accept: 'image/*' },
};

function slug(s) {
  const out = String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return out.slice(0, 60) || 'player';
}

function teamSlug(teamName, countries) {
  const en = countries.teams?.[teamName]?.nameEn || teamName;
  return slug(en);
}

function collectPlayers(team) {
  return PLAYER_KEYS.flatMap((k) => team[k] || []);
}

async function downloadImage(url, dest, retries = 2) {
  for (let i = 0; i <= retries; i += 1) {
    try {
      const res = await fetch(url, { ...FETCH_IMAGE, signal: AbortSignal.timeout(45000) });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) continue;
      fs.writeFileSync(dest, buf);
      return true;
    } catch {
      if (i < retries) await sleep(400 * (i + 1));
    }
  }
  return false;
}

function parseCacheEntry(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return { url: entry, source: 'cache' };
  if (entry?.url) return entry;
  return null;
}

function hasLocalPhoto(p) {
  if (!p.photo?.startsWith('assets/players/')) return false;
  const dest = path.join(ROOT, p.photo);
  return fs.existsSync(dest) && fs.statSync(dest).size >= 1000;
}

const raw = JSON.parse(fs.readFileSync(SQUADS, 'utf8'));
const countries = JSON.parse(fs.readFileSync(COUNTRIES, 'utf8'));
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

if (process.argv.includes('--retry-miss')) {
  for (const k of Object.keys(cache)) {
    if (!parseCacheEntry(cache[k])?.url) delete cache[k];
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const stats = { downloaded: 0, skipped: 0, failed: 0, updated: 0, bySource: {} };

for (const [teamName, team] of Object.entries(raw.teams)) {
  const nationalityEn = countries.teams?.[teamName]?.nameEn || '';
  for (const p of collectPlayers(team)) {
    const nameEn = p.nameEn;
    if (!nameEn) continue;

    const cacheKey = `${teamName}::${nameEn}`;
    if (hasLocalPhoto(p) && !process.argv.includes('--force')) {
      stats.skipped += 1;
      continue;
    }

    let resolved = parseCacheEntry(cache[cacheKey]);
    const needSearch = !resolved?.url || p.photo?.includes('ui-avatars.com');

    if (needSearch) {
      process.stdout.write(`search ${teamName} / ${nameEn}... `);
      try {
        resolved = await resolvePlayerPhoto({
          nameEn,
          nationalityEn,
          existingPhoto: p.photo,
        });
        cache[cacheKey] = resolved?.url || null;
        if (resolved) {
          stats.bySource[resolved.source] = (stats.bySource[resolved.source] || 0) + 1;
          console.log(resolved.source);
        } else {
          console.log('miss');
        }
      } catch (e) {
        console.log('error', e.message);
        resolved = null;
      }
      await sleep(DELAY_MS);
    } else if (resolved) {
      console.log(`cached (${resolved.source || 'cache'}) ${teamName} / ${nameEn}`);
    }

    const thumbUrl = resolved?.url;
    if (!thumbUrl) {
      stats.failed += 1;
      continue;
    }

    const fileName = `${teamSlug(teamName, countries)}_${slug(nameEn)}.jpg`;
    const localRel = `assets/players/${fileName}`;
    const dest = path.join(ROOT, localRel);

    if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
      process.stdout.write(`  dl ${fileName}... `);
      if (await downloadImage(thumbUrl, dest)) {
        stats.downloaded += 1;
        console.log('ok');
      } else {
        stats.failed += 1;
        console.log('fail');
        delete cache[cacheKey];
        continue;
      }
    } else {
      stats.skipped += 1;
    }

    p.photo = localRel;
    stats.updated += 1;
  }
}

fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2), 'utf8');
raw._meta.playerPhotosLocal = 'assets/players/ (TheSportsDB → Transfermarkt → Wikipedia/Wikidata)';
fs.writeFileSync(SQUADS, JSON.stringify(raw, null, 2), 'utf8');

console.log(
  `\nDone: ${stats.downloaded} new files, ${stats.skipped} cached, ${stats.failed} no photo, ${stats.updated} players updated`,
);
if (Object.keys(stats.bySource).length) {
  console.log('Sources:', stats.bySource);
}
