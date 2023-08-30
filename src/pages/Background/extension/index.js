import chromeP from "webext-polyfill-kinda"

import { ExtensionRepo } from "./ExtensionRepo"
import { ExtensionService } from "./ExtensionService"

const createExtension = async (EM) => {
  const exts = await chromeP.management.getAll()

  const repo = new ExtensionRepo()
  const service = new ExtensionService(EM, repo)

  service.initial()

  return {
    items: exts,
    service: service
  }
}

export default createExtension
