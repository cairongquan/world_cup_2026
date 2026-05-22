#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FLAGS_DIR = path.join(ROOT, 'assets', 'flags');
const DATA_DIR = path.join(ROOT, 'data');

const TEAM_ISO = {
  墨西哥: 'mx', 南非: 'za', 捷克: 'cz', 哥伦比亚: 'co', 乌兹别克: 'uz', 韩国: 'kr',
  '刚果(金)': 'cd', 西班牙: 'es', 乌拉圭: 'uy', 佛得角: 'cv', 沙特: 'sa', 海地: 'ht',
  摩洛哥: 'ma', 波黑: 'ba', 加拿大: 'ca', 瑞士: 'ch', 巴拿马: 'pa', 加纳: 'gh',
  科特迪瓦: 'ci', 德国: 'de', 克罗地亚: 'hr', 伊拉克: 'iq', 塞内加尔: 'sn',
  卡塔尔: 'qa', 巴拉圭: 'py', 土耳其: 'tr', 澳大利亚: 'au', 约旦: 'jo',
  奥地利: 'at', 阿尔及利亚: 'dz', 新西兰: 'nz', 伊朗: 'ir', 比利时: 'be',
  美国: 'us', 巴西: 'br', 法国: 'fr', 厄瓜多尔: 'ec', 英格兰: 'gb-eng',
  苏格兰: 'gb-sct', 挪威: 'no', 库拉索: 'cw', 突尼斯: 'tn', 日本: 'jp',
  荷兰: 'nl', 葡萄牙: 'pt', 瑞典: 'se', 阿根廷: 'ar', 埃及: 'eg',
};

const REST_ISO = { 'gb-eng': 'gb', 'gb-sct': 'gb' };

const CONFEDERATION = {
  mx:'CONCACAF',us:'CONCACAF',ca:'CONCACAF',ht:'CONCACAF',pa:'CONCACAF',cw:'CONCACAF',
  ar:'CONMEBOL',br:'CONMEBOL',ec:'CONMEBOL',uy:'CONMEBOL',py:'CONMEBOL',co:'CONMEBOL',
  de:'UEFA',fr:'UEFA',es:'UEFA','gb-eng':'UEFA','gb-sct':'UEFA',be:'UEFA',nl:'UEFA',
  pt:'UEFA',hr:'UEFA',ch:'UEFA',at:'UEFA',cz:'UEFA',ba:'UEFA',no:'UEFA',se:'UEFA',tr:'UEFA',
  sn:'CAF',ma:'CAF',eg:'CAF',gh:'CAF',ci:'CAF',cv:'CAF',dz:'CAF',tn:'CAF',cd:'CAF',za:'CAF',
  jp:'AFC',kr:'AFC',ir:'AFC',sa:'AFC',qa:'AFC',au:'AFC',uz:'AFC',jo:'AFC',iq:'AFC', nz:'OFC',
};

const DISPLAY_EN = {
  墨西哥:'Mexico',南非:'South Africa',捷克:'Czechia',哥伦比亚:'Colombia',乌兹别克:'Uzbekistan',
  韩国:'South Korea','刚果(金)':'DR Congo',西班牙:'Spain',乌拉圭:'Uruguay',佛得角:'Cape Verde',
  沙特:'Saudi Arabia',海地:'Haiti',摩洛哥:'Morocco',波黑:'Bosnia and Herzegovina',加拿大:'Canada',
  瑞士:'Switzerland',巴拿马:'Panama',加纳:'Ghana',科特迪瓦:'Ivory Coast',德国:'Germany',
  克罗地亚:'Croatia',伊拉克:'Iraq',塞内加尔:'Senegal',卡塔尔:'Qatar',巴拉圭:'Paraguay',
  土耳其:'Türkiye',澳大利亚:'Australia',约旦:'Jordan',奥地利:'Austria',阿尔及利亚:'Algeria',
  新西兰:'New Zealand',伊朗:'Iran',比利时:'Belgium',美国:'United States',巴西:'Brazil',
  法国:'France',厄瓜多尔:'Ecuador',英格兰:'England',苏格兰:'Scotland',挪威:'Norway',
  库拉索:'Curaçao',突尼斯:'Tunisia',日本:'Japan',荷兰:'Netherlands',葡萄牙:'Portugal',
  瑞典:'Sweden',阿根廷:'Argentina',埃及:'Egypt',
};

