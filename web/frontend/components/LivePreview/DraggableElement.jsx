import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { GripVertical } from "lucide-react";
import { selectElement, selectSelectedElementId } from "../../features/editor/editorSlice";
import "./LivePreview.css";

/**
 * DraggableElement - A wrapper component that makes elements clickable and draggable
 * 
 * Note: This component is designed to work with @dnd-kit when installed.
 * For now, it provides click-to-select functionality and visual styling.
 * 
 * To enable full drag-and-drop:
 * 1. Install: npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
 * 2. Wrap parent with DndContext and SortableContext
 * 3. Uncomment the useSortable hook below
 */

export default function DraggableElement({ 
  element, 
  children,
  isDragEnabled = true,
  // These would come from useSortable when @dnd-kit is installed:
  // attributes,
  // listeners,
  // setNodeRef,
  // transform,
  // transition,
  // isDragging,
}) {
  const dispatch = useDispatch();
  const selectedElementId = useSelector(selectSelectedElementId);
  const isSelected = selectedElementId === element.id;

  const handleClick = (e) => {
    e.stopPropagation();
    dispatch(selectElement(element.id));
  };

  // Placeholder styles - replace with actual transform when using @dnd-kit
  const style = {
    // transform: CSS.Transform.toString(transform),
    // transition,
    // opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      // ref={setNodeRef} // Uncomment when using @dnd-kit
      className={`draggable-element ${isSelected ? "selected" : ""}`}
      style={style}
      onClick={handleClick}
      data-element-id={element.id}
      data-element-type={element.type}
    >
      {isDragEnabled && (
        <div 
          className="drag-handle"
          // {...attributes} // Uncomment when using @dnd-kit
          // {...listeners}  // Uncomment when using @dnd-kit
        >
          <GripVertical size={16} />
        </div>
      )}
      <div className="element-content">
        {children}
      </div>
      {isSelected && (
        <div className="selection-indicator">
          <span className="element-type-badge">{element.type}</span>
        </div>
      )}
    </div>
  );
}

/**
 * When @dnd-kit is installed, use this wrapper pattern:
 * 
 * import { useSortable } from '@dnd-kit/sortable';
 * import { CSS } from '@dnd-kit/utilities';
 * 
 * function SortableDraggableElement({ element, children }) {
 *   const {
 *     attributes,
 *     listeners,
 *     setNodeRef,
 *     transform,
 *     transition,
 *     isDragging,
 *   } = useSortable({ id: element.id });
 * 
 *   return (
 *     <DraggableElement
 *       element={element}
 *       attributes={attributes}
 *       listeners={listeners}
 *       setNodeRef={setNodeRef}
 *       transform={transform}
 *       transition={transition}
 *       isDragging={isDragging}
 *     >
 *       {children}
 *     </DraggableElement>
 *   );
 * }
 */
