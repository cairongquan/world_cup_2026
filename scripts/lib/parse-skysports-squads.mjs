/** 解析 Sky Sports 世界杯名单页纯文本/Markdown */
const POS_KEYS = {
  goalkeepers: /^goalkeepers?\s*:/i,
  defenders: /^defenders?\s*:/i,
  midfielders: /^midfielders?\s*:/i,
  forwards: /^forwards?\s*:/i,
};

function isTba(text) {
  return /^to be announced/i.test(text.trim());
}

/** @param {string} segment */
export function parsePlayerNames(segment) {
  if (!segment || isTba(segment)) return [];
  const body = segment.includes(':') ? segment.slice(segment.indexOf(':') + 1).trim() : segment.trim();
  if (!body || isTba(body)) return [];
  const parts = body.split(/,(?=\s*[A-ZÀ-ÿ])/);
  const names = [];
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    const name = part
      .replace(/\s*\([^)]*\)\s*\.?\s*$/, '')
      .replace(/\s*;+\s*$/, '')
      .trim();
    if (name && !/^manager\s*:/i.test(name)) names.push(name);
  }
  return names;
}

/**
 * @param {string} raw
 * @returns {Array<{ nameEn: string, provisional: boolean, coach?: string, goalkeepers: string[], defenders: string[], midfielders: string[], forwards: string[] }>}
 */
export function parseSkySportsSquads(raw) {
  const blocks = raw.split(/^###\s+/gm).slice(1);
  const teams = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const header = lines[0];
    if (/^group\s+[a-l]\s+squads$/i.test(header)) continue;

    const provisional = /\(preliminary\)/i.test(header);
    const nameEn = header.replace(/\s*\((preliminary|Preliminary)\)\s*$/i, '').trim();
    if (!nameEn || nameEn.length < 3) continue;
    if (/^also see|^group\s/i.test(nameEn)) continue;

    /** @type {Record<string, string[]>} */
    const positions = {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: [],
    };
    let coach;
    let skipTeam = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^manager\s*:/i.test(line)) {
        coach = line.replace(/^manager\s*:\s*/i, '').trim();
        continue;
      }
      if (/^also see|^\- \[/i.test(line)) continue;

      let matched = false;
      for (const [key, re] of Object.entries(POS_KEYS)) {
        if (re.test(line)) {
          matched = true;
          const players = parsePlayerNames(line);
          if (players.length) positions[key] = players;
          else if (isTba(line)) skipTeam = true;
          break;
        }
      }
      if (!matched && /^to be announced/i.test(line)) {
        skipTeam = true;
      }
    }

    const total =
      positions.goalkeepers.length +
      positions.defenders.length +
      positions.midfielders.length +
      positions.forwards.length;

    if (skipTeam && total === 0) continue;
    if (total === 0) continue;

    teams.push({
      nameEn,
      provisional,
      coach,
      ...positions,
      total,
    });
  }

  return teams;
}

export function inferSquadStatus(team) {
  if (team.provisional || team.total > 28) return 'provisional';
  if (team.total >= 20 && team.total <= 28) return 'final';
  if (team.total >= 12) return 'provisional';
  return 'provisional';
}