const FIFA_RANK = {
  阿根廷:1,法国:2,西班牙:3,英格兰:4,巴西:5,葡萄牙:6,荷兰:7,比利时:8,德国:9,克罗地亚:10,
  摩洛哥:11,哥伦比亚:12,乌拉圭:13,美国:14,墨西哥:15,瑞士:16,日本:17,塞内加尔:18,伊朗:19,
  韩国:22,厄瓜多尔:23,奥地利:24,土耳其:25,澳大利亚:26,加拿大:27,挪威:28,埃及:29,巴拿马:30,
  苏格兰:36,科特迪瓦:38,瑞典:39,捷克:41,卡塔尔:42,突尼斯:43,阿尔及利亚:44,伊拉克:45,
  沙特:46,巴拉圭:47,新西兰:50,南非:52,约旦:55,波黑:61,佛得角:63,'刚果(金)':64,乌兹别克:65,海地:68,库拉索:69,
};

const WC_APPEARANCES = {
  阿根廷:18,巴西:22,德国:20,意大利:18,墨西哥:18,法国:16,西班牙:16,英格兰:16,乌拉圭:14,
  比利时:14,瑞士:12,智利:9,瑞典:12,荷兰:11,葡萄牙:8,波兰:9,韩国:11,美国:12,日本:8,
  摩洛哥:6,塞内加尔:3,克罗地亚:6,丹麦:6,哥伦比亚:6,厄瓜多尔:4,伊朗:6,沙特:6,澳大利亚:6,
  加拿大:3,哥斯达黎加:6,突尼斯:6,埃及:3,阿尔及利亚:4,南非:3,加纳:4,科特迪瓦:3,
  喀麦隆:8,尼日利亚:6,安哥拉:1,多哥:1,卡塔尔:2,伊拉克:1,中国:1,新西兰:3,土耳其:2,
  奥地利:7,捷克:1,匈牙利:9,苏格兰:8,挪威:3,威尔士:2,北爱尔兰:3,爱尔兰:3,苏联:7,
  南斯拉夫:8,塞尔维亚:4,波黑:1,斯洛伐克:1,斯洛文尼亚:2,乌克兰:1,俄罗斯:4,
  巴拉圭:8,秘鲁:5,玻利维亚:3,委内瑞拉:0,海地:1,巴拿马:1,库拉索:0,佛得角:0,'刚果(金)':1,约旦:1,乌兹别克:0,
};

