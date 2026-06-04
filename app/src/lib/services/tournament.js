import { get } from 'svelte/store';
import {
  OPENFOOTBALL_WC_URL,
  SPORTSDB_EVENTS_URL,
  API_TEAM_ALIASES,
} from '../constants.js';
import { setEnToZhFromCountries, teamZh } from '../teams.js';
import { setFlagMapping } from '../flags.js';
import {
  wcGroupTeams,
  wcEvents,
  standingsUpdated,
  liveUpdated,
  liveCountLabel,
  standingsGroups,
  liveMatches,
} from '../stores/tournament.js';
import { fetchBracketSchedule, updateBracketViews } from './bracket.js';
import { bracketGroups, bracketKnockout } from '../stores/bracket.js';

let wcGroupLookup = {};

function parseGroupsFromOpenFootball(matches) {
  const groups = {};
  (matches || []).forEach((m) => {
    if (!m.group || !/^Group /i.test(m.group)) return;
    const letter = m.group.replace(/^Group\s+/i, '').trim();
    if (!groups[letter]) groups[letter] = new Set();
    if (m.team1 && !/^W\d+/i.test(m.team1)) groups[letter].add(m.team1);
    if (m.team2 && !/^W\d+/i.test(m.team2)) groups[letter].add(m.team2);
  });
  const out = {};
  'ABCDEFGHIJKL'.split('').forEach((g) => {
    out[g] = [...(groups[g] || [])].map(teamZh).sort((a, b) => a.localeCompare(b, 'zh'));
  });
  return out;
}

function buildGroupLookup(matches) {
  const lookup = {};
  (matches || []).forEach((m) => {
    if (!m.group || !/^Group /i.test(m.group)) return;
    const letter = m.group.replace(/^Group\s+/i, '').trim();
    const key = [m.team1, m.team2].sort().join('|');
    lookup[key] = letter;
  });
  return lookup;
}

function findGroupForTeams(homeEn, awayEn, groups) {
  const h = teamZh(homeEn);
  const a = teamZh(awayEn);
  for (const [g, teams] of Object.entries(groups)) {
    if (teams.includes(h) && teams.includes(a)) return g;
  }
  return null;
}

function initStandingsTables(groups) {
  const tables = {};
  Object.entries(groups).forEach(([g, teams]) => {
    tables[g] = {};
    teams.forEach((zh) => {
      tables[g][zh] = { played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
    });
  });
  return tables;
}

function applyMatchToStandings(tables, groups, homeEn, awayEn, hs, as) {
  const g = findGroupForTeams(homeEn, awayEn, groups);
  if (!g) return;
  const home = teamZh(homeEn);
  const away = teamZh(awayEn);
  const rowH = tables[g]?.[home];
  const rowA = tables[g]?.[away];
  if (!rowH || !rowA || hs == null || as == null) return;

  rowH.played += 1;
  rowA.played += 1;
  rowH.gf += hs;
  rowH.ga += as;
  rowA.gf += as;
  rowA.ga += hs;

  if (hs > as) {
    rowH.win += 1;
    rowA.loss += 1;
    rowH.pts += 3;
  } else if (hs < as) {
    rowA.win += 1;
    rowH.loss += 1;
    rowA.pts += 3;
  } else {
    rowH.draw += 1;
    rowA.draw += 1;
    rowH.pts += 1;
    rowA.pts += 1;
  }
}

function sortStandingsRows(rows) {
  return rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });
}

function computeStandings(groups, events) {
  const tables = initStandingsTables(groups);
  events.forEach((ev) => {
    const hs = ev.intHomeScore != null && ev.intHomeScore !== '' ? Number(ev.intHomeScore) : null;
    const as = ev.intAwayScore != null && ev.intAwayScore !== '' ? Number(ev.intAwayScore) : null;
    if (hs == null || as == null) return;
    const status = (ev.strStatus || '').toLowerCase();
    if (status.includes('not') || status === 'ns' || status === 'scheduled') return;
    applyMatchToStandings(tables, groups, ev.strHomeTeam, ev.strAwayTeam, hs, as);
  });
  return tables;
}

function buildStandingsView(groups, tables) {
  const letters = 'ABCDEFGHIJKL'.split('');
  const result = [];
  letters.forEach((g) => {
    const teams = groups[g] || [];
    if (!teams.length) return;
    const rows = sortStandingsRows(
      teams.map((zh) => {
        const s = tables[g][zh] || { played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 };
        return { zh, ...s };
      }),
    ).map((r, i) => ({ ...r, rank: i + 1 }));
    result.push({ letter: g, rows });
  });
  return result;
}

function isLiveStatus(status) {
  const s = (status || '').toLowerCase();
  return /live|1h|2h|ht|et|pen|half|progress|playing/.test(s) && !/not/.test(s);
}

