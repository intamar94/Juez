// Servidor local: sirve la web y las funciones de /api igual que Vercel.
//   npm start   → http://localhost:5174
// Lee las claves de .env si existe (ver .env.example); sin claves, todo va en modo demo.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));
const puerto = Number(process.env.PORT) || 5174;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
};

if (existsSync(join(raiz, '.env'))) {
  for (const linea of readFileSync(join(raiz, '.env'), 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] == null) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    const ruta = normalize(join(raiz, url.pathname === '/' ? 'index.html' : url.pathname));
    if (!ruta.startsWith(raiz) || ruta.includes(`${raiz}servidor`) || ruta.endsWith('.env')) throw new Error('prohibido');
    const contenido = await readFile(ruta);
    res.writeHead(200, { 'Content-Type': TIPOS[extname(ruta)] ?? 'application/octet-stream' });
    res.end(contenido);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(puerto, () => console.log(`Acierto en http://localhost:${puerto}`));

async function api(req, res, url) {
  const nombre = url.pathname.slice(5).replace(/[^a-z-]/g, '');
  const archivo = join(raiz, 'api', `${nombre}.js`);
  if (!existsSync(archivo)) return res.writeHead(404).end('No encontrado');
  const modulo = await import(pathToFileURL(archivo).href);
  const manejador = modulo[req.method];
  if (!manejador) return res.writeHead(405).end('Método no permitido');

  const trozos = [];
  for await (const t of req) trozos.push(t);
  const cuerpo = trozos.length ? Buffer.concat(trozos) : undefined;
  const request = new Request(url, { method: req.method, headers: req.headers, body: cuerpo });
  const respuesta = await manejador(request);
  res.writeHead(respuesta.status, Object.fromEntries(respuesta.headers));
  res.end(Buffer.from(await respuesta.arrayBuffer()));
}
