'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createDialogueCore, LiveError, API_VERSION } = require('./dialogue-core.cjs');

const ASSETS = path.resolve(__dirname, '../assets');
const STATIC = new Map([
  ...['icons.js','partner-model.js','preparation-scenes.js','preparation-ui.js','radar-rules.js','radar-core.js','radar-store.js','practice-scenarios.js','radar-ui.js'].map(file=>['/'+file,[file,'text/javascript; charset=utf-8']]),
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/engine.js', ['engine.js', 'text/javascript; charset=utf-8']],
  ['/content.js', ['content.js', 'text/javascript; charset=utf-8']],
  ['/expanded-content.js', ['expanded-content.js', 'text/javascript; charset=utf-8']],
  ['/dialogue-data.js', ['dialogue-data.js', 'text/javascript; charset=utf-8']],
  ['/report.js', ['report.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
]);

async function verifyPreview(port) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('端口无效，请检查DATING_PORT。');
  const origin = `http://127.0.0.1:${port}`;
  const request = route => fetch(`${origin}${route}`, {redirect:'error',signal:AbortSignal.timeout(2500)});
  const response = await request('/api/config');
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw Error('此端口没有返回Dating之神服务状态。');
  const config = await response.json();
  if (config.apiVersion !== API_VERSION || !['configured','unconfigured'].includes(config.status)) throw Error('此端口的服务版本不匹配。');
  const files = await Promise.all([...STATIC.entries()].filter(([route])=>route!=='/index.html').map(async ([route,[file,mime]])=>{
    const [asset,local] = await Promise.all([request(route),fs.readFile(path.join(ASSETS,file))]);
    if (!asset.ok || asset.headers.get('content-type')!==mime || !local.equals(Buffer.from(await asset.arrayBuffer()))) throw Error(`预览资源与当前文件不符（${file}）。`);
    return local;
  }));
  return {origin,apiVersion:API_VERSION,assets:files.length,fingerprint:createHash('sha256').update(Buffer.concat(files)).digest('hex').slice(0,12),modelConfigured:config.status==='configured'};
}

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}

async function readJSON(req) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '')) throw new LiveError(415, 'CONTENT_TYPE', '请求需要application/json。');
  const declared = req.headers['content-length'];
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > 16384)) throw new LiveError(413, 'BODY_TOO_LARGE', '请求内容过大。');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw new LiveError(413, 'BODY_TOO_LARGE', '请求内容过大。');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new LiveError(400, 'INVALID_JSON', '请求不是有效JSON。'); }
}

async function startServer(options = {}) {
  const core = createDialogueCore(options);
  let origin;
  const server = http.createServer(async (req, res) => {
    const disconnected = new AbortController();
    res.on('close', () => { if (!res.writableEnded) disconnected.abort(); });
    try {
      const expectedHost = new URL(origin).host;
      if (req.headers.host !== expectedHost || (req.headers.origin !== undefined && req.headers.origin !== origin)) throw new LiveError(403, 'ORIGIN', '仅允许从本地服务页面访问。');
      const url = new URL(req.url, origin);
      if (url.search) throw new LiveError(404, 'NOT_FOUND', '入口不存在。');
      if (url.pathname.startsWith('/api/')) {
        if (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])) throw new LiveError(403, 'ORIGIN', '会话接口仅允许从本地服务页面访问。');
        if (req.method === 'GET' && url.pathname === '/api/config') return json(res, 200, core.config());
        if (req.method !== 'POST') throw new LiveError(405, 'METHOD', '此接口仅接受POST。');
        if (req.headers.origin !== origin) throw new LiveError(403, 'ORIGIN', '会话请求必须来自本地服务页面。');
        const input = await readJSON(req);
        if (url.pathname === '/api/session') return json(res, 201, core.open(input));
        if(url.pathname==='/api/radar')return json(res,200,core.radar(input));
        if(url.pathname==='/api/radar/retry')return json(res,200,core.radarRetry(input));
        if(url.pathname==='/api/radar/delete')return json(res,200,core.radarDelete(input));
        if(url.pathname==='/api/radar/preflight')return json(res,200,core.radarPreflight(input));
        if(url.pathname==='/api/radar/coach')return json(res,200,core.radarCoach(input));
        if (url.pathname === '/api/polish') return json(res, 200, await core.polish(input, disconnected.signal));
        if (url.pathname === '/api/report') return json(res, 200, await core.report(input, disconnected.signal));
        if (url.pathname === '/api/turn') return json(res, 200, await core.turn(input, disconnected.signal));
        if (url.pathname === '/api/control') {
          const result = core.control(input);
          return json(res, input.command === 'replay' ? 201 : 200, result);
        }
        throw new LiveError(404, 'NOT_FOUND', '接口不存在。');
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new LiveError(405, 'METHOD', '静态入口仅接受GET。');
      const asset = STATIC.get(url.pathname);
      if (!asset) throw new LiveError(404, 'NOT_FOUND', '文件不存在。');
      let bytes;
      try { bytes = await fs.readFile(path.join(ASSETS, asset[0])); }
      catch (error) { if (error.code === 'ENOENT') throw new LiveError(404, 'NOT_FOUND', '文件不存在。'); throw error; }
      res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'" });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      if (res.destroyed) return;
      if (error instanceof LiveError) json(res, error.status, { error: { code: error.code, message: error.message } });
      else json(res, 500, { error: { code: 'INTERNAL', message: '本地服务处理失败，本轮未推进。' } });
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(options.port ?? Number(process.env.DATING_PORT || 3781), '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  return { server, url: origin, async close() { core.close(); server.closeAllConnections?.(); await new Promise(resolve => server.close(resolve)); } };
}

if (require.main === module) {
  const port = Number(process.env.DATING_PORT || 3781);
  const printPreview = value => process.stdout.write(`Dating之神预览 ${value.origin} · API v${value.apiVersion} · ${value.assets}项静态资源 · ${value.fingerprint} · ${value.modelConfigured?'模型已配置，生成待验证':'模型未配置'}\n`);
  if(process.argv.includes('--verify'))verifyPreview(port).then(printPreview).catch(error=>{
    process.stderr.write(`预览校验失败：${error instanceof TypeError?'无法连接本地端口。':error.message}\n`);process.exitCode=1;
  });
  else startServer({port}).then(async app => {
    try { printPreview(await verifyPreview(app.server.address().port)); }
    catch(error){await app.close();throw error;}
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { app.close().then(() => process.exit(0)); });
  }).catch(async error => {
    if(error.code==='EADDRINUSE'){
      try { printPreview(await verifyPreview(port));process.stderr.write('已有同版本预览占用端口，本次未启动新进程。\n'); }
      catch { process.stderr.write('端口已被其他服务或旧版预览占用。请改用DATING_PORT。\n'); }
    }else process.stderr.write('无法启动或校验本地服务。请检查Node版本和端口配置。\n');
    process.exitCode=1;
  });
}

module.exports = { startServer, verifyPreview };
