'use client';

import { RunningText } from '@/types/runningText';

interface RunningTextItemProps {
  runningText: RunningText;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onToggleActive: (index: number) => void;
  isDragging: boolean;
}

export default function RunningTextItem({ runningText, index, onEdit, onDelete, onToggleActive, isDragging }: RunningTextItemProps) {
  return (
    <div
      className={`bg-white border-2 border-emerald-200 rounded-lg p-4 mb-3 transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-medium text-sm line-clamp-2">
            {runningText.text}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggleActive(index)}
            className={`p-2 rounded-lg transition ${
              runningText.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={runningText.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {runningText.is_active ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </>
              )}
            </svg>
          </button>

          <button
            onClick={() => onEdit(index)}
            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
            title="Edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(index)}
            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
            title="Hapus"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
