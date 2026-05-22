import { OPENFOOTBALL_WC_URL } from '../constants.js';
import { teamZh } from '../teams.js';

const GROUP_LETTERS = 'ABCDEFGHIJKL'.split('');

const KNOCKOUT_ROUNDS = [
  { key: 'r32', round: 'Round of 32', label: '32 强' },
  { key: 'r16', round: 'Round of 16', label: '16 强' },
  { key: 'qf', round: 'Quarter-final', label: '8 强' },
  { key: 'sf', round: 'Semi-final', label: '半决赛' },
  { key: 'third', round: 'Match for third place', label: '季军战' },
  { key: 'final', round: 'Final', label: '决赛' },
];

/** @param {string} code */
export function formatSlotLabel(code) {
  if (!code) return { top: '?', main: '待定', pending: true };

  const w = code.match(/^W(\d+)$/i);
  if (w) return { top: null, main: `第 ${w[1]} 场胜者`, pending: false };

  const l = code.match(/^L(\d+)$/i);
  if (l) return { top: null, main: `第 ${l[1]} 场负者`, pending: false };

  const rankGroup = code.match(/^(\d)([A-L])$/i);
  if (rankGroup) {
    const [, rank, g] = rankGroup;
    return { top: null, main: `${g.toUpperCase()} 组第 ${rank}`, pending: false };
  }

  if (/^\d/.test(code) && /[A-L]/i.test(code) && code.includes('/')) {
    return { top: null, main: `小组第 3（${code}）`, pending: false };
  }

  return { top: null, main: teamZh(code), pending: false };
}

/** @param {{ date?: string, time?: string }} m */
export function formatMatchSchedule(m) {
  if (!m?.date && !m?.time) {
    return { pending: true, top: '?', bottom: '待定' };
  }
  const date = m.date || '';
  let time = m.time || '';
  if (time) {
    const utc = time.match(/UTC([+-]?\d+)/i);
    time = time.replace(/\s*UTC[^ ]*/i, '').trim();
    const bottom = [date, time, utc ? `UTC${utc[1]}` : ''].filter(Boolean).join(' ');
    return { pending: false, top: null, bottom };
  }
  return { pending: false, top: null, bottom: date || '待定' };
}

/** @param {import('../stores/tournament.js').wcGroupTeams} groups */
export function buildGroupColumns(groups) {
  return GROUP_LETTERS.map((letter) => ({
    letter,
    label: `${letter} 组`,
    teams: (groups[letter] || []).map((zh) => ({ main: zh, pending: false, top: null })),
  })).filter((g) => g.teams.length > 0);
}

/** @param {object[]} matches */
function pickRound(matches, roundName) {
  return matches
    .filter((m) => m.round === roundName)
    .sort((a, b) => (a.num || 0) - (b.num || 0))
    .map((m, i) => ({
      id: m.num ?? `${roundName}-${i}`,
      num: m.num,
      home: formatSlotLabel(m.team1),
      away: formatSlotLabel(m.team2),
      schedule: formatMatchSchedule(m),
      ground: m.ground || '',
    }));
}

/** @param {object[]} matches */
export function buildKnockoutColumns(matches) {
  return KNOCKOUT_ROUNDS.map(({ key, round, label }) => ({
    key,
    label,
    matches: pickRound(matches || [], round),
  })).filter((col) => col.matches.length > 0);
}

let bracketCache = null;

export async function fetchBracketSchedule() {
  const res = await fetch(OPENFOOTBALL_WC_URL);
  if (!res.ok) throw new Error('bracket fetch failed');
  const data = await res.json();
  bracketCache = data.matches || [];
  return bracketCache;
}

export function getBracketMatches() {
  return bracketCache || [];
}

/** @param {Record<string, string[]>} groups */
export function updateBracketViews(groups) {
  const matches = getBracketMatches();
  return {
    groups: buildGroupColumns(groups || {}),
    knockout: buildKnockoutColumns(matches),
  };
}
