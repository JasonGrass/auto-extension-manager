export const MANAGEMENT_RENDER_TIMEOUT_MS = 15_000

export class ManagementLoadError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "ManagementLoadError"
    this.code = code
  }
}

type CoreLoadDependencies<TExtension, TOptions> = {
  getExtensions: () => Promise<TExtension[]>
  getOptions: () => Promise<TOptions>
  filterExtensions: (extensions: TExtension[]) => TExtension[]
}

export async function loadManagementCore<TExtension, TOptions>({
  getExtensions,
  getOptions,
  filterExtensions
}: CoreLoadDependencies<TExtension, TOptions>) {
  const [allExtensions, options] = await Promise.all([getExtensions(), getOptions()])

  if (!Array.isArray(allExtensions)) {
    throw new ManagementLoadError(
      "INVALID_EXTENSION_DATA",
      "chrome.management.getAll() did not return an array"
    )
  }

  const extensions = filterExtensions(allExtensions)
  if (extensions.length === 0) {
    throw new ManagementLoadError(
      "NO_EXTENSION_DATA",
      "No extension records were returned for the management table"
    )
  }

  if (!options || typeof options !== "object") {
    throw new ManagementLoadError(
      "INVALID_OPTIONS_DATA",
      "Extension management options are unavailable"
    )
  }

  return { extensions, options }
}

type ExtensionWithId = { id: string }

type EnhancementDependencies<TExtension extends ExtensionWithId> = {
  loadIcons: (extensions: TExtension[]) => Promise<TExtension[]>
  loadChannel: (extensionId: string) => Promise<string>
}

export type ExtensionEnhancementError = {
  stage: "icons" | "channel"
  extensionId?: string
  error: unknown
}

/**
 * Cache information is optional. Every failed cache read is reported while the raw
 * management API records remain usable by the caller.
 */
export async function collectExtensionEnhancements<TExtension extends ExtensionWithId>(
  extensions: TExtension[],
  { loadIcons, loadChannel }: EnhancementDependencies<TExtension>
) {
  const [iconResults, channelResults] = await Promise.all([
    Promise.allSettled([loadIcons(extensions)]),
    Promise.allSettled(extensions.map((extension) => loadChannel(extension.id)))
  ])

  const errors: ExtensionEnhancementError[] = []
  let enhanced = extensions
  const iconResult = iconResults[0]

  if (iconResult.status === "fulfilled") {
    enhanced = mergeExtensionsById(enhanced, iconResult.value)
  } else {
    errors.push({ stage: "icons", error: iconResult.reason })
  }

  const channelUpdates: Array<TExtension & { channel: string }> = []
  for (let index = 0; index < extensions.length; index++) {
    const extension = extensions[index]
    const channelResult = channelResults[index]
    if (channelResult.status === "fulfilled") {
      channelUpdates.push({ ...extension, channel: channelResult.value })
    } else {
      errors.push({
        stage: "channel",
        extensionId: extension.id,
        error: channelResult.reason
      })
    }
  }

  return {
    extensions: mergeExtensionsById(enhanced, channelUpdates),
    errors
  }
}

export function mergeExtensionsById<TExtension extends ExtensionWithId>(
  current: TExtension[],
  updates: TExtension[]
) {
  const updateById = new Map(updates.map((extension) => [extension.id, extension]))
  return current.map((extension) => {
    const update = updateById.get(extension.id)
    return update ? { ...extension, ...update } : extension
  })
}
