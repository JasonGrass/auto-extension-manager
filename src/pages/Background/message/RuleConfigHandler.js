import { OptionsStorage } from ".../storage"
import createRuleHandler from "../rule/RuleHandler"

export const onRuleConfigChanged = (ctx) => {
  OptionsStorage.getAll().then((options) => {
    const handler = createRuleHandler()
    handler.setRules(options.ruleConfig)
  })

  ctx.sendResponse()
}
