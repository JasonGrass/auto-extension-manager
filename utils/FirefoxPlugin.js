const path = require("path")
const fs = require("fs")

const webpack = require("webpack")

const { RawSource } = webpack.sources || require("webpack-sources")

// Webpack 5 exposes the sources property to ensure the right version of webpack-sources is used.
// require('webpack-sources') approach may result in the "Cannot find module 'webpack-sources'" error.

function FirefoxPlugin(options) {
  this.options = options || {}
}

FirefoxPlugin.prototype.apply = function (compiler) {
  const options = this.options

  const isWebpack4 = webpack.version.startsWith("4.")

  if (!options.version) {
    throw new Error("version must be set")
  }

  const process = function (assets, compilation, callback) {
    // assets from child compilers will be included in the parent
    // so we should not run in child compilers
    if (compilation.compiler.isChild()) {
      callback()
      return
    }

    // 构建 firefox 的 manifest 内容
    const buildNewManifest = () => {
      const firefoxManifestFile = options.file
      const originFirefoxManifest = fs.readFileSync(firefoxManifestFile).toString()

      const manifest = JSON.parse(originFirefoxManifest)
      manifest.version = options.version
      const newFirefoxManifest = JSON.stringify(manifest)
      return newFirefoxManifest
    }

    const fileKeys = Object.keys(assets)
    for (const filename of fileKeys) {
      if (filename !== "manifest.json") {
        continue
      }

      const manifest = buildNewManifest()
      compilation.updateAsset(filename, new RawSource(manifest))
    }

    callback()
  }

  if (isWebpack4) {
    compiler.hooks.emit.tapAsync(FirefoxPlugin.name, process)
  } else {
    compiler.hooks.thisCompilation.tap(FirefoxPlugin.name, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: FirefoxPlugin.name,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER
        },
        (assets) => new Promise((resolve) => process(assets, compilation, resolve))
      )
    })
  }
}
module.exports = FirefoxPlugin
