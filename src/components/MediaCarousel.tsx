'use client';

import { Media } from '@/types/media';
import { motion, AnimatePresence } from 'framer-motion';
import OverlayText from './OverlayText';

interface Props {
  medias: Media[];
  currentIndex: number;
}

export default function MediaCarousel({ medias, currentIndex }: Props) {
  const currentMedia = medias[currentIndex];

  if (!currentMedia) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentMedia.id || currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 w-full h-full"
      >
        {currentMedia.media_type === 'youtube' && (
          <iframe
            src={currentMedia.media_value}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {(currentMedia.media_type === 'url' || currentMedia.media_type === 'file') && (
          <div className="relative w-full h-full">
            <img
              src={currentMedia.media_value}
              alt={currentMedia.media_name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <OverlayText media_name={currentMedia.media_name} />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
