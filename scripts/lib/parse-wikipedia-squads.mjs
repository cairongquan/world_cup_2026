/** 解析 Wikipedia 2026 FIFA World Cup squads 页面（纯文本/Markdown 表格） */
const POS_MAP = {
  GK: 'goalkeepers',
  DF: 'defenders',
  MF: 'midfielders',
  FW: 'forwards',
};

const SKIP_HEADERS = new Set([
  'Age',
  'Player representation by club',
  'Player representation by club confederation',
  'Coach representation by country',
]);

function cleanPlayerName(raw) {
  return raw
    .replace(/\(captain\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSquadRow(line) {
  if (!line.startsWith('|') || line.includes('---') || /^\|\s*No\./i.test(line)) return null;
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 8) return null;
  const posCell = cells[2];
  const m = posCell.match(/\d\s+(GK|DF|MF|FW)/);
  if (!m) return null;
  const name = cleanPlayerName(cells[3]);
  const club = cells[7]?.trim();
  if (!name) return null;
  return { pos: m[1], name, club };
}

/**
 * @param {string} raw
 * @returns {Array<{ nameEn: string, goalkeepers: string[], defenders: string[], midfielders: string[], forwards: string[], clubs: Record<string,string> }>}
 */
export function parseWikipediaSquads(raw) {
  const blocks = raw.split(/^###\s+/gm).slice(1);
  const teams = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const header = lines[0]?.trim();
    if (!header || SKIP_HEADERS.has(header)) continue;
    if (/^Group\s+[A-L]$/i.test(header)) continue;

    const nameEn = header.trim();
    if (nameEn.length < 3) continue;

    /** @type {Record<string, string[]>} */
    const positions = {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      forwards: [],
    };
    /** @type {Record<string, string>} */
    const clubs = {};

    for (const line of lines) {
      const row = parseSquadRow(line);
      if (!row) continue;
      const key = POS_MAP[row.pos];
      if (!key) continue;
      positions[key].push(row.name);
      if (row.club) clubs[row.name] = row.club;
    }

    const total =
      positions.goalkeepers.length +
      positions.defenders.length +
      positions.midfielders.length +
      positions.forwards.length;

    if (total < 20) continue;

    teams.push({ nameEn, ...positions, clubs, total });
  }

  return teams;
}
