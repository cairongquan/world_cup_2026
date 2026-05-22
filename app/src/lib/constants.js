export const MAPBOX_STYLE_GLOBE = 'mapbox://styles/mapbox/dark-v11';
export const MAPBOX_STYLE_3D = 'mapbox://styles/mapbox/standard';

export const HOST_REGION_BOUNDS = [[-168, 7], [-52, 72]];
/** 全球固定总览（仅影响初始/返回时的全球视图，勿与 3D 缩放混用） */
export const HOST_OVERVIEW = { center: [-100, 42], zoom: 3, pitch: 0, bearing: 0 };
/** 进入场馆 3D 时的镜头参数（与 HOST_OVERVIEW 独立） */
export const STADIUM_VIEW = {
  zoom: 17,
  pitch: 68,
  bearing: -28,
  minZoom: 16,
  maxZoom: 17.5,
};
/** 飞入 3D 动画时长（毫秒） */
export const STADIUM_FLY_MS = 1400;
/** 进入 3D 时 loading 最长等待（毫秒） */
export const STADIUM_LOADING_MAX_MS = 1600;
/** 3D 环绕：仅旋转方位角，度/秒 */
export const STADIUM_ORBIT = {
  degPerSec: 5,
};

export const SPORTSDB_LEAGUE_ID = '4429';
export const SPORTSDB_SEASON = '2026';
export const OPENFOOTBALL_WC_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
export const SPORTSDB_EVENTS_URL = `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${SPORTSDB_LEAGUE_ID}&s=${SPORTSDB_SEASON}`;

export const API_TEAM_ALIASES = {
  'Czech Republic': '捷克',
  Czechia: '捷克',
  'Bosnia-Herzegovina': '波黑',
  'Bosnia and Herzegovina': '波黑',
  'Cape Verde': '佛得角',
  'Ivory Coast': '科特迪瓦',
  "Côte d'Ivoire": '科特迪瓦',
  'United States': '美国',
  USA: '美国',
  'South Korea': '韩国',
  'Korea Republic': '韩国',
  'DR Congo': '刚果(金)',
  'Congo DR': '刚果(金)',
  Curacao: '库拉索',
  Curaçao: '库拉索',
  'Bosnia & Herzegovina': '波黑',
  Türkiye: '土耳其',
  Turkey: '土耳其',
  Algeria: '阿尔及利亚',
  Argentina: '阿根廷',
  Australia: '澳大利亚',
  Austria: '奥地利',
  Belgium: '比利时',
  Brazil: '巴西',
  Canada: '加拿大',
  Colombia: '哥伦比亚',
  Croatia: '克罗地亚',
  Ecuador: '厄瓜多尔',
  Egypt: '埃及',
  England: '英格兰',
  France: '法国',
  Germany: '德国',
  Ghana: '加纳',
  Haiti: '海地',
  Iran: '伊朗',
  Iraq: '伊拉克',
  Japan: '日本',
  Jordan: '约旦',
  Mexico: '墨西哥',
  Morocco: '摩洛哥',
  Netherlands: '荷兰',
  'New Zealand': '新西兰',
  Norway: '挪威',
  Panama: '巴拿马',
  Paraguay: '巴拉圭',
  Portugal: '葡萄牙',
  Qatar: '卡塔尔',
  'Saudi Arabia': '沙特',
  Scotland: '苏格兰',
  Senegal: '塞内加尔',
  'South Africa': '南非',
  Spain: '西班牙',
  Sweden: '瑞典',
  Switzerland: '瑞士',
  Tunisia: '突尼斯',
  Uruguay: '乌拉圭',
  Uzbekistan: '乌兹别克',
};

export const TEAM_ISO = {
  墨西哥: 'mx',
  南非: 'za',
  捷克: 'cz',
  哥伦比亚: 'co',
  乌兹别克: 'uz',
  韩国: 'kr',
  '刚果(金)': 'cd',
  西班牙: 'es',
  乌拉圭: 'uy',
  佛得角: 'cv',
  沙特: 'sa',
  海地: 'ht',
  摩洛哥: 'ma',
  波黑: 'ba',
  加拿大: 'ca',
  瑞士: 'ch',
  巴拿马: 'pa',
  加纳: 'gh',
  科特迪瓦: 'ci',
  德国: 'de',
  克罗地亚: 'hr',
  伊拉克: 'iq',
  塞内加尔: 'sn',
  卡塔尔: 'qa',
  巴拉圭: 'py',
  土耳其: 'tr',
  澳大利亚: 'au',
  约旦: 'jo',
  奥地利: 'at',
  阿尔及利亚: 'dz',
  新西兰: 'nz',
  伊朗: 'ir',
  比利时: 'be',
  美国: 'us',
  巴西: 'br',
  法国: 'fr',
  厄瓜多尔: 'ec',
  英格兰: 'gb-eng',
  苏格兰: 'gb-sct',
  挪威: 'no',
  库拉索: 'cw',
  突尼斯: 'tn',
  日本: 'jp',
  荷兰: 'nl',
  葡萄牙: 'pt',
  瑞典: 'se',
  阿根廷: 'ar',
  埃及: 'eg',
};

export function getMapboxToken() {
  return import.meta.env.VITE_MAPBOX_TOKEN || window.MAPBOX_ACCESS_TOKEN || '';
}
