/**
 * Normalize persisted active-scene data before it enters UI or rule state.
 * IndexedDB values are untyped at runtime, so this boundary also removes stale
 * duplicates and malformed values left by older versions or manual imports.
 */
export function normalizeActiveSceneIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0))
  )
}

/**
 * Prefer the new collection value whenever it exists, including an empty array.
 * Falling back only when it is absent prevents an intentionally cleared state
 * from being resurrected by the legacy single-scene key.
 */
export function resolveStoredActiveSceneIds(value: unknown, legacyId: unknown): string[] {
  if (Array.isArray(value)) {
    return normalizeActiveSceneIds(value)
  }

  return typeof legacyId === "string" && legacyId.length > 0 ? [legacyId] : []
}

/**
 * Calculate one scene-toggle transition without performing storage or UI work.
 * Keeping this pure gives Popup, Options and tests exactly the same semantics.
 */
export function updateActiveSceneIds(
  currentIds: unknown,
  sceneId: string,
  active: boolean,
  exclusive: boolean
): string[] {
  const normalized = normalizeActiveSceneIds(currentIds)
  if (!sceneId) {
    return normalized
  }

  if (!active) {
    return normalized.filter((id) => id !== sceneId)
  }

  if (exclusive) {
    return [sceneId]
  }

  return normalized.includes(sceneId) ? normalized : [...normalized, sceneId]
}
