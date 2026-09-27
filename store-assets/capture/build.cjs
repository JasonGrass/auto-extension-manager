const fs = require("fs")
const path = require("path")
const webpack = require("webpack")
const config = require("./webpack.config.cjs")

webpack(config, (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }))
    process.exitCode = 1
    return
  }
  fs.copyFileSync(path.join(__dirname, "index.html"), path.join(__dirname, "dist/index.html"))
  console.log(stats.toString({ all: false, errors: true, warnings: true, timings: true }))
  console.log("Capture ready at /capture/dist/index.html")
})
