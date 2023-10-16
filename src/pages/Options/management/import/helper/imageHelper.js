export async function downloadImage(extension) {
  if (!extension) {
    return null
  }

  if (!extension.id) {
    return null
  }

  const cache = sessionStorage.getItem(`image-${extension.id}`)
  if (cache) {
    return cache
  }

  // 没有找到可以下载 ICON 的地址
  let url = ""

  if (!url) {
    return null
  }

  try {
    const image = await download(url)
    if (image) {
      sessionStorage.setItem(`image-${extension.id}`, image)
    }

    return image
  } catch (error) {
    console.warn(error)
    return null
  }
}

async function download(url) {
  return null
}
