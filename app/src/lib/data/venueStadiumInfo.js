/**
 * 场馆资料（建成年份、世界杯赛事座席、日常主队）
 * 容量参考 FIFA / 主办城市公开资料，赛事期间可能调整
 * @see https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/stadium-information
 */
export const venueStadiumInfo = {
  'mexico-city': {
    nameEn: 'Estadio Azteca',
    opened: '1966 年（2026 赛前翻新）',
    capacity: '约 7.3–9.0 万',
    home: '墨西哥国家队、美洲俱乐部、蓝十字',
  },
  guadalajara: {
    nameEn: 'Estadio Akron',
    opened: '2010 年',
    capacity: '约 4.4 万',
    home: '瓜达拉哈拉（芝华士）',
  },
  monterrey: {
    nameEn: 'Estadio BBVA',
    opened: '2015 年',
    capacity: '约 5.0 万',
    home: '蒙特雷（老虎大学）',
  },
  toronto: {
    nameEn: 'BMO Field',
    opened: '2007 年（2023–26 扩建）',
    capacity: '约 4.4 万',
    home: '多伦多 FC',
  },
  vancouver: {
    nameEn: 'BC Place',
    opened: '1983 年',
    capacity: '约 4.9 万',
    home: '温哥华白帽、BC 雄狮（CFL）',
  },
  atlanta: {
    nameEn: 'Mercedes-Benz Stadium',
    opened: '2017 年',
    capacity: '约 6.7 万',
    home: '亚特兰大联、亚特兰大猎鹰（NFL）',
  },
  boston: {
    nameEn: 'Gillette Stadium',
    opened: '2002 年',
    capacity: '约 6.4 万',
    home: '新英格兰革命、新英格兰爱国者',
  },
  philadelphia: {
    nameEn: 'Lincoln Financial Field',
    opened: '2003 年',
    capacity: '约 6.6 万',
    home: '费城老鹰（NFL）',
  },
  'new-york': {
    nameEn: 'MetLife Stadium',
    opened: '2010 年',
    capacity: '约 7.9 万',
    home: '纽约巨人、纽约喷气机（NFL）',
  },
  miami: {
    nameEn: 'Hard Rock Stadium',
    opened: '1987 年（2016 年大修）',
    capacity: '约 6.4 万',
    home: '迈阿密海豚、迈阿密国际（部分赛事）',
  },
  houston: {
    nameEn: 'NRG Stadium',
    opened: '2002 年',
    capacity: '约 6.8 万',
    home: '休斯顿德州人（NFL）',
  },
  dallas: {
    nameEn: 'AT&T Stadium',
    opened: '2009 年',
    capacity: '约 7.0 万',
    home: '达拉斯牛仔（NFL）',
  },
  'kansas-city': {
    nameEn: 'Arrowhead Stadium',
    opened: '1972 年',
    capacity: '约 6.8 万',
    home: '堪萨斯城酋长（NFL）',
  },
  'san-francisco': {
    nameEn: "Levi's Stadium",
    opened: '2014 年',
    capacity: '约 6.9 万',
    home: '旧金山 49 人（NFL）',
  },
  'los-angeles': {
    nameEn: 'SoFi Stadium',
    opened: '2020 年',
    capacity: '约 7.0 万',
    home: '洛杉矶公羊、洛杉矶闪电（NFL）',
  },
  seattle: {
    nameEn: 'Lumen Field',
    opened: '2002 年',
    capacity: '约 6.9 万',
    home: '西雅图海湾人、西雅图海鹰（NFL）',
  },
};

/** @param {string} venueId */
export function getVenueStadiumInfo(venueId) {
  return venueStadiumInfo[venueId] ?? null;
}
