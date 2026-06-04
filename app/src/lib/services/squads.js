import { get } from 'svelte/store';
import { squadsData } from '../stores/squads.js';
import { flagPath } from '../flags.js';

export async function loadSquads() {
  try {
    const res = await fetch('/world_cup_2026/data/squads.json');
    const d = await res.json();
    squadsData.set(d.teams);
  } catch {
    console.warn('阵容数据加载失败');
  }
}

export function fixPlayerPhotoUrl(url) {
  if (!url) return url;
  return url
    .replace('img.a.transfermarkt.technology/portrait/medium', 'tmssl.akamaized.net/images/portrait/medium')
    .replace('img.a.transfermarkt.technology/portrait/header', 'tmssl.akamaized.net/images/portrait/header');
}

export function getSquad(teamName) {
  return get(squadsData)?.[teamName] ?? null;
}

export function getFlagSrc(name) {
  return flagPath(name);
}
