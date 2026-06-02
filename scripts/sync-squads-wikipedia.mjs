#!/usr/bin/env node
/**
 * 从 Wikipedia（FIFA 6 月 2 日公布名单）同步全部 48 队正式 26 人大名单
 * 用法: node scripts/sync-squads-wikipedia.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { enToZhTeam } from './lib/team-name-map.mjs';
import { parseWikipediaSquads } from './lib/parse-wikipedia-squads.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SQUADS = path.join(ROOT, 'data', 'squads.json');
const SNAPSHOT = path.join(ROOT, 'data', 'wikipedia-squads-snapshot.txt');
const WIKI_URL = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads';

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
    .replace(/<table[^>]*>/gi, '\n')
    .replace(/<\/table>/gi, '\n')
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<t[hd][^>]*>/gi, '| ')
    .replace(/<\/t[hd]>/gi, ' |')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

async function fetchWikipediaText() {
  const { setupHttpProxy } = await import('./lib/http-fetch.mjs');
  setupHttpProxy();
  const res = await fetch(WIKI_URL, {
    headers: {
      'User-Agent': 'WorldCup2026-SquadViewer/1.0 (educational; contact: local)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`);
  const html = await res.text();
  const text = htmlToText(html);
  fs.writeFileSync(SNAPSHOT, text, 'utf8');
  return text;
}

function mergeTeam(existing, incoming) {
  const today = new Date().toISOString().slice(0, 10);
  const total =
    incoming.goalkeepers.length +
    incoming.defenders.length +
    incoming.midfielders.length +
    incoming.forwards.length;
  const squadStatusLabel =
    total === 26 ? STATUS_LABEL.final : `正式名单（${total}人，待补员）`;
  return {
    ...existing,
    squadStatus: 'final',
    squadStatusLabel,
    note: `Wikipedia / FIFA 正式大名单 · 数据同步 ${today}`,
    announcedAt: existing?.announcedAt || '2026-06-02T12:00:00+08:00',
    goalkeepers: incoming.goalkeepers,
    defenders: incoming.defenders,
    midfielders: incoming.midfielders,
    forwards: incoming.forwards,
  };
}

async function main() {
  let raw;
  try {
    console.log('Fetching Wikipedia squad lists…');
    raw = await fetchWikipediaText();
    console.log('Saved snapshot ->', SNAPSHOT);
  } catch (err) {
    console.warn('Fetch failed:', err.message);
    if (fs.existsSync(SNAPSHOT)) {
      raw = fs.readFileSync(SNAPSHOT, 'utf8');
      console.log('Using local snapshot:', SNAPSHOT);
    } else {
      throw new Error('无网络且无本地快照 data/wikipedia-squads-snapshot.txt');
    }
  }

  const parsed = parseWikipediaSquads(raw);
  const squads = JSON.parse(fs.readFileSync(SQUADS, 'utf8'));
  let updated = 0;
  let skipped = 0;
  const updatedTeams = [];
  const missing = [];

  for (const team of parsed) {
    const zh = enToZhTeam(team.nameEn);
    if (!zh) {
      console.warn('  未映射队名:', team.nameEn);
      skipped += 1;
      continue;
    }
    if (!squads.teams[zh]) {
      console.warn('  仓库无此队:', zh, '<-', team.nameEn);
      skipped += 1;
      continue;
    }
    squads.teams[zh] = mergeTeam(squads.teams[zh], team);
    updated += 1;
    updatedTeams.push(`${zh}(${team.total})`);
  }

  for (const zh of Object.keys(squads.teams)) {
    if (!updatedTeams.some((t) => t.startsWith(zh))) missing.push(zh);
  }

  squads._meta = {
    ...squads._meta,
    lastOnlineSync: new Date().toISOString(),
    onlineSource: WIKI_URL,
    note: `已联网合并 Wikipedia / FIFA 正式 26 人名单（${updated}/48 队）`,
  };

  fs.writeFileSync(SQUADS, JSON.stringify(squads, null, 2), 'utf8');
  console.log(`\nUpdated ${updated} teams from Wikipedia`);
  if (updatedTeams.length) console.log(updatedTeams.join(', '));
  if (missing.length) console.log('Not updated:', missing.join(', '));
  console.log('Skipped:', skipped);
  console.log('Next: node scripts/enrich-squads.mjs');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
