var webpack = require("webpack"),
  path = require("path"),
  fileSystem = require("fs-extra"),
  env = require("./utils/env"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  TerserPlugin = require("terser-webpack-plugin")
var { CleanWebpackPlugin } = require("clean-webpack-plugin")
var ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
var ReactRefreshTypeScript = require("react-refresh-typescript")

const ASSET_PATH = process.env.ASSET_PATH || "/"

var alias = {
  "...": path.join(__dirname, "src")
}

// load the secrets
var secretsPath = path.join(__dirname, "secrets." + env.NODE_ENV + ".js")

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"]

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath
}

const isDevelopment = process.env.NODE_ENV !== "production"

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    options: path.join(__dirname, "src", "pages", "Options", "index.jsx"),
    popup: path.join(__dirname, "src", "pages", "Popup", "index.jsx"),
    background: path.join(__dirname, "src", "pages", "Background", "index.js")
  },
  chromeExtensionBoilerplate: {
    notHotReload: ["background", "contentScript", "devtools"]
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
    publicPath: ASSET_PATH
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.less$/i,
        use: ["style-loader", "css-loader", "less-loader"]
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
        type: "asset/resource",
        exclude: /node_modules/
        // loader: 'file-loader',
        // options: {
        //   name: '[name].[ext]',
        // },
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              getCustomTransformers: () => ({
                before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean)
              }),
              transpileOnly: isDevelopment
            }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: "source-map-loader"
          },
          {
            loader: require.resolve("babel-loader"),
            options: {
              plugins: [isDevelopment && require.resolve("react-refresh/babel")].filter(Boolean)
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: alias,
    extensions: fileExtensions
      .map((extension) => "." + extension)
      .concat([".js", ".jsx", ".ts", ".tsx", ".css"])
  },
  plugins: [
    isDevelopment && new ReactRefreshWebpackPlugin({ overlay: false }),
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.ProgressPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new webpack.DefinePlugin({ RUNTIME_ENV: env.NODE_ENV }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: path.join(__dirname, "build"),
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString())
              })
            )
          }
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets/img/icon-128.png",
          to: path.join(__dirname, "build"),
          force: true
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets/img/icon-64.png",
          to: path.join(__dirname, "build"),
          force: true
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets/img/icon-48.png",
          to: path.join(__dirname, "build"),
          force: true
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets/img/icon-32.png",
          to: path.join(__dirname, "build"),
          force: true
        }
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "src/_locales", to: path.join(__dirname, "build/_locales/"), force: true }]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Options", "index.html"),
      filename: "options.html",
      chunks: ["options"],
      cache: false
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Popup", "index.html"),
      filename: "popup.html",
      chunks: ["popup"],
      cache: false
    })
  ].filter(Boolean),
  infrastructureLogging: {
    level: "info"
  }
}

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map"
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  }
}

module.exports = options
