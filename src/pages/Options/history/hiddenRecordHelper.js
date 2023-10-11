import localforage from "localforage"

const forage = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "LocalOptions",
  version: 1.0,
  storeName: "history"
})

export const getHiddenExtIds = async () => {
  let hiddenExtIds = []
  try {
    hiddenExtIds = await forage.getItem("hidden_ext_ids")
    if (!hiddenExtIds) {
      await forage.setItem("hidden_ext_ids", [])
      hiddenExtIds = []
    }
  } catch (error) {
    console.warn("read hidden_ext_ids fail.", error)
    await forage.setItem("hidden_ext_ids", [])
    hiddenExtIds = []
  }

  return hiddenExtIds
}

export const addHiddenExtId = async (extId) => {
  const hiddenExtIds = await getHiddenExtIds()
  if (hiddenExtIds.includes(extId)) {
    return
  }

  hiddenExtIds.push(extId)
  await forage.setItem("hidden_ext_ids", hiddenExtIds)
}

export const removeHiddenExtId = async (extId) => {
  const hiddenExtIds = await getHiddenExtIds()
  if (!hiddenExtIds.includes(extId)) {
    return
  }

  hiddenExtIds.splice(hiddenExtIds.indexOf(extId), 1)
  await forage.setItem("hidden_ext_ids", hiddenExtIds)
}
