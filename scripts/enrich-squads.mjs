#!/usr/bin/env node
/** 为 squads.json 补充中文名、身价、头像（Transfermarkt / 占位图） */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { lookupPlayer, TM_CDN } from './lib/player-meta.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'data', 'squads.json');
const OUT = IN;
const COUNTRIES = path.join(ROOT, 'data', 'countries.json');
const countries = JSON.parse(fs.readFileSync(COUNTRIES, 'utf8'));

function slug(s) {
  const out = String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return out.slice(0, 60) || 'player';
}

function teamSlug(teamName) {
  const en = countries.teams?.[teamName]?.nameEn || teamName;
  return slug(en);
}

function localPhotoPath(teamName, nameEn) {
  const rel = `assets/players/${teamSlug(teamName)}_${slug(nameEn)}.jpg`;
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs) && fs.statSync(abs).size >= 1000) return rel;
  return null;
}
const PHOTO_CACHE = path.join(ROOT, 'data', 'player-photo-cache.json');
const photoCache = fs.existsSync(PHOTO_CACHE) ? JSON.parse(fs.readFileSync(PHOTO_CACHE, 'utf8')) : {};
const PLAYER_KEYS = ['goalkeepers', 'defenders', 'midfielders', 'forwards', 'keyPlayers'];

function loadPreviousLocalPhotos() {
  const map = new Map();
  if (!fs.existsSync(IN)) return map;
  const prev = JSON.parse(fs.readFileSync(IN, 'utf8'));
  for (const [teamName, team] of Object.entries(prev.teams || {})) {
    for (const key of PLAYER_KEYS) {
      for (const p of team[key] || []) {
        if (!p?.nameEn || !p?.photo?.startsWith('assets/players/')) continue;
        if (fs.existsSync(path.join(ROOT, p.photo))) map.set(`${teamName}::${p.nameEn}`, p.photo);
      }
    }
  }
  return map;
}

const previousPhotos = loadPreviousLocalPhotos();

const TEAM_VALUE_M = {
  墨西哥: 210, 南非: 85, 捷克: 180, 哥伦比亚: 280, 乌兹别克: 38, 韩国: 185,
  '刚果(金)': 120, 西班牙: 1050, 乌拉圭: 420, 佛得角: 28, 沙特: 115, 海地: 32,
  摩洛哥: 360, 波黑: 95, 加拿大: 195, 瑞士: 225, 巴拿马: 48, 加纳: 225,
  科特迪瓦: 385, 德国: 850, 克罗地亚: 285, 伊拉克: 42, 塞内加尔: 290, 卡塔尔: 58,
  巴拉圭: 135, 土耳其: 460, 澳大利亚: 98, 约旦: 28, 奥地利: 325, 阿尔及利亚: 185,
  新西兰: 38, 伊朗: 95, 比利时: 450, 美国: 360, 巴西: 1100, 法国: 1280,
  厄瓜多尔: 225, 英格兰: 1300, 苏格兰: 185, 挪威: 355, 库拉索: 30, 突尼斯: 68,
  日本: 185, 荷兰: 750, 葡萄牙: 820, 瑞典: 425, 阿根廷: 950, 埃及: 125,
};

function formatValueWan(wan) {
  if (!wan || wan <= 0) return '—';
  if (wan >= 10000) return `${(wan / 10000).toFixed(2)}亿欧元`;
  return `${wan}万欧元`;
}

function formatTeamValue(million) {
  if (million >= 100) return `${(million / 100).toFixed(2)}亿欧元`;
  return `${million}万欧元`;
}

function photoUrl(info, nameEn) {
  if (info?.tm) return `${TM_CDN}/${info.tm}.jpg`;
  const label = encodeURIComponent(info?.zh || nameEn);
  return `https://ui-avatars.com/api/?name=${label}&background=1e3a5f&color=e8edf5&size=128&bold=true`;
}

function toPlayer(nameEn, teamName) {
  const info = lookupPlayer(nameEn);
  const nameZh = info?.zh || nameEn;
  const clubZh = info?.club || '';
  const valueWan = info?.v || 0;
  const cached = teamName ? photoCache[`${teamName}::${nameEn}`] : null;
  const cachedThumb = typeof cached === 'string' ? cached : cached?.url || null;
  const prevLocal =
    (teamName && previousPhotos.get(`${teamName}::${nameEn}`)) ||
    (teamName ? localPhotoPath(teamName, nameEn) : null);
  let photo = prevLocal || cachedThumb || photoUrl(info, nameEn);
  if (photo.startsWith('assets/players/')) {
    const local = path.join(ROOT, photo);
    if (!fs.existsSync(local)) photo = photoUrl(info, nameEn);
  }
  return {
    nameZh,
    nameEn,
    clubZh,
    valueZh: formatValueWan(valueWan),
    valueWan,
    photo,
  };
}

function enrichList(arr, teamName) {
  if (!arr?.length) return [];
  return arr.map((item) => {
    const nameEn = typeof item === 'string' ? item : item?.nameEn;
    return nameEn ? toPlayer(nameEn, teamName) : item;
  });
}

const raw = JSON.parse(fs.readFileSync(IN, 'utf8'));

for (const [teamName, team] of Object.entries(raw.teams)) {
  team.marketValueZh = formatTeamValue(TEAM_VALUE_M[teamName] || 80);
  team.marketValueMillion = TEAM_VALUE_M[teamName] || 80;
  for (const key of ['goalkeepers', 'defenders', 'midfielders', 'forwards', 'keyPlayers']) {
    if (team[key]) team[key] = enrichList(team[key], teamName);
  }
  // squadPoster 由 sync-squads-online 写入，enrich 不覆盖
}

raw._meta.playerFormat = 'nameZh, clubZh, valueZh, photo';
raw._meta.valueSource = 'Transfermarkt 身价估算（2025-26）';
raw._meta.generatedAt = new Date().toISOString();

fs.writeFileSync(OUT, JSON.stringify(raw, null, 2), 'utf8');
console.log('Enriched', Object.keys(raw.teams).length, 'teams ->', OUT);
