import { useEffect, useState } from "react"

import { attachCachedExtensionIcons } from ".../pages/Background/extension/ExtensionRepo"
import storage from ".../storage/sync"
import { filterExtensions, isExtExtension } from ".../utils/extensionHelper.js"
import {
  collectExtensionEnhancements,
  loadManagementCore,
  mergeExtensionsById
} from "../managementLoadPolicy"
import { ExtensionChannelWorker } from "../worker/ExtensionChannelWorker"

const ChannelWorker = new ExtensionChannelWorker()

export const useInit = (callback) => {
  const [extensions, setExtensions] = useState([])
  const [options, setOptions] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    let disposed = false

    const ready = async () => {
      const startedAt = Date.now()
      console.info("[ExtensionManagement] Core data loading started")

      try {
        const { extensions: list, options: allOptions } = await loadManagementCore({
          getExtensions: () => chrome.management.getAll(),
          getOptions: () => storage.options.getAll(),
          filterExtensions: (items) => filterExtensions(items, isExtExtension)
        })

        if (disposed) {
          return
        }

        // Raw management records are sufficient for the table. Cache-backed icons and
        // channels are applied later and must never block this first render.
        // Known low-probability risk: the share/export pages also reuse this hook, so a user
        // who operates them before enhancement finishes may export an empty channel value.
        // This requires unusually fast interaction (or slow cache reads) and is intentionally
        // left unhandled for now in favor of keeping the management table responsive.
        setOptions(allOptions)
        setExtensions(list)
        console.info("[ExtensionManagement] Core data loaded", {
          extensionCount: list.length,
          durationMs: Date.now() - startedAt
        })

        try {
          callback?.(list, allOptions)
        } catch (callbackError) {
          console.warn("[ExtensionManagement] Initialization callback failed", callbackError)
        }

        void enhance(list, (enhanced) => {
          if (!disposed) {
            setExtensions((current) => mergeExtensionsById(current, enhanced))
          }
        })
      } catch (loadError) {
        console.error("[ExtensionManagement] Core data loading failed", loadError)
        if (!disposed) {
          setError(loadError)
        }
      }
    }

    void ready()
    return () => {
      disposed = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (id) => {
      setExtensions((prev) => prev.filter((ext) => ext.id !== id))
    }
    try {
      chrome.management.onUninstalled.addListener(handler)
    } catch (error) {
      // Live list updates are optional; the initial API result remains usable.
      console.warn("[ExtensionManagement] Uninstall listener could not be registered", error)
      return undefined
    }
    return () => {
      chrome.management.onUninstalled.removeListener(handler)
    }
  }, [])

  useEffect(() => {
    let disposed = false
    const handler = (info) => {
      // Show the newly installed extension immediately, before optional cache reads finish.
      setExtensions((prev) => {
        if (prev.some((extension) => extension.id === info.id)) {
          return prev
        }
        return [...prev, info]
      })

      void enhance([info], (enhanced) => {
        if (!disposed) {
          setExtensions((current) => mergeExtensionsById(current, enhanced))
        }
      })
    }
    try {
      chrome.management.onInstalled.addListener(handler)
    } catch (error) {
      // Live list updates are optional; the initial API result remains usable.
      console.warn("[ExtensionManagement] Install listener could not be registered", error)
      return undefined
    }
    return () => {
      disposed = true
      chrome.management.onInstalled.removeListener(handler)
    }
  }, [])

  return [extensions, options, error]
}

async function enhance(extensions, apply) {
  const startedAt = Date.now()
  try {
    const result = await collectExtensionEnhancements(extensions, {
      loadIcons: attachCachedExtensionIcons,
      loadChannel: (extensionId) => ChannelWorker.getExtensionChannel(extensionId)
    })

    for (const enhancementError of result.errors) {
      console.warn("[ExtensionManagement] Optional cache enhancement failed", enhancementError)
    }

    apply(result.extensions)
    console.info("[ExtensionManagement] Optional cache enhancement finished", {
      extensionCount: extensions.length,
      failureCount: result.errors.length,
      durationMs: Date.now() - startedAt
    })
  } catch (error) {
    // collectExtensionEnhancements isolates expected cache failures. This final guard keeps
    // unexpected implementation errors from affecting the already-rendered table.
    console.error("[ExtensionManagement] Optional cache enhancement crashed", error)
  }
}
