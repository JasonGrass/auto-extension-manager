import { GroupOptions, formatGroups, isSpecialGroup } from "./GroupOptions"
import { ManageOptions } from "./ManageOptions"
import { RuleConfigOptions } from "./RuleConfigOptions"
import { SceneOptions } from "./SceneOptions"
import { OptionStorageViewProvider, SyncOptionsStorage } from "./options-storage"

const helper = {
  formatGroups,
  isSpecialGroup,
  view: OptionStorageViewProvider
}

const storage = {
  options: SyncOptionsStorage,
  scene: SceneOptions,
  group: GroupOptions,
  management: ManageOptions,
  rule: RuleConfigOptions,
  helper
}

export default storage
