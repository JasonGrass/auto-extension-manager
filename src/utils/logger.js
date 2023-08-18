class Logger {
  showMoreLog = false

  init = () => {
    const development = "development"
    const production = "production"
    try {
      const env = RUNTIME_ENV
      console.log("ENV", env)

      if (env === "development") {
        console.log("开发环境下，开启调试日志输出")
        this.showMoreLog = true
      }
    } catch (err) {
      console.log("LOGGER INIT ENV ERROR", err)
    }
  }

  trace(...args) {
    if (!this.showMoreLog) {
      return
    }
    console.trace(...args)
  }

  debug(...args) {
    if (!this.showMoreLog) {
      return
    }
    console.debug(...args)
  }

  info(...args) {
    console.info(...args)
  }

  warn(...args) {
    console.warn(...args)
  }

  error(...args) {
    console.error(...args)
  }
}

function getLogger() {
  let l = undefined
  return () => {
    if (l) {
      console.log("return logger")
      return l
    } else {
      l = new Logger()
      console.log("create logger")
      return l
    }
  }
}

export default getLogger()
