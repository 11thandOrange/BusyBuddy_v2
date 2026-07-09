import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ASSETS_DIR = path.resolve(__dirname, '../../assets');

/**
 * Minimal static server that serves a fixture HTML page for e2e tests to
 * navigate to. The real theme extension scripts themselves are injected via
 * page.addInitScript({ path }) (see storefront.spec.js) rather than served
 * here, since addInitScript runs before the navigated document's own
 * DOMContentLoaded fires - a plain <script src> added after navigation
 * would miss that event entirely.
 */
export function startStaticServer(fixtureHtml) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fixtureHtml);
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseURL: `http://127.0.0.1:${port}` });
    });
  });
}

export function stopStaticServer(server) {
  return new Promise((resolve) => server.close(resolve));
}
