import LZString from "lz-string"

/**
 * https://github.com/dtuit/chrome-storage-largeSync/blob/master/src/chrome-storage-largeSync.js
 */

const API_VERSION = "0.1.0"

function largeSync() {
  if (typeof chrome.storage === "undefined" || typeof chrome.storage.sync === "undefined") {
    throw Error(
      '[largeSync] - chrome.storage.sync is undefined, check that the "storage" permission included in your manifest.json'
    )
  }
  var chromeSync = chrome.storage.sync

  var keyPrefix = "LS",
    maxBytes = chromeSync.QUOTA_BYTES,
    maxBytesPerKey = chromeSync.QUOTA_BYTES_PER_ITEM,
    version = API_VERSION

  function split(obj, maxLength) {
    if (typeof maxLength === "undefined") {
      maxLength = maxBytesPerKey
    }
    var keys = getKeys(obj)
    var ret = {}

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      if (obj.hasOwnProperty(key)) {
        var str = LZString.compressToBase64(JSON.stringify(obj[key]))
        var max = calculateMaxLength(key, maxLength)
        var j = 0

        for (var offset = 0, strLen = str.length; offset < strLen; offset += max, j++) {
          ret[getStorageKey(key, j)] = str.substring(offset, offset + max)
        }
        ret[getStorageKey(key, "meta")] = {
          key: key,
          min: 0,
          max: j,
          hash: basicHash(str),
          largeSyncversion: version
        }
      }
    }
    return ret
  }

  function reconstruct(splitObjects, keys) {
    if (typeof keys === "undefined") {
      keys = extractKeys(splitObjects)
    }
    var ret = {}
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var rejoined = "",
        meta = splitObjects[getStorageKey(key, "meta")]

      if (meta !== "undefined") {
        for (var j = 0; j < meta.max; j++) {
          if (typeof splitObjects[getStorageKey(key, j)] === "undefined") {
            throw Error("[largeSync] - partial string missing, object cannot be reconstructed.")
          }
          rejoined += splitObjects[getStorageKey(key, j)]
        }
        ret[key] = JSON.parse(LZString.decompressFromBase64(rejoined))
      }
    }
    return ret
  }

  function getStorageKey(key, postfix) {
    return keyPrefix + "__" + key + "." + postfix
  }
  function getRequestKeys(keys) {
    var re = []
    for (var i = 0; i < getKeys(keys).length; i++) {
      var key = keys[i]

      for (var j = 0; j < maxBytes / maxBytesPerKey; j++) {
        re.push(getStorageKey(key, j))
      }
      re.push(getStorageKey(key, "meta"))
    }
    return re
  }
  function calculateMaxLength(key, maxLength) {
    return maxLength - (keyPrefix.length + key.length + 10)
  }
  function getKeys(keys) {
    if (typeof keys !== "undefined" && keys !== null) {
      if (keys.constructor.name === "Object") {
        return Object.keys(keys)
      } else if (keys.constructor.name === "Array" || typeof keys === "string") {
        return Array.from(keys)
      }
    }
    throw TypeError("[largeSync] - " + keys + ' must be of type "Object", "Array" or "string"')
  }

  function extractKeys(splitObjects) {
    var ret = Object.keys(splitObjects)
      .map((x) => {
        var match = x.match(keyPrefix + "__(.*?).meta")
        if (match !== null) {
          return match[1]
        } else {
          return null
        }
      })
      .filter(Boolean)
    return ret
  }

  function basicHash(str) {
    var hash = 0
    if (str.length === 0) return hash
    for (var i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  function get(keys, callback) {
    var reqKeys = null

    if (keys !== null) {
      var objKeys = getKeys(keys)
      reqKeys = getRequestKeys(objKeys)
    }
    chromeSync.get(reqKeys, function (items) {
      var x = reconstruct(items)
      callback(x)
    })
  }
  function set(items, callback) {
    if (items === null || typeof items === "string" || items.constructor.name === "Array") {
      // will throw error from "extensions::schemaUtils"
      chromeSync.set(items, callback)
    } else {
      var splitItems = split(items, maxBytesPerKey)

      var splitKeys = getKeys(splitItems)
      var reqKeys = getRequestKeys(getKeys(items))
      var removeKeys = reqKeys.filter(function (x) {
        return splitKeys.indexOf(x) < 0
      })

      //remove keys that are no longer in use
      chromeSync.remove(removeKeys)

      chromeSync.set(splitItems, callback)
    }
  }
  function remove(keys, callback) {
    if (keys === null) {
      // will throw error from "extensions::schemaUtils"
      chromeSync.remove(null, callback)
    } else {
      var removeKeys = getRequestKeys(getKeys(keys))
      chromeSync.remove(removeKeys, callback)
    }
  }
  function getBytesInUse(keys, callback) {
    if (keys === null) {
      chromeSync.getBytesInUse(null, callback)
    } else {
      var objectKeys = getRequestKeys(getKeys(keys))
      chromeSync.getBytesInUse(objectKeys, callback)
    }
  }
  function clear(callback) {
    chromeSync.clear(callback)
  }

  function getkeyPrefix() {
    return keyPrefix
  }
  function setkeyPrefix(val) {
    keyPrefix = val
  }

  var api = {
    QUOTA_BYTES: maxBytes,
    QUOTA_BYTES_PER_ITEM: maxBytes,
    QUOTA_BYTES_PER_KEY: maxBytesPerKey,

    MAX_ITEMS: chromeSync.MAX_ITEMS,
    MAX_WRITE_OPERATIONS_PER_HOUR: chromeSync.MAX_WRITE_OPERATIONS_PER_HOUR,
    MAX_WRITE_OPERATIONS_PER_MINUTE: chromeSync.MAX_WRITE_OPERATIONS_PER_MINUTE,

    VERSION: version,

    get: get,
    set: set,
    remove: remove,
    getBytesInUse: getBytesInUse,
    clear: clear,

    _core: {
      split: split,
      reconstruct: reconstruct,
      utils: {
        basicHash: basicHash,
        getKeys: getKeys,
        extractKeys: extractKeys,
        getStorageKey: getStorageKey,
        getRequestKeys: getRequestKeys
      }
    },
    _config: {
      getkeyPrefix: getkeyPrefix,
      setkeyPrefix: setkeyPrefix
    }
  }

  return api
}

const api = largeSync()

export default api
