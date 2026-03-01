'use client';

import { Media } from '@/types/media';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { parseMediaName } from '@/lib/mediaUtils';

interface Props {
  medias: Media[];
  onReorder: (medias: Media[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

function SortableItem({ media, index, onEdit, onDelete }: { media: Media; index: number; onEdit: (index: number) => void; onDelete: (index: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: media.id || index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { title, subtitle } = parseMediaName(media.media_name);

  const mediaTypeLabels = {
    url: 'URL Gambar',
    youtube: 'YouTube',
    file: 'File Upload'
  };

  const renderPreview = () => {
    if (media.media_type === 'youtube') {
      return (
        <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">YT</span>
          </div>
        </div>
      );
    }
    
    if (media.media_type === 'file' && media.file) {
      return (
        <div className="w-16 h-16 rounded-lg overflow-hidden">
          <img
            src={URL.createObjectURL(media.file)}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    if (media.media_value) {
      return (
        <div className="w-16 h-16 rounded-lg overflow-hidden">
          <img
            src={media.media_value}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/64?text=Error';
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-xs">IMG</span>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border-2 border-gray-200 p-4 flex gap-4 items-center transition-all hover:border-gray-300"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      {renderPreview()}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            media.media_type === 'youtube' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {mediaTypeLabels[media.media_type]}
          </span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            media.is_active 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {media.is_active ? 'Aktif' : 'Non-aktif'}
          </span>
        </div>
        <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
        {subtitle && <p className="text-sm text-gray-600 truncate">{subtitle}</p>}
        <p className="text-xs text-gray-500 mt-1">
          {media.start_time} - {media.end_time}
        </p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(index)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(index)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Hapus"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function MediaList({ medias, onReorder, onEdit, onDelete }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = medias.findIndex(m => (m.id || medias.indexOf(m).toString()) === active.id);
      const newIndex = medias.findIndex(m => (m.id || medias.indexOf(m).toString()) === over.id);

      const newMedias = arrayMove(medias, oldIndex, newIndex);
      onReorder(newMedias);
    }
  }

  if (medias.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <p className="text-gray-500">Belum ada media. Klik &quot;Tambah Media&quot; untuk mulai.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={medias.map((m, i) => m.id || i.toString())} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {medias.map((media, index) => (
            <SortableItem
              key={media.id || index}
              media={media}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
