chrome.tabs.onUpdated.addListener(onTabUpdated)
chrome.tabs.onActivated.addListener(onTabActivated)

let _currentTabUpdatedCallback
let _lastTabInfo

function onTabActivated(activeInfo) {
  checkCurrentTab()
}

function onTabUpdated(tabId, changeInfo, tab) {
  checkCurrentTab()
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

    if (_currentTabUpdatedCallback) {
      _currentTabUpdatedCallback(tabInfo)
    }
  })
}

function isSameTabInfo(one, other) {
  return (
    one.windowId === other.windowId &&
    one.id === other.id &&
    one.url === other.url
  )
}

function onTabUrlChange(callback) {
  _currentTabUpdatedCallback = callback
}

export default onTabUrlChange
