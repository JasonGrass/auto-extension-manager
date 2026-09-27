import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { dirname, extname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".ttf": "font/ttf"
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost")
    const path = resolve(root, "." + decodeURIComponent(url.pathname))
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end()
      return
    }
    const file = (await stat(path)).isDirectory() ? resolve(path, "index.html") : path
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    })
    res.end(await readFile(file))
  } catch {
    res.writeHead(404).end("Not found")
  }
})
server.listen(15302, "127.0.0.1", () => console.log("Store assets: http://127.0.0.1:15302"))
