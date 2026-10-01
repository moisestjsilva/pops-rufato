import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  Image as ImageIcon, 
  ZoomIn,
  CheckCircle2,
  Layers,
  Expand
} from 'lucide-react';
import { POP, POPVersion, POPStep } from '../../types';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

interface POPSlideshowModalProps {
  pop: POP;
  version: POPVersion;
  steps: POPStep[];
  initialStepIndex?: number;
  onClose: () => void;
  onOpenImage?: (image: { url: string; title: string; caption?: string }) => void;
}

export const POPSlideshowModal: React.FC<POPSlideshowModalProps> = ({
  pop,
  version,
  steps,
  initialStepIndex = 0,
  onClose,
  onOpenImage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(initialStepIndex);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [slideLightboxImage, setSlideLightboxImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  const totalSteps = steps.length;
  const currentStep = steps[currentIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // If lightbox is open inside slide, let lightbox handle its own keys
    if (slideLightboxImage) return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Home') {
      setCurrentIndex(0);
    } else if (e.key === 'End') {
      setCurrentIndex(totalSteps - 1);
    }
  }, [handleNext, handlePrev, onClose, totalSteps, slideLightboxImage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleOpenStepImage = () => {
    if (!currentStep?.image_url) return;
    const imgData = {
      url: currentStep.image_url,
      title: `Etapa ${currentStep.step_number || currentIndex + 1}: ${currentStep.title}`,
      caption: currentStep.image_caption
    };
    setSlideLightboxImage(imgData);
    onOpenImage?.(imgData);
  };

  const progressPercent = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col text-white select-none animate-in fade-in duration-150"
    >
      {/* Top Header Progress Bar */}
      <div className="h-1 bg-white/10 w-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top Header Navigation */}
      <header className="h-16 px-4 sm:px-8 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
            POP
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white truncate">
                {pop.code} &bull; {pop.title}
              </span>
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800 shrink-0">
                Versão {version.version_number}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Setor: {pop.department_name} | Modo Apresentação de Treinamento
            </p>
          </div>
        </div>

        {/* Counter & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold text-slate-200 border border-white/10 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Passo <strong>{totalSteps > 0 ? currentIndex + 1 : 0}</strong> de <strong>{totalSteps}</strong></span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg border border-white/10 transition-colors hidden sm:flex items-center justify-center"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-rose-500/80 rounded-lg border border-white/10 transition-colors"
            title="Fechar Apresentação (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Slide Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {totalSteps === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 max-w-md space-y-3">
            <Layers className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="font-bold text-lg text-white">Nenhum Passo Cadastrado</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Este procedimento operacional ainda não possui etapas detalhadas cadastradas para exibição em slides.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
            >
              Voltar ao Documento
            </button>
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200">
            {/* Step Slide Card */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-6">
              {/* Step Header Indicator */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-600 text-white font-extrabold text-xs sm:text-sm rounded-lg shadow-xs">
                    ETAPA {currentStep.step_number || currentIndex + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Procedimento de Execução
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Pressione <strong>&larr;</strong> ou <strong>&rarr;</strong> no teclado para navegar
                </div>
              </div>

              {/* Step Title & Grid Content */}
              <div className={`grid gap-6 sm:gap-8 items-start ${currentStep.image_url ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
                {/* Text Content */}
                <div className={`${currentStep.image_url ? 'lg:col-span-6' : 'max-w-3xl'} space-y-4`}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                    {currentStep.title}
                  </h2>

                  <div className="p-4 sm:p-5 bg-white/5 rounded-xl border border-white/10 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                    {currentStep.description}
                  </div>

                  {/* Safety Alert Warning */}
                  {currentStep.warning && (
                    <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 font-bold block mb-0.5">
                          Cuidados Operacionais &amp; Segurança:
                        </strong>
                        <span>{currentStep.warning}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step Image Column (Generous & High Visibility) */}
                {currentStep.image_url && (
                  <div className="lg:col-span-6 flex flex-col space-y-3">
                    <div 
                      className="group relative rounded-2xl overflow-hidden border-2 border-white/20 hover:border-blue-500 bg-slate-950/80 cursor-pointer shadow-xl transition-all flex items-center justify-center p-2"
                      onClick={handleOpenStepImage}
                      title="Clique para abrir em tela cheia com zoom"
                    >
                      <img
                        src={currentStep.image_url}
                        alt={currentStep.image_caption || currentStep.title}
                        className="w-full max-h-[48vh] sm:max-h-[55vh] object-contain rounded-xl transition-transform duration-200 group-hover:scale-[1.01]"
                        loading="eager"
                        crossOrigin="anonymous"
                      />
                      
                      {/* Hover Overlay with Zoom Icon */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-semibold text-xs sm:text-sm backdrop-blur-2xs p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <ZoomIn className="w-6 h-6" />
                        </div>
                        <span className="font-bold">Clique para Abrir com Zoom e Tela Cheia</span>
                        <span className="text-[11px] text-slate-300 font-normal">Aproximar, afastar e arrastar detalhes</span>
                      </div>
                    </div>

                    {/* Dedicated Open Button right below image */}
                    <button
                      type="button"
                      onClick={handleOpenStepImage}
                      className="w-full py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                    >
                      <ZoomIn className="w-4 h-4 text-blue-400" />
                      <span>Ver Imagem em Tamanho Maior (Zoom &amp; Tela Cheia)</span>
                    </button>

                    {currentStep.image_caption && (
                      <p className="text-[11px] text-slate-400 text-center italic px-2">
                        {currentStep.image_caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation & Step Dots Bar */}
      <footer className="h-20 px-4 sm:px-8 border-t border-white/10 flex items-center justify-between gap-4 bg-slate-950/80 shrink-0">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 || totalSteps === 0}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Etapa Anterior</span>
        </button>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-sm sm:max-w-md py-1 px-2">
          {steps.map((step, idx) => (
            <button
              key={step.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-7 min-w-[28px] px-2 rounded-lg text-xs font-semibold transition-all ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'
              }`}
              title={`Ir para Passo ${idx + 1}: ${step.title}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Next / Finish Button */}
        {currentIndex < totalSteps - 1 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all text-white bg-blue-600 hover:bg-blue-500 shadow-md active:scale-95"
          >
            <span>Próxima Etapa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all text-white bg-emerald-600 hover:bg-emerald-500 shadow-md active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar Apresentação</span>
          </button>
        )}
      </footer>

      {/* Lightbox Modal Rendered Inside Slideshow (Guarantees visibility even in browser Fullscreen!) */}
      {slideLightboxImage && (
        <ImageLightboxModal
          image={slideLightboxImage}
          onClose={() => setSlideLightboxImage(null)}
        />
      )}
    </div>
  );
};
