declare namespace rule {
  export type MatchMethod = "wildcard" | "regex"

  /**
   * 规则匹配的对象和方式
   */
  export interface IMatch {
    /** 匹配的方式，域名匹配或者情景模式匹配 */
    matchMode: "host" | "scene"
    /** 通配符 or 正则 */
    matchMethod: MatchMethod
    /** 匹配的域名 */
    matchHost?: string[]
    /** 匹配的情景模式ID */
    matchScene?: string
  }

  /**
   * 规则执行的目标，一个扩展组或者若干扩展
   */
  export interface ITarget {
    /** 目标类型：扩展组 还是 单独的扩展 */
    targetType: "group" | "single"
    /** 目标扩展ID */
    targetExtensions: string[]
    /** 目标扩展组ID */
    targetGroup?: string
  }

  export type ActionType =
    | "openWhenMatched"
    | "closeWhenMatched"
    | "openOnlyWhenMatched"
    | "closeOnlyWhenMatched"

  export type ActionTime = "none" | "current" | "notCurrent" | "any" | "noAny"

  /** 规则执行动作 */
  export interface IAction {
    actionType: ActionType
    refreshAfterOpen?: boolean
    refreshAfterClose?: boolean
    isAdvanceMode?: boolean
    timeWhenEnable?: ActionTime
    timeWhenDisable?: ActionTime
  }

  export interface IRuleConfig {
    id?: string
    match: IMatch
    target: ITarget
    action: IAction
    enable: boolean
  }
}

declare namespace ruleV2 {
  export type MatchMethod = "wildcard" | "regex"
  export type Relationship = "and" | "or"
  export type TriggerType = "urlTrigger" | "sceneTrigger" | "osTrigger" | "periodTrigger"
  export type OsType = "mac" | "win" | "android" | "cros" | "linux" | "openbsd" | "fuchsia"

  export interface ITrigger {
    trigger: TriggerType
    config: IUrlTriggerConfig | ISceneTriggerConfig | IOsTriggerConfig | IPeriodTriggerConfig
  }

  export interface IUrlTriggerConfig {
    matchMethod: MatchMethod
    matchUrl: string[]
  }

  export interface ISceneTriggerConfig {
    sceneId: string
  }

  export interface IOsTriggerConfig {
    os: OsType[]
  }

  export interface IPeriodTriggerConfig {
    periods: { start: string; end: string }[]
  }

  export interface IMatch {
    relationship: Relationship
    triggers: ITrigger[]
  }

  export interface ITarget {
    groups: string[]
    extensions: string[]
  }

  export type ActionType =
    | "openWhenMatched"
    | "closeWhenMatched"
    | "openOnlyWhenMatched"
    | "closeOnlyWhenMatched"
    | "custom"

  export type TimeWhenEnable = "none" | "match" | "notMatch"
  export type TimeWhenDisable = "none" | "match" | "notMatch" | "closeWindow"

  export type UrlMatchType = "currentMatch" | "anyMatch" | "currentNotMatch" | "allNotMatch"

  export interface ICustomAction {
    timeWhenEnable: TimeWhenEnable
    urlMatchWhenEnable?: UrlMatchType
    timeWhenDisable: TimeWhenDisable
    urlMatchWhenDisable?: UrlMatchType
  }

  export interface IAction {
    actionType: ActionType
    reloadAfterEnable: boolean
    reloadAfterDisable: boolean
    custom?: ICustomAction
  }

  export interface IRuleConfig {
    id?: string
    version: number
    enable: boolean
    match?: IMatch
    target?: ITarget
    action?: IAction
  }
}
