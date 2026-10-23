"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Drag reorder for every repeater and table in the admin.
 *
 * The keyboard sensor is not optional: a drag handle that only answers to a
 * pointer locks keyboard users out of reordering entirely. Tab to a handle,
 * press space, then use the arrow keys.
 */
type SortableListProps<Item> = {
  items: Item[];
  getId: (item: Item) => string;
  onReorder: (ids: string[]) => void;
  children: (item: Item, index: number) => ReactNode;
  className?: string;
};

export function SortableList<Item>({
  items,
  getId,
  onReorder,
  children,
  className,
}: SortableListProps<Item>) {
  const sensors = useSensors(
    // A small distance threshold, so a click on a row's button is still a
    // click and not the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = items.map(getId);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;

    const next = [...ids];
    next.splice(to, 0, next.splice(from, 1)[0]!);
    onReorder(next);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <div className={className}>{items.map((item, index) => children(item, index))}</div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * One sortable row. The handle is rendered by this component rather than
 * handed out as props, so every list gets the same affordance and the same
 * accessible name.
 */
export function SortableRow({
  id,
  label,
  children,
  className,
  as: Element = "div",
}: {
  id: string;
  /** Names the handle, e.g. "Reorder: Enquire Now". */
  label: string;
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <Element
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2",
        isDragging && "relative z-10 opacity-90",
        className,
      )}
    >
      <button
        type="button"
        aria-label={label}
        className="mt-1.5 flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-slate-500 transition-colors hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </Element>
  );
}
