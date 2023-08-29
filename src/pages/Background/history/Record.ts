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
}

export class ImageRecord {
  constructor(public id: number, public hash: string, public base64: string) {}
}
