import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const outDir = join(process.cwd(), 'out');
const clientDir = join(distDir, 'client');
const serverDir = join(distDir, 'server');

rmSync(distDir, { force: true, recursive: true });
mkdirSync(clientDir, { recursive: true });
cpSync(outDir, clientDir, { recursive: true });
mkdirSync(serverDir, { recursive: true });

writeFileSync(
  join(serverDir, 'index.js'),
  `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404) {
      return response;
    }

    if (!url.pathname.includes(".")) {
      url.pathname = url.pathname === "/"
        ? "/index.html"
        : \`\${url.pathname.replace(/\\\/$/, "")}.html\`;

      const pageResponse = await env.ASSETS.fetch(new Request(url, request));
      if (pageResponse.status !== 404) {
        return pageResponse;
      }
    }

    return response;
  },
};
`,
);
