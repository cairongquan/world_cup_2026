/** 格式化大名单公布时间（ISO 或 YYYY-MM-DD） */
export function formatSquadAnnouncedAt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}年${Number(m[2])}月${Number(m[3])}日公布`;
    return iso;
  }
  const s = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(d);
  return `${s}公布`;
}
