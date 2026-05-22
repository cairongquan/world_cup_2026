#!/usr/bin/env node
/**
 * 为 squads 中缺中文名的球员拉取 Wikidata / 中文维基标签，写入 data/player-zh-extra.json
 *
 * 需要代理时（Wikidata / 维基在国内常需代理）：
 *   $env:HTTP_PROXY="http://127.0.0.1:7897"
 *   $env:HTTPS_PROXY="http://127.0.0.1:7897"
 *   node scripts/sync-player-zh.mjs
 *   node scripts/sync-player-zh.mjs --delay 1500   # 每名球员间隔 1.5s
 *   $env:ZH_SYNC_DELAY_MS="1200"                   # 同上，环境变量
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { norm, lookupPlayer } from './lib/player-meta.mjs';
import { fetchJson, setupHttpProxy } from './lib/http-fetch.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SQUADS = path.join(ROOT, 'data', 'squads.json');
const OUT = path.join(ROOT, 'data', 'player-zh-extra.json');
const PLAYER_KEYS = ['goalkeepers', 'defenders', 'midfielders', 'forwards', 'keyPlayers'];

function parseDelayMs() {
  const i = process.argv.indexOf('--delay');
  if (i !== -1 && process.argv[i + 1]) return Math.max(0, Number(process.argv[i + 1]) || 0);
  return Math.max(0, Number(process.env.ZH_SYNC_DELAY_MS || 1000));
}

/** 每名球员处理完后的间隔（默认 1s，防 Wikidata 限流） */
const DELAY = parseDelayMs();
/** 同一球员内多次 API 调用之间的间隔（默认 500ms） */
const API_DELAY = Math.max(0, Number(process.env.ZH_API_DELAY_MS || 500));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isLatinOnly(s) {
  return !s || /^[A-Za-z0-9\s\-'.·]+$/.test(s);
}

function collectNames(squads) {
  const set = new Set();
  for (const team of Object.values(squads.teams || {})) {
    for (const key of PLAYER_KEYS) {
      for (const p of team[key] || []) {
        const nameEn = typeof p === 'string' ? p : p?.nameEn;
        if (!nameEn) continue;
        const zh = typeof p === 'string' ? p : p?.nameZh;
        if (lookupPlayer(nameEn)?.zh) continue;
        if (!isLatinOnly(zh) && zh !== nameEn) continue;
        set.add(nameEn);
      }
    }
  }
  return [...set].sort();
}

async function wikidataApi(params) {
  if (API_DELAY > 0) await sleep(API_DELAY);
  const qs = new URLSearchParams({ format: 'json', ...params });
  return fetchJson(`https://www.wikidata.org/w/api.php?${qs}`, { timeout: 25000, retries: 4 });
}

async function wikidataSearch(nameEn) {
  const data = await wikidataApi({
    action: 'wbsearchentities',
    search: nameEn,
    language: 'zh',
    uselang: 'zh',
    type: 'item',
    limit: '8',
  });

  const items = data.search || [];
  const footballish = (d) => {
    const dlc = (d || '').toLowerCase();
    return (
      dlc.includes('football') ||
      dlc.includes('soccer') ||
      dlc.includes('足球') ||
      dlc.includes('association football') ||
      dlc.includes('player')
    );
  };

  for (const item of items) {
    if (!item.label || isLatinOnly(item.label)) continue;
    if (footballish(item.description)) {
      return { zh: item.label, source: 'wikidata', id: item.id };
    }
  }

  const best = items.find((item) => item.id && item.label && !isLatinOnly(item.label));
  if (!best) return null;

  try {
    const ent = await wikidataApi({
      action: 'wbgetentities',
      ids: best.id,
      props: 'labels',
      languages: 'zh',
    });
    const zhLabel = ent.entities?.[best.id]?.labels?.zh?.value;
    if (zhLabel && !isLatinOnly(zhLabel)) {
      return { zh: zhLabel, source: 'wikidata-label', id: best.id };
    }
  } catch {
    /* 限流时退回搜索标签 */
  }

  if (!isLatinOnly(best.label)) {
    return { zh: best.label, source: 'wikidata', id: best.id };
  }
  return null;
}

async function zhWikiSearch(nameEn) {
  if (API_DELAY > 0) await sleep(API_DELAY);
  const data = await fetchJson(
    `https://zh.wikipedia.org/w/api.php?${new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `${nameEn} 足球运动员`,
      format: 'json',
      srlimit: '3',
      utf8: '1',
    })}`,
    { timeout: 25000, retries: 4 },
  );

  for (const hit of data.query?.search || []) {
    const title = hit.title?.replace(/（.*?）|\(.*?\)/g, '').trim();
    if (title && !isLatinOnly(title) && title.length <= 16) {
      return { zh: title, source: 'zhwiki' };
    }
  }
  return null;
}

async function resolveZh(nameEn) {
  try {
    const wd = await wikidataSearch(nameEn);
    if (wd) return wd;
  } catch (e) {
    if (!process.env.HTTP_PROXY && !process.env.HTTPS_PROXY) {
      throw new Error(
        `${e.message}（提示：可设置 HTTP_PROXY / HTTPS_PROXY，例如 http://127.0.0.1:7897）`,
      );
    }
    throw e;
  }
  return zhWikiSearch(nameEn);
}

async function main() {
  const usingProxy = setupHttpProxy();
  if (usingProxy) {
    console.log(`使用代理: ${process.env.HTTPS_PROXY || process.env.HTTP_PROXY}`);
  } else {
    console.warn(
      '未检测到 HTTP_PROXY / HTTPS_PROXY。若 Wikidata 请求失败，请先设置代理，例如：\n' +
        '  $env:HTTP_PROXY="http://127.0.0.1:7897"\n' +
        '  $env:HTTPS_PROXY="http://127.0.0.1:7897"',
    );
  }

  if (process.argv.includes('--probe')) {
    const hit = await resolveZh('Son Heung-min');
    console.log('探测结果:', hit);
    return;
  }

  const squads = JSON.parse(fs.readFileSync(SQUADS, 'utf8'));
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const names = collectNames(squads);
  const limit = process.argv.includes('--all') ? names.length : Number(process.env.ZH_SYNC_LIMIT || names.length);
  const slice = names.slice(0, limit);

  console.log(`待同步中文名: ${slice.length} / ${names.length}`);
  console.log(`请求间隔: 球员 ${DELAY}ms，API ${API_DELAY}ms（可用 --delay / ZH_SYNC_DELAY_MS 调整）`);

  let ok = 0;
  let miss = 0;
  for (let i = 0; i < slice.length; i += 1) {
    const nameEn = slice[i];
    const key = norm(nameEn);
    if (existing[key]?.zh && !isLatinOnly(existing[key].zh)) {
      process.stdout.write(`[${i + 1}/${slice.length}] skip ${nameEn}\n`);
      continue;
    }
    process.stdout.write(`[${i + 1}/${slice.length}] ${nameEn} ... `);
    try {
      const hit = await resolveZh(nameEn);
      if (hit?.zh) {
        existing[key] = { zh: hit.zh, nameEn, source: hit.source };
        ok += 1;
        console.log(hit.zh);
      } else {
        miss += 1;
        console.log('—');
      }
    } catch (e) {
      miss += 1;
      console.log('err', e.message);
    }
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(OUT, JSON.stringify(existing, null, 2), 'utf8');
    }
    if (i < slice.length - 1 && DELAY > 0) await sleep(DELAY);
  }

  fs.writeFileSync(OUT, JSON.stringify(existing, null, 2), 'utf8');
  console.log(`\n完成: ${ok} 已译, ${miss} 保留英文, 写入 ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
