import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LightboxProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialIndex?: number;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  isOpen,
  onClose,
  title,
  initialIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  // Sync activeIndex with initialIndex when the lightbox is opened
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard events (Left, Right, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[activeIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[99999] flex flex-col justify-between items-center select-none py-6 md:py-8"
      >
        {/* Top Header Row */}
        <div className="w-full flex items-center justify-between px-6 md:px-10 z-10 shrink-0">
          <div className="text-white/60 font-black text-xs md:text-sm tracking-widest uppercase bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
          <button
            onClick={onClose}
            className="size-10 md:size-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">close</span>
          </button>
        </div>

        {/* Main Image Viewport Row */}
        <div className="w-full flex-1 flex items-center justify-between px-2 md:px-8 relative max-h-[65vh]">
          {/* Previous Arrow Button */}
          <button
            onClick={handlePrev}
            className="size-12 md:size-16 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 backdrop-blur-sm shrink-0 shadow-xl border border-white/5"
          >
            <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
          </button>

          {/* Center Image */}
          <div className="flex-1 h-full flex items-center justify-center p-2 relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={currentImage}
                alt={title || `Slide ${activeIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </AnimatePresence>
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={handleNext}
            className="size-12 md:size-16 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 backdrop-blur-sm shrink-0 shadow-xl border border-white/5"
          >
            <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
          </button>
        </div>

        {/* Bottom Metadata & Thumbnail Row */}
        <div className="w-full max-w-4xl px-6 md:px-10 text-center space-y-4 md:space-y-6 shrink-0 z-10">
          {/* Caption */}
          {title && (
            <h4 className="text-white font-bold text-sm md:text-base tracking-wide uppercase line-clamp-1 opacity-90">
              {title}
            </h4>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 px-4 scrollbar-thin">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`size-14 md:size-20 rounded-xl overflow-hidden border-2 transition-all duration-300 transform ${
                    idx === activeIndex
                      ? 'border-accent scale-105 shadow-lg shadow-accent/30 opacity-100 ring-2 ring-accent/20'
                      : 'border-white/10 opacity-40 hover:opacity-80 hover:scale-105'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
