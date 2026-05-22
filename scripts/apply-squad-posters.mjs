#!/usr/bin/env node
/** 将 assets/squads 海报与公布时间写入 data/squads.json */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { zhToSlug } from './lib/team-name-map.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SQUADS = path.join(ROOT, 'data', 'squads.json');
const SOURCES = path.join(ROOT, 'data', 'squad-poster-sources.json');
const POSTER_DIR = path.join(ROOT, 'assets', 'squads');

function findLocalPoster(slug) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const rel = `assets/squads/${slug}.${ext}`;
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs) && fs.statSync(abs).size > 8000) return rel;
  }
  return null;
}

function parseAnnouncedFromNote(note) {
  if (!note) return null;
  const m = note.match(/(\d{4}-\d{2}-\d{2})/);
  return m?.[1] || null;
}

const sources = JSON.parse(fs.readFileSync(SOURCES, 'utf8'));
const squads = JSON.parse(fs.readFileSync(SQUADS, 'utf8'));
let applied = 0;

for (const [zh, team] of Object.entries(squads.teams)) {
  const meta = sources.teams?.[zh];
  const slug = zhToSlug(zh);
  const poster = findLocalPoster(slug);
  const announcedAt =
    meta?.announcedAt ||
    team.announcedAt ||
    parseAnnouncedFromNote(team.note) ||
    null;

  if (announcedAt) {
    team.announcedAt = announcedAt.includes('T') ? announcedAt : `${announcedAt}T12:00:00+08:00`;
  }
  if (poster) {
    team.squadPoster = poster;
    applied += 1;
  }
}

squads._meta.posterDir = 'assets/squads';
fs.writeFileSync(SQUADS, JSON.stringify(squads, null, 2), 'utf8');
console.log(`Applied posters to ${applied} teams -> ${SQUADS}`);