function isFinishedStatus(status) {
  const s = (status || '').toLowerCase();
  return /finished|ft|aet|match finished|full time/.test(s);
}

function formatEventTime(ev) {
  if (ev.strTimeLocal) return ev.strTimeLocal.slice(0, 5);
  if (ev.strTime) return ev.strTime.slice(0, 5);
  return '';
}

function statusLabel(ev) {
  if (isLiveStatus(ev.strStatus)) return { text: '进行中', live: true };
  if (isFinishedStatus(ev.strStatus)) return { text: '已结束', live: false };
  return { text: ev.strStatus || '未开始', live: false };
}

function buildLiveView(events) {
  const today = new Date().toISOString().slice(0, 10);
  const live = events.filter((e) => isLiveStatus(e.strStatus));
  const todayAll = events
    .filter((e) => e.dateEvent === today)
    .sort((a, b) => (a.strTimestamp || '').localeCompare(b.strTimestamp || ''));
  const upcoming = events
    .filter((e) => e.dateEvent >= today && !isFinishedStatus(e.strStatus) && !isLiveStatus(e.strStatus))
    .sort((a, b) => (a.strTimestamp || '').localeCompare(b.strTimestamp || ''))
    .slice(0, 6);

  const show = live.length ? live : todayAll.length ? todayAll : upcoming;

  return {
    countLabel: live.length ? `${live.length} 场` : '—',
    matches: show.map((ev) => {
      const st = statusLabel(ev);
      return {
        live: st.live,
        metaLeft: `${ev.dateEvent} ${formatEventTime(ev)}${ev.strGroup ? ` 小组 ${ev.strGroup}` : ''}`,
        statusText: st.text,
        home: teamZh(ev.strHomeTeam),
        away: teamZh(ev.strAwayTeam),
        homeScore: ev.intHomeScore != null && ev.intHomeScore !== '' ? ev.intHomeScore : '–',
        awayScore: ev.intAwayScore != null && ev.intAwayScore !== '' ? ev.intAwayScore : '–',
        venue: ev.strVenue || '',
      };
    }),
  };
}

function setTimestamp(store) {
  const t = new Date();
  store.set(
    `更新 ${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`,
  );
}

async function fetchWcEvents() {
  const res = await fetch(SPORTSDB_EVENTS_URL);
  if (!res.ok) throw new Error('events fetch failed');
  const data = await res.json();
  const events = data.events || [];
  events.forEach((ev) => {
    if (ev.strGroup) return;
    const key = [ev.strHomeTeam, ev.strAwayTeam].sort().join('|');
    if (wcGroupLookup[key]) ev.strGroup = wcGroupLookup[key];
  });
  wcEvents.set(events);
  return events;
}

async function fetchWcGroups() {
  const res = await fetch(OPENFOOTBALL_WC_URL);
  if (!res.ok) throw new Error('groups fetch failed');
  const data = await res.json();
  const groups = parseGroupsFromOpenFootball(data.matches);
  wcGroupLookup = buildGroupLookup(data.matches);
  wcGroupTeams.set(groups);
  return groups;
}

export function updateTournamentViews() {
  const groups = get(wcGroupTeams);
  const events = get(wcEvents);
  const tables = computeStandings(groups, events);
  standingsGroups.set(buildStandingsView(groups, tables));
  const live = buildLiveView(events);
  liveCountLabel.set(live.countLabel);
  liveMatches.set(live.matches);
}

export async function refreshTournamentData() {
  try {
    await Promise.all([fetchWcGroups(), fetchWcEvents(), fetchBracketSchedule()]);
    updateTournamentViews();
    const bracket = updateBracketViews(get(wcGroupTeams));
    bracketGroups.set(bracket.groups);
    bracketKnockout.set(bracket.knockout);
    setTimestamp(standingsUpdated);
    setTimestamp(liveUpdated);
  } catch (err) {
    console.warn('赛况数据加载失败', err);
    standingsGroups.set([]);
    liveMatches.set([]);
    liveCountLabel.set('—');
  }
}

export async function initTournamentBootstrap() {
  await Promise.all([
    fetch('/world_cup_2026/data/countries.json')
      .then((r) => r.json())
      .then((d) => setEnToZhFromCountries(d.teams))
      .catch(() => {}),
    fetch('/world_cup_2026/data/flags-mapping.json')
      .then((r) => r.json())
      .then((d) => {
        const mapping = {};
        Object.entries(d.teams || {}).forEach(([zh, info]) => {
          if (!info?.iso) return;
          mapping[zh] = info.cdnUrl || `https://flagcdn.com/w80/${info.iso}.png`;
        });
        setFlagMapping(mapping);
      })
      .catch(() => {}),
  ]);
  await refreshTournamentData();
}
