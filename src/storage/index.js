import { GroupOptions, formatGroups, isSpecialGroup } from "./GroupOptions"
import { ManageOptions } from "./ManageOptions"
import { RuleConfigOptions } from "./RuleConfigOptions"
import { SceneOptions } from "./SceneOptions"
import { SyncOptionsStorage } from "./options-storage"
import storage from "./webext-options"

export default storage
export {
  SyncOptionsStorage,
  GroupOptions,
  SceneOptions,
  RuleConfigOptions,
  ManageOptions,
  storage,
  formatGroups,
  isSpecialGroup
}
