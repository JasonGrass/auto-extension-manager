chrome.tabs.onUpdated.addListener(onTabUpdated)
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  logEvent("tabs.onActivated", { id: tabId, windowId })
  if (_lastFocusedWindowId !== undefined && windowId !== _lastFocusedWindowId) {
    console.log("[Rule trace] event.ignored", {
      event: "tabs.onActivated",
      tabId,
      windowId,
      reason: "unfocused-window"
    })
    return
  }
  invalidateCurrentTab()
  checkCurrentTab()
})
chrome.tabs.onRemoved.addListener(onTabRemoved)
chrome.tabs.onCreated.addListener(onTabCreated)
chrome.tabs.onReplaced?.addListener(onTabReplaced)
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)
chrome.windows.onRemoved.addListener(onWindowRemoved)

let _currentTabUpdatedCallback
let _currentTabChangingCallback
let _currentTabReady = true
let _tabClosedCallback
let _windowClosedCallback
let _lastTabInfo
let _lastFocusedWindowId
let _nextNavigationId = 0
let _observationRevision = 0
let _focusQueryRevision = 0
const _states = new Map()
const _earlyChanges = new Map()
const _removedTabs = new Set()

function logEvent(event, tab, details = {}) {
  console.log("[Rule trace] event.received", {
    event,
    tabId: tab?.id,
    windowId: tab?.windowId,
    navigationId: _states.get(tab?.id)?.navigationId,
    committedUrl: tab?.url ?? null,
    pendingUrl: tab?.pendingUrl ?? null,
    status: tab?.status,
    ...details
  })
}

function toTabInfo(tab) {
  const info = { url: tab.url, title: tab.title, windowId: tab.windowId, id: tab.id }
  if (tab.pendingUrl) info.pendingUrl = tab.pendingUrl
  if (tab.status) info.status = tab.status
  return info
}

function observe(tab, changeInfo = {}) {
  const previous = _states.get(tab.id)
  const snapshot = toTabInfo(tab)
  const urlChanged = Boolean(changeInfo.url) || Boolean(previous && previous.tab.url !== tab.url)
  const pendingChanged = previous?.tab.pendingUrl !== snapshot.pendingUrl
  const started = changeInfo.status === "loading" && previous && previous.tab.status !== "loading"
  const newNavigation =
    !previous ||
    (!previous.tab.pendingUrl &&
      previous.tab.status !== "loading" &&
      (pendingChanged || started || urlChanged))
  const originUrl = newNavigation ? (previous?.tab.url ?? tab.url) : previous.originUrl
  const committed = newNavigation ? urlChanged : previous.committed || urlChanged
  const change = {
    revision: ++_observationRevision,
    tab: snapshot,
    navigationId: newNavigation ? `${tab.id}:${++_nextNavigationId}` : previous.navigationId,
    phase: snapshot.pendingUrl ? "pending" : "committed",
    originUrl,
    committed,
    cancelled: Boolean(
      previous?.tab.pendingUrl && !snapshot.pendingUrl && !committed && originUrl === snapshot.url
    ),
    changed: Boolean(urlChanged || pendingChanged || started)
  }
  _states.set(tab.id, change)
  return change
}

function onTabUpdated(tabId, changeInfo, tab) {
  const change = observe(tab, changeInfo)
  logEvent("tabs.onUpdated", tab, {
    changedFields: Object.keys(changeInfo),
    phase: change.phase,
    cancelled: change.cancelled
  })
  if (!change.changed) {
    console.log("[Rule trace] event.ignored", {
      event: "tabs.onUpdated",
      tabId,
      reason: "navigation-unchanged"
    })
    return
  }
  if (_lastFocusedWindowId === tab.windowId && _lastTabInfo?.id === tabId) {
    updateCurrentTab(tab, change, true)
  } else if (_currentTabUpdatedCallback && tab.active) {
    // active is scoped to a window, not to the browser's currently focused tab.
    checkCurrentTab(change)
  } else notifyTabChange(undefined, change)
}

function onTabCreated(tab) {
  _removedTabs.delete(tab.id)
  const change = observe(tab)
  logEvent("tabs.onCreated", tab, { phase: change.phase })
  if (!tab.url && !tab.pendingUrl) return
  if (tab.active) checkCurrentTab(change)
  else notifyTabChange(undefined, change)
}

function onTabRemoved(tabId, removeInfo) {
  logEvent("tabs.onRemoved", { id: tabId, windowId: removeInfo?.windowId })
  _removedTabs.add(tabId)
  _states.delete(tabId)
  _earlyChanges.delete(tabId)
  _tabClosedCallback?.(tabId, removeInfo)
  if (_lastTabInfo?.id === tabId) {
    _lastTabInfo = undefined
    checkCurrentTab()
  }
}

