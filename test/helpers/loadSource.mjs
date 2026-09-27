import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = fileURLToPath(new URL("../../", import.meta.url))
const requirePackage = createRequire(new URL("../../package.json", import.meta.url))

// Load the real source graph, replacing only browser/IO boundaries. No emitted files.
export function createSourceLoader(stubs = {}, globals = {}) {
  const cache = new Map()
  const load = (request, parent = root) => {
    if (Object.hasOwn(stubs, request)) return stubs[request]
    let filename = request.startsWith(".../")
      ? path.join(root, "src", request.slice(4))
      : path.resolve(parent, request)
    if (!fs.existsSync(filename) || fs.statSync(filename).isDirectory()) {
      filename = [".ts", ".js", ".mjs", "/index.js"]
        .map((ext) => filename + ext)
        .find(fs.existsSync)
    }
    if (!filename) throw new Error(`Source not found: ${request}`)
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true
      }
    }).outputText
    const require = (name) => {
      if (Object.hasOwn(stubs, name)) return stubs[name]
      if (name.startsWith(".") || name.startsWith(".../")) return load(name, path.dirname(filename))
      return requirePackage(name)
    }
    new Function("require", "module", "exports", ...Object.keys(globals), code)(
      require,
      module,
      module.exports,
      ...Object.values(globals)
    )
    return module.exports
  }
  return (request) => load(request)
}

export const flush = () => new Promise((resolve) => setImmediate(resolve))
export function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
