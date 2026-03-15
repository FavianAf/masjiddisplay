'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FinancialReport } from '@/types/laporan';
import LaporanItem from './LaporanItem';

interface LaporanListProps {
  reports: FinancialReport[];
  onReorder: (newOrder: FinancialReport[]) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onToggleActive: (index: number) => void;
}

export default function LaporanList({
  reports,
  onReorder,
  onEdit,
  onDelete,
  onToggleActive,
}: LaporanListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = reports.findIndex((r) => r.id === active.id);
      const newIndex = reports.findIndex((r) => r.id === over.id);
      onReorder(arrayMove(reports, oldIndex, newIndex));
    }
  };

  if (reports.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500">Belum ada laporan keuangan</p>
        <p className="text-sm text-gray-400 mt-2">Klik tombol "Tambah Laporan" untuk memulai</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-6 bg-gray-50 p-3 border-b border-gray-200 text-sm font-bold text-gray-600 uppercase tracking-widest">
        <div className="col-span-1"></div>
        <div className="col-span-1">Tanggal</div>
        <div className="col-span-1">Masuk</div>
        <div className="col-span-1">Keluar</div>
        <div className="col-span-2">Keterangan</div>
        <div className="col-span-6"></div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={reports.map((r) => r.id || '')} strategy={verticalListSortingStrategy}>
          {reports.map((report, index) => (
            <LaporanItem
              key={report.id || index}
              report={report}
              index={index}
              onEdit={() => onEdit(index)}
              onDelete={() => onDelete(index)}
              onToggleActive={() => onToggleActive(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
