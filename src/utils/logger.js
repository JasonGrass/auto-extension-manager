class Logger {
  isDebugMode = false

  init = () => {
    const development = "development"
    const production = "production"
    try {
      // eslint-disable-next-line no-undef
      const env = RUNTIME_ENV
      console.log("ENV", env)

      if (env === "development") {
        console.log("开发环境下，开启调试日志输出")
        this.isDebugMode = true
      }
    } catch (err) {
      console.log("LOGGER INIT ENV ERROR", err)
    }
  }

  getLevel() {
    try {
      // eslint-disable-next-line no-undef
      const level = globalThis?.logLevel ?? window?.logLevel
      if (!level) {
        return 3
      }
      const num = parseInt(level)
      if (num < 0 || num > 5) {
        return 3
      }
      return num
    } catch {
      return 3
    }
  }

  trace(...args) {
    if (this.isDebugMode) {
      console.trace(...args)
      return
    }
    if (this.getLevel() === 1) {
      console.trace(...args)
    }
  }

  debug(...args) {
    if (this.isDebugMode) {
      console.debug(...args)
      return
    }
    if (this.getLevel() <= 2) {
      console.debug(...args)
    }
  }

  info(...args) {
    if (this.getLevel() <= 3) {
      console.info(...args)
    }
  }

  warn(...args) {
    if (this.getLevel() <= 4) {
      console.warn(...args)
    }
  }

  error(...args) {
    console.error(...args)
  }
}

function getLogger() {
  let l = undefined
  return () => {
    if (l) {
      return l
    } else {
      l = new Logger()
      return l
    }
  }
}

export default getLogger()
