import { Media } from '@/types/media';
import { parseMediaName } from '@/lib/mediaUtils';
import { Image, Youtube as YoutubeIcon, Edit2, Trash2, GripVertical } from 'lucide-react';

interface Props {
  media: Media;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isDragging?: boolean;
}

export default function MediaItem({ media, index, onEdit, onDelete, isDragging }: Props) {
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
          <YoutubeIcon className="w-8 h-8 text-red-600" />
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
        <Image className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  return (
    <div 
      className={`bg-white rounded-xl border-2 p-4 flex gap-4 items-center transition-all ${
        isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="cursor-grab text-gray-400 hover:text-gray-600">
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
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(index)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Hapus"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
