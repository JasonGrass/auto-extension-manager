import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import storage from ".../storage/sync"
import { applyThemeToDocument, darkTheme, lightTheme, observeThemePreference } from "./themes"

export default function useAppTheme() {
  const [preference, setPreference] = useState(null)
  const observer = useRef(null)

  useEffect(() => {
    const subscription = observeThemePreference({
      readMode: async () => (await storage.options.getAll()).setting?.darkMode,
      mediaQuery: window.matchMedia("(prefers-color-scheme: dark)"),
      storageChanges: chrome.storage.onChanged,
      onChange: setPreference
    })
    observer.current = subscription
    return () => {
      subscription.dispose()
      observer.current = null
    }
  }, [])

  const isDarkMode = preference?.isDarkMode ?? false
  const currentTheme = isDarkMode ? darkTheme : lightTheme
  useLayoutEffect(() => {
    if (preference) applyThemeToDocument(currentTheme, isDarkMode)
  }, [currentTheme, isDarkMode, preference])

  const setThemeMode = useCallback((mode) => observer.current?.setMode(mode), [])
  return {
    currentTheme,
    isDarkMode,
    themeReady: preference !== null,
    themeMode: preference?.mode,
    setThemeMode
  }
}
