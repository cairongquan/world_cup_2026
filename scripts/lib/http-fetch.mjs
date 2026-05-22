/**
 * 带代理支持的 fetch（Node 22+）
 * 使用前设置：HTTP_PROXY / HTTPS_PROXY，例如 http://127.0.0.1:7897
 */
const DEFAULT_UA =
  'WorldCup2026-SquadViewer/1.0 (local squad data; contact: local-dev)';

let proxyReady = false;

/** 启用环境变量中的 HTTP(S)_PROXY */
export function setupHttpProxy() {
  if (proxyReady) return Boolean(process.env.HTTP_PROXY || process.env.HTTPS_PROXY);
  proxyReady = true;

  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxy) return false;

  process.env.NODE_USE_ENV_PROXY = '1';
  return true;
}

/**
 * @param {string} url
 * @param {{ headers?: Record<string,string>, timeout?: number, retries?: number }} [opts]
 */
export async function fetchJson(url, opts = {}) {
  setupHttpProxy();

  const timeout = opts.timeout ?? 30000;
  const retries = opts.retries ?? 2;
  const headers = { 'User-Agent': DEFAULT_UA, Accept: 'application/json', ...opts.headers };

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(timeout),
      });
      const text = await res.text();
      const ctype = res.headers.get('content-type') || '';

      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
        err.status = res.status;
        throw err;
      }
      if (!ctype.includes('json') && text.trimStart().startsWith('<')) {
        throw new Error('响应为 HTML 而非 JSON（可能被限流或需代理）');
      }
      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const waitMs = lastErr?.status === 429 ? 10000 * (attempt + 1) : 400 * (attempt + 1);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
  }
  throw lastErr;
}
