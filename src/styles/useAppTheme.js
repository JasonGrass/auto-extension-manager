import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import storage from ".../storage/sync"
import {
  applyThemeToDocument,
  darkTheme,
  getThemePreference,
  lightTheme,
  observeThemePreference
} from "./themes"

export default function useAppTheme(initialPreference) {
  const initial = useRef(initialPreference)
  const [preference, setPreference] = useState(() =>
    initialPreference
      ? getThemePreference(
          initialPreference.mode,
          window.matchMedia("(prefers-color-scheme: dark)").matches
        )
      : null
  )
  const observer = useRef(null)

  useEffect(() => {
    const subscription = observeThemePreference({
      readMode: async () => (await storage.options.getAll()).setting?.darkMode,
      mediaQuery: window.matchMedia("(prefers-color-scheme: dark)"),
      storageChanges: chrome.storage.onChanged,
      initialPreference: initial.current,
      onChange: (next) =>
        setPreference((current) =>
          current?.mode === next.mode && current?.isDarkMode === next.isDarkMode ? current : next
        )
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
