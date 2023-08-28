import chromeP from "webext-polyfill-kinda"

const createExtension = async (EM) => {
  const exts = await chromeP.management.getAll()

  const update = async () => {
    EM.Extension.items = await chromeP.management.getAll()
  }

  return {
    items: exts,
    update: update
  }
}

export default createExtension
