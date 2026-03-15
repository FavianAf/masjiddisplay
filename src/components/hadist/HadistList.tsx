'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Hadist } from '@/types/hadist';
import HadistItem from './HadistItem';

interface HadistListProps {
  hadists: Hadist[];
  onReorder: (newOrder: Hadist[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onToggleActive: (index: number) => void;
}

function SortableHadistItem({ hadist, index, onEdit, onDelete, onToggleActive }: {
  hadist: Hadist;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onToggleActive: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <HadistItem
        hadist={hadist}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
      />
    </div>
  );
}

export default function HadistList({
  hadists,
  onReorder,
  onEdit,
  onDelete,
  onToggleActive,
}: HadistListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = active.id as number;
      const newIndex = over.id as number;
      onReorder(arrayMove(hadists, oldIndex, newIndex));
    }
  };

  if (hadists.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-gray-400 mb-3"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p className="text-gray-600 font-medium">
          Belum ada hadist/quran
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Klik &quot;+ Tambah Hadist&quot; untuk menambahkan
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={hadists.map((_, index) => index)} strategy={verticalListSortingStrategy}>
        {hadists.map((hadist, index) => (
          <SortableHadistItem
            key={hadist.id || index}
            hadist={hadist}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
