#!/usr/bin/env node
/**
 * 从懂球帝报道页抓取大名单公布海报（CONVOCAÇÃO 风格长图）到 assets/squads/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { zhToSlug } from './lib/team-name-map.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = path.join(ROOT, 'data', 'squad-poster-sources.json');
const OUT_DIR = path.join(ROOT, 'assets', 'squads');
const UA = 'WorldCup2026-SquadViewer/1.0';

function pickPosterUrl(html) {
  const urls = [...html.matchAll(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi)]
    .map((m) => m[0].replace(/\\u002F/g, '/'))
    .filter((u) => !/logo|icon|avatar|apple-touch|emoji|1x1/i.test(u));

  const scored = urls.map((u) => {
    let score = 0;
    if (/qunliao|fastdfs|dongqiudi|bdimg/i.test(u)) score += 5;
    if (/720x|1080|large|origin/i.test(u)) score += 3;
    if (/\.png$/i.test(u)) score += 1;
    return { u, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.u || null;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function downloadPoster(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: 'https://www.dongqiudi.com/' },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`img HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error('image too small');
  fs.writeFileSync(dest, buf);
}

async function posterFromDongqiudiArticle(articleId) {
  const html = await fetchHtml(`https://m.dongqiudi.com/article/${articleId}.html`);
  const url = pickPosterUrl(html);
  if (!url) throw new Error('no poster image in article');
  return url;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const cfg = JSON.parse(fs.readFileSync(SOURCES, 'utf8'));
  const force = new Set(
    process.argv
      .slice(2)
      .filter((a) => !a.startsWith('-'))
      .flatMap((a) => a.split(',').map((s) => s.trim()).filter(Boolean)),
  );

  for (const [zh, meta] of Object.entries(cfg.teams || {})) {
    const slug = zhToSlug(zh);
    const ext = fs.existsSync(path.join(OUT_DIR, `${slug}.png`)) ? 'png' : 'jpg';
    const dest = path.join(OUT_DIR, `${slug}.${ext}`);
    const forced = force.has(slug) || force.has(zh);
    if (!forced && fs.existsSync(dest) && fs.statSync(dest).size > 20000) {
      console.log('  skip (exists):', zh, dest);
      continue;
    }
    if (!meta.posterUrl && !meta.dongqiudiArticle) {
      console.log('  skip (no source):', zh);
      continue;
    }
    try {
      const imgUrl =
        meta.posterUrl ||
        (await posterFromDongqiudiArticle(meta.dongqiudiArticle));
      await downloadPoster(imgUrl, dest);
      console.log('  ok:', zh, '->', path.relative(ROOT, dest));
    } catch (e) {
      console.warn('  fail:', zh, e.message);
    }
  }
  console.log('\nRun: node scripts/apply-squad-posters.mjs');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
