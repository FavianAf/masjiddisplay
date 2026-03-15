'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { FinancialReport } from '@/types/laporan';
import { formatRupiah } from '@/lib/laporanUtils';

interface LaporanItemProps {
  report: FinancialReport;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function SortableLaporanItem({ report, index, onEdit, onDelete, onToggleActive }: LaporanItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: report.id || index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-6 gap-4 p-3 border-b border-gray-100 items-center ${
        report.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
      }`}
    >
      <div className="col-span-1 flex items-center justify-center">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical size={20} />
        </button>
      </div>

      <div className="col-span-1 font-mono text-sm font-semibold text-gray-700">
        {report.date}
      </div>

      <div className="col-span-1 text-emerald-600 font-bold text-sm px-2 py-1 rounded-lg inline-block">
        {formatRupiah(report.income)}
      </div>

      <div className="col-span-1 text-rose-600 font-bold text-sm px-2 py-1 rounded-lg inline-block">
        {formatRupiah(report.expense)}
      </div>

      <div className="col-span-2 text-gray-600 text-sm leading-relaxed">
        {report.note}
      </div>

      <div className="col-span-6 flex items-center justify-end gap-2 mt-2">
        <button
          onClick={onToggleActive}
          className={`p-2 rounded-lg transition ${
            report.is_active
              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title={report.is_active ? 'Nonaktifkan' : 'Aktifkan'}
        >
          {report.is_active ? <Power size={18} /> : <PowerOff size={18} />}
        </button>

        <button
          onClick={onEdit}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
          title="Edit"
        >
          <Edit size={18} />
        </button>

        <button
          onClick={onDelete}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
          title="Hapus"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function LaporanItem(props: LaporanItemProps) {
  return <SortableLaporanItem {...props} />;
}
