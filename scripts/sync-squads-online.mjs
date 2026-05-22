#!/usr/bin/env node
/**
 * 从 Sky Sports 名单页联网拉取已公布阵容，合并进 data/squads.json（未公布球队保持不动）
 * 用法: node scripts/sync-squads-online.mjs
 * 可选: HTTP_PROXY / HTTPS_PROXY
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchJson } from './lib/http-fetch.mjs';
import { enToZhTeam, zhToSlug } from './lib/team-name-map.mjs';
import { parseSkySportsSquads, inferSquadStatus } from './lib/parse-skysports-squads.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SQUADS = path.join(ROOT, 'data', 'squads.json');
const POSTER_SOURCES = path.join(ROOT, 'data', 'squad-poster-sources.json');
const SNAPSHOT = path.join(ROOT, 'data', 'skysports-squads-snapshot.txt');
const SKY_URL =
  'https://www.skysports.com/football/news/11095/13543070/world-cup-2026-squad-lists-england-scotland-brazil-usa-spain-france-germany-netherlands-argentina-portugal-and-more';

const STATUS_LABEL = {
  final: '正式名单（26人）',
  provisional: '初选大名单',
  pending: '名单待公布',
};

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<h2[^>]*>/gi, '\n## ')
    .replace(/<h3[^>]*>/gi, '\n### ')
    .replace(/<\/h[23]>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

async function fetchSkySportsText() {
  const { setupHttpProxy } = await import('./lib/http-fetch.mjs');
  setupHttpProxy();
  const res = await fetch(SKY_URL, {
    headers: {
      'User-Agent': 'WorldCup2026-SquadViewer/1.0',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`Sky Sports HTTP ${res.status}`);
  const html = await res.text();
  const text = htmlToText(html);
  fs.writeFileSync(SNAPSHOT, text, 'utf8');
  return text;
}

function loadPosterMeta() {
  if (!fs.existsSync(POSTER_SOURCES)) return {};
  return JSON.parse(fs.readFileSync(POSTER_SOURCES, 'utf8')).teams || {};
}

function localPosterPath(zh) {
  const slug = zhToSlug(zh);
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const rel = `assets/squads/${slug}.${ext}`;
    if (fs.existsSync(path.join(ROOT, rel))) return rel;
  }
  return null;
}

function mergeTeam(existing, incoming, zh, posterMeta) {
  const status = inferSquadStatus(incoming);
  const today = new Date().toISOString().slice(0, 10);
  const meta = posterMeta[zh];
  const announcedAt = meta?.announcedAt
    ? `${meta.announcedAt}T12:00:00+08:00`
    : existing?.announcedAt;
  const merged = {
    ...existing,
    coach: incoming.coach || existing?.coach,
    squadStatus: status,
    squadStatusLabel: STATUS_LABEL[status],
    announcedAt,
    note: incoming.provisional
      ? `Sky Sports 初选大名单 · 数据同步 ${today}`
      : `Sky Sports 正式大名单 · 数据同步 ${today}`,
    goalkeepers: incoming.goalkeepers,
    defenders: incoming.defenders,
    midfielders: incoming.midfielders,
    forwards: incoming.forwards,
  };
  const poster = localPosterPath(zh) || existing?.squadPoster;
  if (poster) merged.squadPoster = poster;
  delete merged.keyPlayers;
  return merged;
}

async function main() {
  let raw;
  try {
    console.log('Fetching Sky Sports squad lists…');
    raw = await fetchSkySportsText();
    console.log('Saved snapshot ->', SNAPSHOT);
  } catch (err) {
    console.warn('Fetch failed:', err.message);
    if (fs.existsSync(SNAPSHOT)) {
      raw = fs.readFileSync(SNAPSHOT, 'utf8');
      console.log('Using local snapshot:', SNAPSHOT);
    } else {
      throw new Error('无网络且无本地快照 data/skysports-squads-snapshot.txt');
    }
  }

  const parsed = parseSkySportsSquads(raw);
  const squads = JSON.parse(fs.readFileSync(SQUADS, 'utf8'));
  const posterMeta = loadPosterMeta();
  let updated = 0;
  let skipped = 0;
  const updatedTeams = [];

  for (const team of parsed) {
    const zh = enToZhTeam(team.nameEn);
    if (!zh) {
      console.warn('  未映射队名:', team.nameEn);
      skipped += 1;
      continue;
    }
    if (!squads.teams[zh]) {
      console.warn('  仓库无此队:', zh);
      skipped += 1;
      continue;
    }

    const existing = squads.teams[zh];
    if (existing.squadStatus === 'final' && team.total < 20) {
      console.log('  跳过(已有正式名单且新数据偏少):', zh);
      skipped += 1;
      continue;
    }

    squads.teams[zh] = mergeTeam(existing, team, zh, posterMeta);
    updated += 1;
    updatedTeams.push(zh);
  }

  // 未在 Sky 更新但已有本地海报/公布日的球队，补全元数据
  for (const [zh, team] of Object.entries(squads.teams)) {
    const meta = posterMeta[zh];
    if (meta?.announcedAt && !team.announcedAt) {
      team.announcedAt = `${meta.announcedAt}T12:00:00+08:00`;
    }
    const poster = localPosterPath(zh);
    if (poster) team.squadPoster = poster;
  }

  squads._meta = {
    ...squads._meta,
    lastOnlineSync: new Date().toISOString(),
    onlineSource: SKY_URL,
    note: `已联网合并 Sky Sports 公布名单（${updated} 队）；未公布球队保持原数据`,
  };

  fs.writeFileSync(SQUADS, JSON.stringify(squads, null, 2), 'utf8');
  console.log(`\nUpdated ${updated} teams:`, updatedTeams.join(', ') || '(none)');
  console.log('Skipped / unchanged:', skipped);
  console.log('Next: node scripts/enrich-squads.mjs');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
