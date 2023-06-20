import { LocalOptionsStorage } from ".../storage"
import onTabUrlChange from "./event/tabChangeEvent"
import "./message/MessageHandler"
import createRuleHandler from "./rule/RuleHandler"

console.log("This is the background page.")
console.log("Put the background scripts here.")

const handler = createRuleHandler()
onTabUrlChange(handler.onCurrentUrlChanged.bind(handler))

// initial running
;(async () => {
  const local = await LocalOptionsStorage.getAll()
  handler.onCurrentSceneChanged({
    id: local.scene?.activeId
  })
})()
