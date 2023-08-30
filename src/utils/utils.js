export const isStringEmpty = function (str) {
  if (!str) {
    return true
  }
  if (str.trim() === "") {
    return true
  }

  return false
}

/**
 * 下载 Image 并获取其 data uri
 * 仅在支持 XMLHttpRequest 时可用
 */
export const downloadImageDataUri = (imageUrl) => {
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
