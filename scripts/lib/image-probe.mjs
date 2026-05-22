const UA = 'WorldCup2026-SquadViewer/1.0';

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function probeImageUrl(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'image/*' },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length >= 800;
  } catch {
    return false;
  }
}
