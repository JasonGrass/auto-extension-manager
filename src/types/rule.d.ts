declare namespace rule {

  /**
   * 规则匹配的对象和方式
  */
  export interface IMatch {
    /** 匹配的方式，域名匹配或者情景模式匹配 */
    matchMode: "host" | "scene",
    /** 通配符 or 正则 */
    matchMethod: "wildcard" | "regex",
    /** 匹配的域名 */
    matchHost?: string[],
    /** 匹配的情景模式ID */
    matchScene?: string,
  }

  /**
   * 规则执行的目标，一个扩展组或者若干扩展
   */
  export interface ITarget {
    /** 目标类型：扩展组 还是 单独的扩展 */
    targetType: "group" | "single",
    /** 目标扩展ID */
    targetExtensions: string[],
    /** 目标扩展组ID */
    targetGroup?: string
  }

  /** 规则执行动作 */
  export interface IAction {
    actionType: "openWhenMatched" | "closeWhenMatched" | "openOnlyWhenMatched" | "closeOnlyWhenMatched"
  }

  export interface IRuleConfig {
    id?: string,
    match: IMatch,
    target: ITarget,
    action: IAction,
  }


}
