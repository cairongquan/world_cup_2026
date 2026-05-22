import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';
import 'mapbox-gl/dist/mapbox-gl.css';

/** @type {string|undefined} */
const BUNDLED_MAPBOX_TOKEN = typeof __MAPBOX_TOKEN__ !== 'undefined' ? __MAPBOX_TOKEN__ : '';

function hasValidMapboxToken() {
  const t = window.MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || BUNDLED_MAPBOX_TOKEN;
  return (
    typeof t === 'string' &&
    t.length > 20 &&
    !t.includes('你的token') &&
    t.startsWith('pk.')
  );
}

function applyBundledAndEnvToken() {
  if (BUNDLED_MAPBOX_TOKEN && !window.MAPBOX_ACCESS_TOKEN) {
    window.MAPBOX_ACCESS_TOKEN = BUNDLED_MAPBOX_TOKEN;
  }
  const fromEnv = import.meta.env.VITE_MAPBOX_TOKEN;
  if (fromEnv && !window.MAPBOX_ACCESS_TOKEN) {
    window.MAPBOX_ACCESS_TOKEN = fromEnv;
  }
}

async function loadMapboxConfig() {
  applyBundledAndEnvToken();
  if (hasValidMapboxToken()) return;

  try {
    const res = await fetch('/config.js', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const code = await res.text();
    if (!code.includes('MAPBOX_ACCESS_TOKEN')) {
      throw new Error('config.js 格式不正确');
    }
    // eslint-disable-next-line no-new-func
    new Function(code)();
  } catch (err) {
    throw new Error(
      `无法加载 Mapbox 配置（${err.message}）。请在项目根目录创建 config.js，或设置 app/.env.local 中的 VITE_MAPBOX_TOKEN`,
      { cause: 'mapbox' },
    );
  }

  if (!hasValidMapboxToken()) {
    throw new Error(
      'MAPBOX_ACCESS_TOKEN 未设置或为占位符。请编辑根目录 config.js，或配置 VITE_MAPBOX_TOKEN',
      { cause: 'mapbox' },
    );
  }
}

function showBootError(err) {
  const target = document.getElementById('app');
  if (!target) return;
  const isMapbox = err?.cause === 'mapbox' || /mapbox|MAPBOX|config\.js/i.test(String(err?.message || ''));
  const title = isMapbox ? 'Mapbox 未配置' : '应用启动失败';
  console.error(err);
  target.innerHTML = `
    <div style="color:#e8edf5;padding:24px 28px;font-family:sans-serif;max-width:560px;line-height:1.6">
      <p style="color:#f87171;font-weight:600;margin-bottom:12px">${title}</p>
      <p style="color:#8899bb;font-size:14px;margin-bottom:16px;word-break:break-word">${err?.message || err}</p>
      ${
        isMapbox
          ? `<ol style="color:#a8b8d8;font-size:14px;padding-left:20px;margin:0">
        <li style="margin-bottom:8px">复制 <code style="color:#60a5fa">config.example.js</code> 为 <code style="color:#60a5fa">config.js</code>（仓库根目录）</li>
        <li style="margin-bottom:8px">在 <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener" style="color:#60a5fa">Mapbox 控制台</a> 创建 Token 并写入</li>
        <li>保存后重启 <code style="color:#60a5fa">npm run dev</code></li>
      </ol>`
          : `<p style="color:#a8b8d8;font-size:14px">请打开浏览器控制台查看详情，修复后刷新页面。</p>`
      }
    </div>`;
}

const target = document.getElementById('app');

loadMapboxConfig()
  .then(() => {
    try {
      mount(App, { target });
    } catch (err) {
      showBootError(err);
    }
  })
  .catch(showBootError);
