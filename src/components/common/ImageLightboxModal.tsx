import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Download,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface LightboxImageItem {
  url: string;
  title: string;
  caption?: string;
}

interface ImageLightboxModalProps {
  image: LightboxImageItem;
  images?: LightboxImageItem[];
  currentIndex?: number;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  image,
  images,
  currentIndex: initialIndex,
  onClose
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(() => {
    if (initialIndex !== undefined && initialIndex >= 0) return initialIndex;
    if (images && images.length > 0) {
      const idx = images.findIndex(img => img.url === image.url);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const activeImageList = images && images.length > 0 ? images : [image];
  const currentImage = activeImageList[activeImageIndex] || image;
  const hasMultiple = activeImageList.length > 1;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Erro ao alternar tela cheia:', err);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePrevImage = useCallback(() => {
    if (!hasMultiple) return;
    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : activeImageList.length - 1));
    handleResetZoom();
  }, [hasMultiple, activeImageList.length]);

  const handleNextImage = useCallback(() => {
    if (!hasMultiple) return;
    setActiveImageIndex(prev => (prev < activeImageList.length - 1 ? prev + 1 : 0));
    handleResetZoom();
  }, [hasMultiple, activeImageList.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (scale > 1) {
        handleResetZoom();
      } else {
        onClose();
      }
    } else if (e.key === '+' || e.key === '=') {
      handleZoomIn();
    } else if (e.key === '-') {
      handleZoomOut();
    } else if (e.key === '0') {
      handleResetZoom();
    } else if (e.key === 'ArrowLeft') {
      handlePrevImage();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    }
  }, [scale, onClose, handlePrevImage, handleNextImage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Drag handlers when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      handleResetZoom();
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = `${(currentImage.title || 'imagem').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-150"
      onWheel={handleWheel}
      onMouseUp={handleMouseUp}
    >
      {/* Top Floating Control Bar */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/80 z-20 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 text-white">
          <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs sm:text-sm truncate">
                {currentImage.title}
              </h3>
              {hasMultiple && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600/60 text-blue-200 border border-blue-400/40 rounded-full shrink-0">
                  Foto {activeImageIndex + 1} de {activeImageList.length}
                </span>
              )}
            </div>
            {currentImage.caption && (
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {currentImage.caption}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {hasMultiple && (
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 mr-1 sm:mr-2">
              <button
                onClick={handlePrevImage}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Foto Anterior (Seta Esquerda)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-2 text-slate-300 text-center">
                {activeImageIndex + 1}/{activeImageList.length}
              </span>
              <button
                onClick={handleNextImage}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Próxima Foto (Seta Direita)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Diminuir Zoom (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Aumentar Zoom (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            title="Resetar Zoom (100%)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg border border-white/10 transition-colors hidden sm:flex items-center justify-center"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            title="Baixar Imagem"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-rose-500/80 rounded-lg border border-white/10 transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Canvas Area */}
      <div 
        className={`flex-1 relative flex items-center justify-center overflow-hidden ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Navigation Floating Buttons for Multiple Images */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Foto anterior (Seta esquerda)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Próxima foto (Seta direita)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div 
          className="transition-transform duration-75 ease-out flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
          onDoubleClick={handleDoubleClick}
        >
          <img
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.title}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-md shadow-2xl pointer-events-none select-none"
            crossOrigin="anonymous"
            draggable={false}
          />
        </div>

        {/* Floating Zoom Hint Pill */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xs text-slate-300 text-[11px] px-3 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-none flex items-center gap-2">
          <span>Role o scroll ou use <strong>+</strong> / <strong>-</strong> para zoom</span>
          {hasMultiple && (
            <>
              <span>&bull;</span>
              <span>Use <strong>&larr;</strong> e <strong>&rarr;</strong> para alternar fotos</span>
            </>
          )}
          <span>&bull;</span>
          <span>Duplo clique para ampliar</span>
          <span>&bull;</span>
          <span>Arraste para mover</span>
        </div>
      </div>

      {/* Caption Footer if exists */}
      {currentImage.caption && (
        <div className="p-3 bg-slate-950/80 border-t border-white/10 text-center text-xs text-slate-300 shrink-0">
          <span className="font-semibold text-white">Legenda: </span>
          <span>{currentImage.caption}</span>
        </div>
      )}
    </div>
  );
};
