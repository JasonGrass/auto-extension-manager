// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production"
process.env.NODE_ENV = "production"
process.env.ASSET_PATH = "/"

function build(channel, callback) {
  var webpack = require("webpack"),
    path = require("path"),
    fs = require("fs"),
    config = require("../webpack.config"),
    ZipPlugin = require("zip-webpack-plugin")

  delete config.chromeExtensionBoilerplate

  config.mode = "production"

  var packageInfo = JSON.parse(fs.readFileSync("package.json", "utf-8"))

  config.plugins = (config.plugins || []).concat(
    new ZipPlugin({
      filename: `${packageInfo.name}-${packageInfo.version}-${channel}.zip`,
      path: path.join(__dirname, "../", "zip")
    })
  )

  webpack(config, function (err, stats) {
    if (err || stats.hasErrors()) {
      console.error(err || stats.compilation.errors)
      throw new Error("webpack: Failed to build", err || stats.compilation.errors)
    } else {
      console.log("webpack: Build complete")
      if (callback) {
        callback()
      }
    }
  })
}

module.exports = build
