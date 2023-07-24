chrome.tabs.onUpdated.addListener(onTabUpdated)
chrome.tabs.onActivated.addListener(onTabActivated)
chrome.tabs.onRemoved.addListener(onTabRemoved)

let _currentTabUpdatedCallback
let _tabClosedCallback
let _lastTabInfo

function onTabActivated(activeInfo) {
  checkCurrentTab()
}

function onTabUpdated(tabId, changeInfo, tab) {
  checkCurrentTab()
}

function onTabRemoved(tabId, removeInfo) {
  if (_lastTabInfo?.id !== tabId) {
    _tabClosedCallback?.(tabId, removeInfo)
  }
}

function checkCurrentTab() {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length < 1) {
      return
    }
    const tab = tabs[0]
    const tabInfo = {
      url: tab.url,
      title: tab.title,
      windowId: tab.windowId,
      id: tab.id
    }

    if (_lastTabInfo && isSameTabInfo(_lastTabInfo, tabInfo)) {
      return
    }
    _lastTabInfo = tabInfo

    _currentTabUpdatedCallback?.(tabInfo)
  })
}

function isSameTabInfo(one, other) {
  return (
    one.windowId === other.windowId &&
    one.id === other.id &&
    one.url === other.url
  )
}

export function onTabUrlChange(callback) {
  _currentTabUpdatedCallback = callback
}

export function onTabClosed(callback) {
  _tabClosedCallback = callback
}
