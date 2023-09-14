import React, { memo, useEffect, useState } from "react"

import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  )
}

const SceneList = memo(({ originItems, childrenBuilder, onDropFinish }) => {
  const [sceneList, setSceneList] = useState([])
  useEffect(() => {
    setSceneList(originItems)
  }, [originItems])

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over.id) {
      const activeIndex = sceneList.indexOf(sceneList.find((item) => item.id === active.id))
      const overIndex = sceneList.indexOf(sceneList.find((item) => item.id === over.id))
      const newList = arrayMove(sceneList, activeIndex, overIndex)
      onDropFinish(newList)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="scene-item-container">
        <SortableContext items={sceneList} strategy={rectSortingStrategy}>
          {sceneList.map((scene) => (
            <SortableItem id={scene.id} key={scene.id}>
              {childrenBuilder(scene)}
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  )
})

export default SceneList
