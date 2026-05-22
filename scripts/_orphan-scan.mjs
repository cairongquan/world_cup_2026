import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = 'g:/world_cup_2026';
const squads = JSON.parse(fs.readFileSync(path.join(ROOT,'data/squads.json'),'utf8'));
const countries = JSON.parse(fs.readFileSync(path.join(ROOT,'data/countries.json'),'utf8'));
function slug(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,60)||'player';}
function teamSlug(t){return slug(countries.teams?.[t]?.nameEn||t);}
const needed = new Set();
for (const [team,t] of Object.entries(squads.teams)){
  for (const k of ['goalkeepers','defenders','midfielders','forwards','keyPlayers']){
    for (const p of t[k]||[]){
      const name = typeof p==='string'?p:p.nameEn;
      needed.add(`${teamSlug(team)}_${slug(name)}.jpg`);
    }
  }
}
const dir = path.join(ROOT,'assets/players');
const files = fs.readdirSync(dir);
const orphan = files.filter(f=>!needed.has(f));
console.log('player files', files.length, 'needed', needed.size, 'orphan', orphan.length);
console.log('orphan sample', orphan.slice(0,20).join('\n'));
