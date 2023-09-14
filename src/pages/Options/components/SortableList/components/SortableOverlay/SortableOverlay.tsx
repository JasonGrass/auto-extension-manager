import React from "react"
import type { PropsWithChildren } from "react"

import { DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core"
import type { DropAnimation } from "@dnd-kit/core"

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4"
      }
    }
  })
}

interface Props {}

export function SortableOverlay({ children }: PropsWithChildren<Props>) {
  return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
}
