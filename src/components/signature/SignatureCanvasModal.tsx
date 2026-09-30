import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, CheckCircle2, ShieldCheck, PenTool, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUrl?: string, confirmationType?: 'eletronica' | 'assinatura_desenhada' | 'govbr_simulado') => void;
  documentTitle: string;
  documentCode: string;
  versionNumber: string;
}

export const SignatureCanvasModal: React.FC<SignatureCanvasModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentTitle,
  documentCode,
  versionNumber
}) => {
  const { currentUser } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [acceptedTerm, setAcceptedTerm] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'desenho' | 'autenticada'>('desenho');

  useEffect(() => {
    if (isOpen && signatureMode === 'desenho') {
      setTimeout(initCanvas, 100);
    }
  }, [isOpen, signatureMode]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 160;

    ctx.strokeStyle = '#1E3A8A'; // Deep Navy Blue stroke
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleFinalSubmit = () => {
    if (!acceptedTerm) return;

    let sigDataUrl: string | undefined = undefined;

    if (signatureMode === 'desenho' && canvasRef.current && hasSignature) {
      sigDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const type = signatureMode === 'desenho' ? 'assinatura_desenhada' : 'eletronica';
    onConfirm(sigDataUrl, type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Assinatura & Ciência Eletrônica</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
            <div className="font-bold text-blue-950">{documentCode} - Versão {versionNumber}</div>
            <div className="text-slate-700 font-medium line-clamp-1">{documentTitle}</div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Declarante:</span>
              <span className="font-bold text-slate-800">{currentUser.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">CPF:</span>
              <span className="font-medium text-slate-800">{currentUser.cpf}</span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-700">
            <button
              onClick={() => setSignatureMode('desenho')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                signatureMode === 'desenho' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Desenhar na Tela
            </button>
            <button
              onClick={() => setSignatureMode('autenticada')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                signatureMode === 'autenticada' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Confirmação Autenticada
            </button>
          </div>

          {/* Canvas or Authenticated Note */}
          {signatureMode === 'desenho' ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Assine no quadro abaixo:</span>
                <button
                  onClick={clearCanvas}
                  className="text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden touch-none">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full cursor-crosshair block"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Confirmação por Identidade Autenticada
              </div>
              <p>
                A ciência será registrada vinculando o seu usuário autenticado ({currentUser.email}), o IP da sessão atual e o carimbo de data/hora oficial do sistema.
              </p>
            </div>
          )}

          {/* Legal Mandatory Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={acceptedTerm}
              onChange={e => setAcceptedTerm(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded-xs border-slate-300 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              <strong>Declaração Obrigatória:</strong> Declaro que li, compreendi e estou ciente deste procedimento operacional padrão, comprometendo-me a seguir fielmente as orientações nele estabelecidas.
            </span>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={!acceptedTerm || (signatureMode === 'desenho' && !hasSignature)}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirmar Ciência
          </button>
        </div>
      </div>
    </div>
  );
};