const UK_OVERRIDES = {
  英格兰: { capital:'London', population:56000000, latlng:[52.3555,-1.1743], note:'主场国家队；主权国家为英国' },
  苏格兰: { capital:'Edinburgh', population:5500000, latlng:[56.4907,-4.2026], note:'主场国家队；主权国家为英国' },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadFile(url, dest, retries = 4) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'worldcup2026-globe/1.0' },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`${url} -> ${res.status}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      return;
    } catch (e) {
      lastErr = e;
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr;
}

function pickCountryFields(c, zhName, iso) {
  const pop = c.population ?? null;
  const area = c.area ?? null;
  return {
    nameZh: zhName,
    nameEn: DISPLAY_EN[zhName] || c.name?.common,
    nameOfficial: c.name?.official,
    isoCode: iso,
    cca2: c.cca2,
    cca3: c.cca3,
    fifaCode: c.fifa || null,
    capital: Array.isArray(c.capital) ? c.capital[0] : c.capital,
    region: c.region,
    subregion: c.subregion,
    population: pop,
    populationFormatted: pop ? pop.toLocaleString('zh-CN') : null,
    areaKm2: area,
    areaFormatted: area ? `${area.toLocaleString('zh-CN')} km²` : null,
    densityPerKm2: pop && area ? Math.round(pop / area) : null,
    languages: c.languages ? Object.values(c.languages) : [],
    currencies: c.currencies ? Object.entries(c.currencies).map(([code,v])=>({code,name:v.name,symbol:v.symbol})) : [],
    continents: c.continents ?? [],
    latlng: c.latlng ?? null,
    borders: c.borders ?? [],
    timezones: c.timezones ?? [],
    flagEmoji: c.flag ?? null,
    confederation: CONFEDERATION[iso] ?? null,
    fifaRankingEstimate: FIFA_RANK[zhName] ?? null,
    worldCupAppearances: WC_APPEARANCES[zhName] ?? null,
    source: 'restcountries.com v3.1',
    fetchedAt: new Date().toISOString().slice(0,10),
  };
}

async function main() {
  fs.mkdirSync(FLAGS_DIR, { recursive: true });
  console.log('Fetching restcountries...');
  const restCodes = [...new Set(Object.values(TEAM_ISO).map((iso) => (REST_ISO[iso] || iso).toUpperCase()))];
  const res = await fetch(
    `https://restcountries.com/v3.1/alpha?codes=${restCodes.join(',')}`,
    { headers: { 'User-Agent': 'worldcup2026-globe/1.0' } }
  );
  if (!res.ok) throw new Error(`restcountries ${res.status}`);
  const all = await res.json();
  if (!Array.isArray(all)) throw new Error(all.message || 'restcountries invalid response');
  const byCca2 = Object.fromEntries(all.map((c) => [c.cca2.toLowerCase(), c]));

  const flagMapping = { _meta: { description:'2026世界杯参赛队国旗映射', source:'https://flagcdn.com', format:'png', width:320, teamCount:48, generatedAt:new Date().toISOString() }, teams:{} };
  const countriesData = { _meta: { description:'2026世界杯48支参赛队国家信息', sources:['restcountries.com v3.1','FIFA WC2026'], teamCount:48, generatedAt:new Date().toISOString(), note:'fifaRankingEstimate为2025年末近似值' }, teams:{} };

  for (const [zhName, iso] of Object.entries(TEAM_ISO)) {
    const fileBase = iso.replace(/-/g,'_');
    const localFile = `${fileBase}.png`;
    const flagUrl = `https://flagcdn.com/w320/${iso}.png`;
    process.stdout.write(`Download ${zhName}... `);
    let format = 'png';
    let localPath = `assets/flags/${localFile}`;
    try {
      await downloadFile(flagUrl, path.join(FLAGS_DIR, localFile));
    } catch {
      const svg = `${fileBase}.svg`;
      await downloadFile(`https://flagcdn.com/${iso}.svg`, path.join(FLAGS_DIR, svg));
      format = 'svg';
      localPath = `assets/flags/${svg}`;
    }
    console.log('ok');
    await sleep(200);
    flagMapping.teams[zhName] = { iso, nameEn:DISPLAY_EN[zhName], localPath, cdnUrl:`https://flagcdn.com/w320/${iso}.png`, format };

    const restCode = (REST_ISO[iso]||iso).toUpperCase();
    const country = byCca2[restCode.toLowerCase()];
    if (UK_OVERRIDES[zhName] && country) {
      countriesData.teams[zhName] = { ...pickCountryFields(country, zhName, iso), ...UK_OVERRIDES[zhName], isHomeNation:true };
    } else if (country) {
      countriesData.teams[zhName] = pickCountryFields(country, zhName, iso);
    } else {
      countriesData.teams[zhName] = { nameZh:zhName, nameEn:DISPLAY_EN[zhName], isoCode:iso, confederation:CONFEDERATION[iso] };
    }
  }

  flagMapping.list = Object.entries(flagMapping.teams).map(([id,v])=>({id,...v})).sort((a,b)=>a.id.localeCompare(b.id,'zh'));
  countriesData.list = Object.entries(countriesData.teams).map(([id,v])=>({id,...v})).sort((a,b)=>(a.nameZh||'').localeCompare(b.nameZh||'','zh'));

  fs.writeFileSync(path.join(DATA_DIR,'flags-mapping.json'), JSON.stringify(flagMapping,null,2));
  fs.writeFileSync(path.join(DATA_DIR,'countries.json'), JSON.stringify(countriesData,null,2));
  console.log('Written', path.join(DATA_DIR,'flags-mapping.json'), path.join(DATA_DIR,'countries.json'));
  console.log('Flags:', fs.readdirSync(FLAGS_DIR).length, 'files');
}
main().catch(e=>{ console.error(e); process.exit(1); });
