import chromeP from "webext-polyfill-kinda"

import { LocalOptionsStorage, SyncOptionsStorage } from ".../storage"
import logger from ".../utils/logger"
import { onTabClosed, onTabUrlChange, onWindowClosed } from "./event/tabChangeEvent"
import "./message/Index"
import createRuleHandler from "./rule/RuleHandler"

logger().init()

const handler = createRuleHandler()
onTabUrlChange(handler.onCurrentUrlChanged.bind(handler))
onTabClosed(handler.onTabClosed.bind(handler))
onWindowClosed(handler.onWindowClosed.bind(handler))

// initial running
;(async () => {
  const local = await LocalOptionsStorage.getAll()
  const options = await SyncOptionsStorage.getAll()

  const tabs = await chromeP.tabs.query({
    active: true,
    lastFocusedWindow: true
  })
  const tab = tabs ? tabs[0] : null

  handler.init(
    {
      id: local.scene?.activeId
    },
    tab,
    options.ruleConfig,
    options.groups
  )
})()
