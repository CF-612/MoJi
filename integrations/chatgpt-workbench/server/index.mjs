import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {createService} from './service.mjs';
import {createMcp} from './mcp.mjs';

const root = resolve(import.meta.dirname, '..');
const dataRoot = resolve(process.env.CUIGENGJI_DATA_ROOT || `${root}/.data/demo`);
const service = await createService(dataRoot);
if (process.argv.includes('--stdio')) {
  await createMcp(service).connect(new StdioServerTransport());
} else {
  const port = Number(process.env.PORT || 43127);
  const origin = `http://127.0.0.1:${port}`;
  const server = createServer(async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      if (req.headers.host !== `127.0.0.1:${port}`) {res.writeHead(403).end();return;}
      if (req.headers.origin && req.headers.origin !== origin) {res.writeHead(403).end();return;}
      if (req.url === '/health' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');res.end(JSON.stringify({product:'moji',version:'0.10.2'}));return;
      }
      if (req.url === '/mcp') {
        if (req.method !== 'POST') {res.writeHead(405).end();return;}
        const mcp = createMcp(service);
        const transport = new StreamableHTTPServerTransport({sessionIdGenerator: undefined});
        await mcp.connect(transport);
        res.on('close', () => {transport.close();mcp.close();});
        await transport.handleRequest(req, res);
        return;
      }
      if (['/api/tool','/api/dispatch','/api/bootstrap'].includes(req.url) && req.method === 'POST') {
        if (!req.headers['content-type']?.startsWith('application/json')) {res.writeHead(415).end();return;}
        let body = ''; for await (const chunk of req) {body += chunk; if (Buffer.byteLength(body) > 64 * 1024 * 1024) throw new Error('输入太大');}
        const {name,args,action,sessionId} = JSON.parse(body);
        const result = req.url==='/api/bootstrap'?await service.bootstrap(sessionId):req.url==='/api/dispatch'?await service.rpc(action,args,sessionId,'human'):await service.call(name,args,'human');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');res.end(JSON.stringify({result}));return;
      }
      if (req.url === '/api/snapshot' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');res.end(JSON.stringify({result: await service.snapshot()}));return;
      }
      if (req.url === '/' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');res.end(await readFile(`${root}/dist/workbench-dev.html`));return;
      }
      res.writeHead(404).end();
    } catch (error) {
      if (!res.headersSent) res.writeHead(error.code === 'CONFLICT' ? 409 : 400, {'Content-Type': 'application/json; charset=utf-8'});
      res.end(JSON.stringify({error: error.message, code: error.code}));
    }
  });
  server.listen(port, '127.0.0.1', () => console.log(JSON.stringify({url: `${origin}/`, dataRoot})));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
