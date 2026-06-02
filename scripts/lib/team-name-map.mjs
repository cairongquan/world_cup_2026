import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COUNTRIES = path.join(ROOT, 'data', 'countries.json');

/** Sky Sports / FIFA 英文名 → 中文队名 */
const EXTRA = {
  'Czech Republic': '捷克',
  Czechia: '捷克',
  'South Korea': '韩国',
  'DR Congo': '刚果(金)',
  'Ivory Coast': '科特迪瓦',
  "Côte d'Ivoire": '科特迪瓦',
  Curacao: '库拉索',
  Curaçao: '库拉索',
  'United States': '美国',
  USA: '美国',
  'Saudi Arabia': '沙特',
  'Bosnia and Herzegovina': '波黑',
  'Bosnia-Herzegovina': '波黑',
  'Cape Verde': '佛得角',
  'New Zealand': '新西兰',
  Türkiye: '土耳其',
  Turkey: '土耳其',
  Netherlands: '荷兰',
  'South Africa': '南非',
};

let cache;

export function buildTeamNameMap() {
  if (cache) return cache;
  const countries = JSON.parse(fs.readFileSync(COUNTRIES, 'utf8'));
  const map = new Map();
  for (const [zh, info] of Object.entries(countries.teams || {})) {
    if (info.nameEn) map.set(info.nameEn, zh);
    map.set(zh, zh);
  }
  for (const [en, zh] of Object.entries(EXTRA)) map.set(en, zh);
  cache = map;
  return map;
}

export function enToZhTeam(name) {
  const map = buildTeamNameMap();
  const trimmed = name.replace(/\s*\((preliminary|Preliminary)\)\s*$/i, '').trim();
  return map.get(trimmed) || null;
}

export function zhToSlug(zh) {
  const countries = JSON.parse(fs.readFileSync(COUNTRIES, 'utf8'));
  const en = countries.teams?.[zh]?.nameEn || zh;
  return String(en)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60) || 'team';
}
