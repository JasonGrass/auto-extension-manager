function build() {
  let cache = undefined
  return () => {
    if (cache) {
      return cache
    } else {
      cache = {}
      return cache
    }
  }
}

const cacheGetter = build()

export const getLang = async () => {
  try {
    const cache = cacheGetter()
    if (cache.lang) {
      return cache.lang
    } else {
      const lang = chrome.i18n.getUILanguage()
      cache.lang = lang
      return lang
    }
  } catch (error) {
    return undefined
  }
}

export const getVersion = async () => {
  try {
    const cache = cacheGetter()
    if (cache.version) {
      return cache.version
    } else {
      const self = await chrome.management.getSelf()
      const version = self.version
      cache.version = version
      return version
    }
  } catch (error) {
    console.warn("getVersion error.", error)
    return "0.0.0"
  }
}

export const getUserAgent = async () => {
  try {
    const cache = cacheGetter()
    if (cache.userAgent) {
      return cache.userAgent
    } else {
      const userAgent = navigator.userAgent
      cache.userAgent = userAgent
      return userAgent
    }
  } catch (error) {
    return undefined
  }
}

export const getUip = async () => {
  try {
    const cache = cacheGetter()
    if (cache.uip) {
      return cache.uip
    } else {
      const ip = await getIp()
      cache.uip = ip
      return ip
    }
  } catch (error) {
    return undefined
  }
}

const getIp = async () => {
  try {
    let ip =
      (await getIpByApi("https://api.ipify.org/?format=json", true)) ??
      (await getIpByApi("https://v4.ident.me/", false)) ??
      (await getIpByApi("https://api.ip.sb/jsonip", true))
    return ip
  } catch (error) {
    return undefined
  }
}

const getIpByApi = async (url, wrap) => {
  try {
    const response = await fetch(url)
    if (response.ok) {
      if (wrap) {
        const ip = await response.json()
        return ip.ip
      } else {
        return await response.text()
      }
    }
    return undefined
  } catch (error) {
    return undefined
  }
}
