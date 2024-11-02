chrome.tabs.onUpdated.addListener(onTabUpdated)
chrome.tabs.onActivated.addListener(onTabActivated)
chrome.tabs.onRemoved.addListener(onTabRemoved)
chrome.tabs.onCreated.addListener(onTabCreated)
chrome.windows.onRemoved.addListener(onWindowRemoved)

let _currentTabUpdatedCallback
let _tabClosedCallback
let _windowClosedCallback

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

async function onTabCreated(tab) {
  if (tab.active) {
    // 这里只处理后台静默打开的标签页
    return
  }

  let waitingTime = 0
  // 等待 tab 加载完成，最多等待 9 秒
  while (tab.status === "loading") {
    if (waitingTime > 9000) {
      return
    }
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 200)
    })
    tab = await chrome.tabs.get(tab.id)
    waitingTime += 200
  }

  const tabInfo = {
    url: tab.url,
    title: tab.title,
    windowId: tab.windowId,
    id: tab.id
  }
  _lastTabInfo = tabInfo
  _currentTabUpdatedCallback?.(tabInfo)
}

function onWindowRemoved(windowId) {
  _windowClosedCallback?.(windowId)
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
  return one.windowId === other.windowId && one.id === other.id && one.url === other.url
}

export function onTabUrlChange(callback) {
  _currentTabUpdatedCallback = callback
}

export function onTabClosed(callback) {
  _tabClosedCallback = callback
}

export function onWindowClosed(callback) {
  _windowClosedCallback = callback
}
