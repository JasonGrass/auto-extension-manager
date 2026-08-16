export const isStringEmpty = function (str) {
  if (!str) {
    return true
  }
  if (str.trim() === "") {
    return true
  }

  return false
}

export const getLang = (key, ...params) => {
  if (isStringEmpty(key)) {
    return ""
  }
  if (!params || params.length === 0) {
    return chrome.i18n.getMessage(key)
  }
  return chrome.i18n.getMessage(key, params)
}

/**
 * 将 Blob 转成可直接写入 IndexedDB 的 Data URL。
 *
 * 不使用 URL.createObjectURL：Blob URL 仅在当前页面生命周期内有效，页面关闭后保存到
 * IndexedDB 的地址会失效；Data URL 则可以跨 Popup、Options 页面和浏览器重启继续使用。
 */
export const blobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error ?? new Error("Blob 转换为 Data URL 失败"))
    reader.readAsDataURL(blob)
  })
}

/**
 * 下载图片并转换为 Data URL。
 *
 * 该方法只应从具备 DOM 的 Popup / Options 页面调用。MV3 Service Worker 不支持
 * XMLHttpRequest；另外，其他扩展未通过 web_accessible_resources 暴露的资源会被
 * Chrome 拒绝访问，调用方应捕获异常并使用自身的降级图标。
 */
export const downloadImageDataUrl = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      reject(new Error("图片地址不能为空"))
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.open("GET", imageUrl, true)
    xhr.responseType = "blob"
    // 扩展内置资源通常会立即返回。设置超时可防止单个异常资源阻塞后续图标缓存。
    xhr.timeout = 5000

    xhr.onload = async () => {
      if (xhr.status !== 200 || !xhr.response) {
        reject(new Error(`图片下载失败，HTTP 状态码：${xhr.status}`))
        return
      }

      try {
        resolve(await blobToDataUrl(xhr.response))
      } catch (error) {
        reject(error)
      }
    }

    xhr.onerror = () => reject(new Error(`图片下载失败，HTTP 状态码：${xhr.status}`))
    xhr.ontimeout = () => reject(new Error("图片下载超时"))
    xhr.send()
  })
}

/**
 * 使用 img + canvas 读取图片。
 *
 * management API 返回的浏览器内部 URL 有时可用于 img.src，却不能由 XHR 读取；这是
 * downloadImageDataUrl 的补充路径。跨源图片若污染 canvas 会在此处失败并交给调用方降级。
 */
export const renderImageDataUrl = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (!imageUrl) {
      reject(new Error("图片地址不能为空"))
      return
    }

    const image = new Image()
    const timeout = setTimeout(() => {
      image.src = ""
      reject(new Error("图片加载超时"))
    }, 5000)

    image.onload = async () => {
      clearTimeout(timeout)
      try {
        const width = image.naturalWidth || 128
        const height = image.naturalHeight || 128
        const canvas = new OffscreenCanvas(width, height)
        const context = canvas.getContext("2d")
        if (!context) throw new Error("无法创建图片画布")
        context.drawImage(image, 0, 0, width, height)
        const blob = await canvas.convertToBlob({ type: "image/png" })
        resolve(await blobToDataUrl(blob))
      } catch (error) {
        reject(error)
      }
    }
    image.onerror = () => {
      clearTimeout(timeout)
      reject(new Error("图片加载失败"))
    }
    image.src = imageUrl
  })
}

/**
 * 下载文件到本地
 * @param {Blob} contentBlob 文件内容 e.g. new Blob([jsonStr], { type: "application/json" })
 * @param {string} filename 文件名
 */
export const downloadFile = (contentBlob, filename) => {
  const downloadLink = document.createElement("a")
  downloadLink.href = URL.createObjectURL(contentBlob)
  downloadLink.download = filename

  document.body.appendChild(downloadLink)
  downloadLink.click()

  document.body.removeChild(downloadLink)
  URL.revokeObjectURL(downloadLink.href)
}

/**
 * 对时间进行格式化输出，输出为 yyMMDD_HHmmss
 */
export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

export async function writeToClipboard(text) {
  const item = new ClipboardItem({
    "text/plain": new Blob([text], { type: "text/plain" })
  })

  try {
    await navigator.clipboard.write([item])
    return true
  } catch (error) {
    console.error("保存到剪贴板失败", error)
    return false
  }
}

export async function readFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch (error) {
    console.error("读取剪贴板失败", error)
    return ""
  }
}
