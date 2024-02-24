import { IMatchResult } from "../rule/handlers/matchHandler"

export type RecordEvent =
  | "install"
  | "updated"
  | "uninstall"
  | "enabled"
  | "disabled"
  | "browser_updated"

export class HistoryRecord {
  constructor(
    public id: number,
    public timestamp: number,
    public event: RecordEvent,
    public extensionId: string,
    public icon: string,
    public name: string,
    public version: string,
    public remark: string,
    public ruleId: string,
    public groupId: string
  ) {}

  static buildPlain(info: chrome.management.ExtensionInfo, event: RecordEvent) {
    return new HistoryRecord(0, Date.now(), event, info.id, "", info.name, info.version, "", "", "")
  }

  static buildWithRule(
    info: chrome.management.ExtensionInfo,
    event: RecordEvent,
    rule: ruleV2.IRuleConfig,
    matchResult: IMatchResult
  ) {
    let remark = ""
    if (matchResult?.matchTab) {
      remark = matchResult.matchTab.url ?? ""
    }

    return new HistoryRecord(
      0,
      Date.now(),
      event,
      info.id,
      "",
      info.name,
      info.version,
      remark,
      rule.id ?? "",
      ""
    )
  }

  static buildWithGroup(
    info: chrome.management.ExtensionInfo,
    event: RecordEvent,
    group: config.IGroup
  ) {
    return new HistoryRecord(
      0,
      Date.now(),
      event,
      info.id,
      "",
      info.name,
      info.version,
      "",
      "",
      group.id
    )
  }
}

export class ImageRecord {
  constructor(public id: number, public hash: string, public base64: string) {}
}
