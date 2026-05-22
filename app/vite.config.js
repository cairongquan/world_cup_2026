import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dir, '..');
const publicDir = path.join(dir, 'public');

const MIME = {
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.css': 'text/css',
};

function mimeFor(file) {
  return MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

/** 根目录无 config.js 时从 example 生成 */
function ensureRootConfig() {
  const configPath = path.join(repoRoot, 'config.js');
  const examplePath = path.join(repoRoot, 'config.example.js');
  if (!fs.existsSync(configPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, configPath);
    console.warn(
      '\n[world-cup] 已从 config.example.js 创建 ../config.js\n' +
        '请编辑该文件，填入 MAPBOX_ACCESS_TOKEN：https://account.mapbox.com/access-tokens/\n',
    );
  }
}

/** 同步到 app/public，由 Vite 静态托管 /config.js */
function readMapboxTokenFromFile() {
  const configPath = path.join(repoRoot, 'config.js');
  if (!fs.existsSync(configPath)) return '';
  const text = fs.readFileSync(configPath, 'utf8');
  const m = text.match(/MAPBOX_ACCESS_TOKEN\s*=\s*['"]([^'"]+)['"]/);
  const token = m?.[1]?.trim() || '';
  if (!token || token.includes('你的token')) return '';
  return token;
}

function syncConfigToPublic() {
  ensureRootConfig();
  const src = path.join(repoRoot, 'config.js');
  const dest = path.join(publicDir, 'config.js');
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(publicDir, { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

/** @param {string} url */
function resolveParentStatic(url) {
  const pathname = (url || '').split('?')[0];
  if (pathname.startsWith('/data/') || pathname.startsWith('/assets/')) {
    const rel = pathname.replace(/^\//, '');
    const file = path.join(repoRoot, rel);
    const normalized = path.normalize(file);
    if (!normalized.startsWith(repoRoot)) return null;
    if (fs.existsSync(normalized) && fs.statSync(normalized).isFile()) return normalized;
  }
  return null;
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDirRecursive(from, to);
    else fs.copyFileSync(from, to);
  }
}

function parentStaticPlugin() {
  return {
    name: 'parent-static',
    buildStart() {
      syncConfigToPublic();
    },
    configureServer(server) {
      syncConfigToPublic();
      const rootConfig = path.join(repoRoot, 'config.js');
      if (fs.existsSync(rootConfig)) {
        server.watcher.add(rootConfig);
        server.watcher.on('change', (file) => {
          if (path.normalize(file) === path.normalize(rootConfig)) syncConfigToPublic();
        });
      }
      server.middlewares.use((req, res, next) => {
        const file = resolveParentStatic(req.url || '');
        if (!file) return next();
        res.statusCode = 200;
        res.setHeader('Content-Type', mimeFor(file));
        fs.createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      const out = path.resolve(dir, 'build');
      const dataSrc = path.join(repoRoot, 'data');
      if (fs.existsSync(dataSrc)) {
        copyDirRecursive(dataSrc, path.join(out, 'data'));
      }
      const assetsSrc = path.join(repoRoot, 'assets');
      if (fs.existsSync(assetsSrc)) {
        copyDirRecursive(assetsSrc, path.join(out, 'assets'));
      }
      syncConfigToPublic();
      const pubConfig = path.join(publicDir, 'config.js');
      if (fs.existsSync(pubConfig)) {
        fs.copyFileSync(pubConfig, path.join(out, 'config.js'));
      }
    },
  };
}

const mapboxToken = readMapboxTokenFromFile();

export default defineConfig({
  plugins: [svelte(), parentStaticPlugin()],
  root: dir,
  publicDir: 'public',
  define: {
    __MAPBOX_TOKEN__: JSON.stringify(mapboxToken),
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
    fs: { allow: [repoRoot] },
  },
});
