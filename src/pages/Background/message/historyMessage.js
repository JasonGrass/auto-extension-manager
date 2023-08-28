import logger from ".../utils/logger"

export const createManualChangeGroupHandler = (EM) => {
  return (ctx) => {
    logger().trace("切换分组导致扩展状态变更", ctx)

    const actuallyEnabledIds = ctx.params.actuallyEnabledIds
    const actuallyDisabledIds = ctx.params.actuallyDisabledIds
    const group = ctx.params.group

    const items = EM.Extension.items

    const actuallyEnabledExts = items.filter((ext) => actuallyEnabledIds.includes(ext.id))
    const actuallyDisabledExts = items.filter((ext) => actuallyDisabledIds.includes(ext.id))

    EM.History.EventHandler.onManualEnabled(actuallyEnabledExts, group)
    EM.History.EventHandler.onManualDisabled(actuallyDisabledExts, group)
  }
}
