import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"
import ts from "typescript"

const require = createRequire(import.meta.url)
const source = fs.readFileSync(
  new URL("../src/pages/Options/management/import/ImportTarget.jsx", import.meta.url),
  "utf8"
)
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React }
}).outputText

function renderImportTarget(window = {}) {
  const values = []
  const warnings = []
  let clicks = 0
  const react = {
    ...require("react"),
    memo: (component) => component,
    forwardRef: (component) => component,
    useEffect: () => {},
    useImperativeHandle: () => {},
    useRef: () => ({ current: { click: () => clicks++ } }),
    useState: () => ["existing content", (value) => values.push(value)]
  }
  const stubs = {
    react,
    antd: { Button: "button", Input: { TextArea: "textarea" } },
    "styled-components": { __esModule: true, default: { div: () => "div" } },
    ".../utils/utils": { getLang: (key) => key }
  }
  const module = { exports: {} }
  new Function("require", "module", "exports", "window", "console", code)(
    (name) => stubs[name],
    module,
    module.exports,
    window,
    { warn: (error) => warnings.push(error) }
  )
  const elements = []
  const visit = (element) => {
    if (!element?.props) return
    elements.push(element)
    for (const child of [element.props.children].flat()) visit(child)
  }
  visit(module.exports.default({}))
  const button = elements.find(
    (element) => element.props.children === "management_import_from_file"
  )
  return {
    open: button.props.onClick,
    input: elements.find((element) => element.type === "input"),
    values,
    warnings,
    get clicks() {
      return clicks
    }
  }
}

test("uses the native picker when available, preserving JSON/TXT filters", async () => {
  let options
  const view = renderImportTarget({
    async showOpenFilePicker(value) {
      options = value
      return [{ getFile: async () => new Blob(["native content"]) }]
    }
  })
  await view.open()
  assert.deepEqual(view.values, ["native content"])
  assert.equal(view.clicks, 0)
  assert.equal(options.multiple, false)
  assert.deepEqual(options.types[0].accept, {
    "application/json": [".json"],
    "text/plain": [".txt"]
  })
})

test("falls back when the native picker is missing or not callable", async () => {
  for (const window of [{}, { showOpenFilePicker: undefined }, { showOpenFilePicker: null }]) {
    const view = renderImportTarget(window)
    await view.open()
    assert.equal(view.clicks, 1)
    assert.equal(view.input.props.type, "file")
    assert.equal(view.input.props.accept, ".json,.txt")
    assert.equal(view.input.props.hidden, true)
    assert.deepEqual(view.warnings, [])
  }
})

test("fallback reads files and resets the input so the same file can be selected again", async () => {
  const view = renderImportTarget()
  const input = { files: [new Blob(["fallback content"])], value: "C:\\fakepath\\list.txt" }
  await view.input.props.onChange({ target: input })
  assert.deepEqual(view.values, ["fallback content"])
  assert.equal(input.value, "")
  await view.input.props.onChange({ target: input })
  assert.deepEqual(view.values, ["fallback content", "fallback content"])
})

test("canceling either picker preserves existing content without opening another dialog", async () => {
  const view = renderImportTarget({
    showOpenFilePicker: async () => {
      throw new DOMException("Canceled", "AbortError")
    }
  })
  await view.open()
  assert.equal(view.clicks, 0)
  assert.deepEqual(view.values, [])
  assert.deepEqual(view.warnings, [])

  const fallback = renderImportTarget()
  await fallback.input.props.onChange({ target: { files: [], value: "" } })
  assert.deepEqual(fallback.values, [])
  assert.deepEqual(fallback.warnings, [])
})

test("fallback read errors preserve existing content and reset the input", async () => {
  const error = new Error("Read failed")
  const view = renderImportTarget()
  const input = {
    files: [
      {
        text: async () => {
          throw error
        }
      }
    ],
    value: "C:\\fakepath\\list.txt"
  }
  await view.input.props.onChange({ target: input })
  assert.deepEqual(view.values, [])
  assert.deepEqual(view.warnings, [error])
  assert.equal(input.value, "")
})
