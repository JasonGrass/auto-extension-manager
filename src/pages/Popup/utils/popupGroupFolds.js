import localforage from "localforage"

const groupExpandForage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "LocalOptions",
  version: 1.0,
  storeName: "popupGroupExpand"
})

let foldedGroups = Object.create(null)
let loadPromise

export function loadPopupGroupFolds() {
  return (loadPromise ??= groupExpandForage
    .iterate((value, key) => {
      foldedGroups[key] = Boolean(value)
    })
    .then(() => foldedGroups)
    .catch(() => (foldedGroups = {})))
}

export function savePopupGroupFold(groupId, fold) {
  foldedGroups[groupId] = fold
  return fold ? groupExpandForage.setItem(groupId, true) : groupExpandForage.removeItem(groupId)
}
