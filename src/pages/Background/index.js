import chromeP from "webext-polyfill-kinda"

import { LocalOptionsStorage, OptionsStorage } from ".../storage"
import { onTabClosed, onTabUrlChange } from "./event/tabChangeEvent"
import "./message/MessageHandler"
import createRuleHandler from "./rule/RuleHandler"

const handler = createRuleHandler()
onTabUrlChange(handler.onCurrentUrlChanged.bind(handler))
onTabClosed(handler.onTabClosed.bind(handler))

// initial running
;(async () => {
  const local = await LocalOptionsStorage.getAll()
  const options = await OptionsStorage.getAll()

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
