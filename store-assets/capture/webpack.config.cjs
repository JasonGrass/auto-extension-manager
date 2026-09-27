const path = require("path")
const webpack = require("webpack")

const root = path.resolve(__dirname, "../..")
const noop = path.join(__dirname, "noop.js")

module.exports = {
  mode: "development",
  devtool: false,
  entry: path.join(__dirname, "main.js"),
  output: {
    path: path.join(__dirname, "dist"),
    filename: "capture.js",
    publicPath: "auto",
    clean: true
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
    alias: {
      "...": path.join(root, "src"),
      [path.join(root, "src/utils/googleAnalyze.js") + "$"]: noop,
      [path.join(root, "src/pages/Options/utils/LatestVersionChecker.js") + "$"]: noop,
      [path.join(root, "src/pages/Background/extension/ExtensionIconBuilder.ts") + "$"]: path.join(
        __dirname,
        "icon-builder.js"
      ),
      [path.join(root, "src/pages/Options/management/worker/ExtensionChannelWorker.ts") + "$"]:
        noop,
      [path.join(root, "src/utils/secret.js") + "$"]: path.join(root, "src/utils/secret.demo.js"),
      [path.join(root, "src/utils/generate/builderEnv.temp.js") + "$"]: path.join(
        __dirname,
        "channel.js"
      )
    }
  },
  module: {
    rules: [
      { test: /\.(css|scss)$/, use: ["style-loader", "css-loader", "sass-loader"] },
      { test: /\.less$/, use: ["style-loader", "css-loader", "less-loader"] },
      { test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/, type: "asset/resource" },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [{ loader: "ts-loader", options: { transpileOnly: true } }]
      },
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: ["babel-loader"] }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ RUNTIME_ENV: JSON.stringify("development") }),
    new webpack.EnvironmentPlugin({ NODE_ENV: "development" })
  ],
  performance: { hints: false }
}
