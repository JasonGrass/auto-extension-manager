import { GroupOptions } from "./GroupOptions"
import { ManageOptions } from "./ManageOptions"
import { RuleConfigOptions } from "./RuleConfigOptions"
import { SceneOptions } from "./SceneOptions"
import { LocalOptionsStorage, SyncOptionsStorage } from "./options-storage"
import storage from "./webext-options"

export default storage
export {
  LocalOptionsStorage,
  SyncOptionsStorage,
  GroupOptions,
  SceneOptions,
  RuleConfigOptions,
  ManageOptions,
  storage
}
