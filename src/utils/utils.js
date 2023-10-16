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
 * 下载 Image 并获取其 data uri
 * 仅在支持 XMLHttpRequest 时可用
 */
export const downloadImageDataUrl = (imageUrl) => {
  // 使用 XMLHttpRequest 下载图片

  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", imageUrl, true)
    xhr.responseType = "blob"

    xhr.onload = () => {
      if (xhr.status === 200) {
        var blob = xhr.response

        // 创建 FileReader 对象来读取 blob
        var reader = new FileReader()
        reader.onloadend = () => {
          var dataUrl = reader.result
          // console.log("图片下载并转换为 data URL 成功:", dataUrl)
          resolve(dataUrl)
        }
        reader.readAsDataURL(blob)
      } else {
        // console.log("下载图片失败:", xhr.status)
        reject(Error(`Image Fetch Error. ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      reject(Error(`Image Fetch Error. ${xhr.status}`))
    }

    xhr.send()
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