function onTabReplaced(addedTabId, removedTabId) {
  logEvent("tabs.onReplaced", { id: addedTabId }, { removedTabId })
  onTabRemoved(removedTabId, {})
  chrome.tabs
    .get(addedTabId)
    .then((tab) => {
      if (tab) onTabCreated(tab)
    })
    .catch((error) => console.warn("Read replaced tab failed", error))
}

function onWindowRemoved(windowId) {
  logEvent("windows.onRemoved", { windowId })
  for (const [id, change] of _states) {
    if (change.tab.windowId === windowId) {
      _states.delete(id)
      _earlyChanges.delete(id)
    }
  }
  _windowClosedCallback?.(windowId)
}

function onWindowFocusChanged(windowId) {
  logEvent("windows.onFocusChanged", { windowId })
  _lastFocusedWindowId = windowId
  invalidateCurrentTab()
  if (windowId !== chrome.windows.WINDOW_ID_NONE) checkCurrentTab()
}

function invalidateCurrentTab() {
  _focusQueryRevision++
  _currentTabReady = false
  _lastTabInfo = undefined
  _currentTabChangingCallback?.()
}

function checkCurrentTab(changedTab) {
  if (
    changedTab &&
    _currentTabReady &&
    changedTab.tab.windowId === _lastFocusedWindowId &&
    changedTab.tab.id !== _lastTabInfo?.id
  ) {
    invalidateCurrentTab()
  }
  // Deliver navigation independently of a focus query that may fail or be superseded.
  if (changedTab) notifyTabChange(undefined, changedTab)
  if (_lastFocusedWindowId === chrome.windows.WINDOW_ID_NONE) return
  const queryRevision = ++_focusQueryRevision
  const observedRevision = _observationRevision
  console.log("[Rule trace] focus.query.started", { queryRevision })
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (queryRevision !== _focusQueryRevision || chrome.runtime?.lastError || !tabs?.length) {
      console.log("[Rule trace] focus.query.skipped", {
        queryRevision,
        stale: queryRevision !== _focusQueryRevision,
        error: chrome.runtime?.lastError?.message,
        tabCount: tabs?.length
      })
      return
    }
    const observed = _states.get(tabs[0].id)
    if (_removedTabs.has(tabs[0].id)) return
    const tab = observed?.revision > observedRevision ? { ...tabs[0], ...observed.tab } : tabs[0]
    logEvent("focus.query.completed", tab, { queryRevision })
    _lastFocusedWindowId = tab.windowId
    updateCurrentTab(tab, observe(tab))
  })
}

function updateCurrentTab(tab, change, forceNotify = false) {
  _currentTabReady = true
  const info = toTabInfo(tab)
  const same =
    _lastTabInfo &&
    _lastTabInfo.id === info.id &&
    _lastTabInfo.windowId === info.windowId &&
    _lastTabInfo.url === info.url &&
    _lastTabInfo.pendingUrl === info.pendingUrl
  _lastTabInfo = info
  if (same && !forceNotify) return false
  notifyTabChange(info, change)
  return true
}

function notifyTabChange(tabInfo, change) {
  if (!_currentTabUpdatedCallback) {
    if (change) _earlyChanges.set(change.tab.id, change)
    return
  }
  _currentTabUpdatedCallback(tabInfo, change)
}

export function onTabUrlChange(callback, currentTab) {
  _currentTabUpdatedCallback = callback
  if (!_currentTabReady) currentTab = undefined
  if (currentTab && _removedTabs.has(currentTab.id)) currentTab = undefined
  if (currentTab && !_lastTabInfo) {
    const observed = _states.get(currentTab.id)
    _lastTabInfo = observed?.tab ?? toTabInfo(currentTab)
    if (!observed) observe(currentTab)
  }
  if (currentTab && _lastFocusedWindowId === undefined) _lastFocusedWindowId = currentTab.windowId
  for (const change of _earlyChanges.values()) _currentTabUpdatedCallback(undefined, change)
  _earlyChanges.clear()
  return _lastTabInfo
}
export function onCurrentTabChanging(callback) {
  _currentTabChangingCallback = callback
  if (!_currentTabReady) callback()
}
export function onTabClosed(callback) {
  _tabClosedCallback = callback
}
export function onWindowClosed(callback) {
  _windowClosedCallback = callback
}
export function getTabNavigation(tabId) {
  return _states.get(tabId)
}
