import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("public");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const path = resolve(root, "." + decodeURIComponent(url.pathname));
      if (path !== root && !path.startsWith(root + sep)) {
        response.writeHead(403).end();
        return;
      }
      const target = (await stat(path)).isDirectory()
        ? resolve(path, "index.html")
        : path;
      const body = await readFile(target);
      response.writeHead(200, {
        "Content-Type": types[extname(target)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`MemPal is ready at http://127.0.0.1:${port}`),
  );
