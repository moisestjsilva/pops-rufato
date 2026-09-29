import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  History, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Building2, 
  User, 
  Printer, 
  QrCode, 
  PenTool, 
  Award,
  AlertTriangle,
  Image as ImageIcon,
  Maximize2,
  X,
  Paperclip
} from 'lucide-react';
import { POP, POPVersion, Acknowledgement } from '../../types';
import { formatDate, formatDateTime, getPOPStatusBadge, getRevisionStatus } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { VersionHistoryModal } from './VersionHistoryModal';
import { SignatureCanvasModal } from '../signature/SignatureCanvasModal';
import { generateElementPDF, generateEvidenceReportPDF } from '../../lib/pdfGenerator';
import { QRCodeSVG } from 'qrcode.react';

interface POPViewerProps {
  pop: POP;
  selectedVersion?: POPVersion;
  onEdit?: () => void;
  onBack?: () => void;
}

export const POPViewer: React.FC<POPViewerProps> = ({
  pop,
  selectedVersion,
  onEdit,
  onBack
}) => {
  const { currentUser } = useAuth();
  const { acknowledgements, confirmScience, employees } = useData();

  const [showHistory, setShowHistory] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Active version to render (defaults to current active version or explicit selected version)
  const activeVersion = selectedVersion || pop.versions?.find(v => v.version_number === pop.current_version) || pop.versions?.[0];

  const content = activeVersion?.content || {
    objective: 'Sem objetivo cadastrado.',
    application: 'Sem aplicação declarada.',
    responsibilities: 'Sem responsabilidades declaradas.',
    materials: 'Nenhum material cadastrado.',
    steps: [],
    risks_and_care: 'Nenhum risco cadastrado.',
    related_documents: 'Nenhum documento relacionado.'
  };

  // Check if current employee has acknowledged THIS SPECIFIC VERSION of the POP
  const existingAck = acknowledgements.find(a => 
    a.employee_id === currentUser.id && 
    a.pop_id === pop.id && 
    a.version_number === activeVersion?.version_number
  );

  const statusBadge = getPOPStatusBadge(activeVersion?.status || pop.status);
  const revisionInfo = getRevisionStatus(pop.next_review_date);

  const validationUrl = `${window.location.origin}/validar/${pop.code}/${activeVersion?.version_number || pop.current_version}`;

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateElementPDF(`pop-doc-print-${pop.id}`, `${pop.code}_V${activeVersion?.version_number || '01'}.pdf`);
    } catch (e) {
      console.warn('Fallback acionado: abrindo diálogo de impressão/PDF do navegador...', e);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleConfirmScienceSubmit = (sigUrl?: string, type?: 'eletronica' | 'assinatura_desenhada' | 'govbr_simulado') => {
    if (!activeVersion) return;
    confirmScience(
      currentUser.id,
      pop.id,
      activeVersion.id,
      type || 'eletronica',
      sigUrl,
      currentUser
    );
    setShowSignModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1 inline-block"
          >
            &larr; Voltar para a Lista
          </button>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              {pop.code} - Versão {activeVersion?.version_number}
            </h2>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Histórico ({pop.versions?.length || 1})</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5"
            title="Imprimir ou Salvar em PDF via Navegador"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir / Salvar PDF</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-lg border border-blue-200 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}</span>
          </button>

          {existingAck && (
            <button
              onClick={() => {
                const emp = employees.find(e => e.id === currentUser.id) || currentUser;
                generateEvidenceReportPDF(existingAck, emp, pop, activeVersion!);
              }}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certificado de Evidência</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{pop.status === 'publicado' ? 'Revisar / Nova Versão' : 'Editar Documento'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Printed Formal Document Canvas */}
      <div 
        id={`pop-doc-print-${pop.id}`}
        className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden text-slate-900 p-6 sm:p-10 space-y-8"
      >
        {/* Document Header Table Banner */}
        <div className="border-2 border-slate-800 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-slate-800 text-xs">
          {/* Logo Box */}
          <div className="p-4 bg-slate-50 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-blue-900 text-white font-black rounded-lg flex items-center justify-center text-xl mb-1">
              R
            </div>
            <span className="font-extrabold text-slate-900 text-xs">
              RUFATO MÓVEIS
            </span>
            <span className="text-[9px] text-slate-500">Gestão da Qualidade</span>
          </div>

          {/* Title Box */}
          <div className="p-4 md:col-span-2 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PROCEDIMENTO OPERACIONAL PADRÃO (POP)
            </span>
            <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mt-0.5">
              {pop.title}
            </h1>
            <span className="text-[11px] text-slate-600 mt-1">
              Classificação: <strong>{pop.classification}</strong> | Setor: <strong>{pop.department_name}</strong>
            </span>
          </div>

          {/* Metadata Box */}
          <div className="p-3 bg-slate-50 flex flex-col justify-center space-y-1 text-[11px] font-medium">
            <div><strong>Código:</strong> {pop.code}</div>
            <div><strong>Versão:</strong> {activeVersion?.version_number}</div>
            <div><strong>Publicação:</strong> {formatDate(activeVersion?.published_date || pop.updated_at)}</div>
            <div><strong>Próx. Revisão:</strong> {formatDate(pop.next_review_date)}</div>
          </div>
        </div>

        {/* Metadata Details Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Elaborado por:</span>
            <span className="font-semibold text-slate-800">{activeVersion?.author_name || pop.author_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Aprovado por:</span>
            <span className="font-semibold text-slate-800">{activeVersion?.approver_name || 'Em Validação'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Periodicidade:</span>
            <span className="font-semibold text-slate-800">{pop.review_period_months} Meses</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Status de Revisão:</span>
            <span className={`font-bold ${revisionInfo.colorClass}`}>{revisionInfo.icon} {revisionInfo.label}</span>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-800">
          {/* Section 1 */}
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-2">
              1. OBJETIVO
            </h3>
            <p className="whitespace-pre-line text-slate-700">{content.objective}</p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-2">
              2. APLICAÇÃO
            </h3>
            <p className="whitespace-pre-line text-slate-700">{content.application}</p>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-2">
              3. RESPONSABILIDADES
            </h3>
            <p className="whitespace-pre-line text-slate-700">{content.responsibilities}</p>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-2">
              4. MATERIAIS E EQUIPAMENTOS
            </h3>
            <p className="whitespace-pre-line text-slate-700">{content.materials}</p>
          </div>

          {/* Section 5 - Procedimento em Passos */}
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-3">
              5. PROCEDIMENTO DE EXECUÇÃO
            </h3>

            {content.steps && content.steps.length > 0 ? (
              <div className="space-y-4">
                {content.steps.map((step, idx) => (
                  <div key={step.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-blue-900 text-white font-bold rounded-lg flex items-center justify-center text-xs shrink-0">
                        {step.step_number || `5.${idx+1}`}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-slate-700 pl-9 whitespace-pre-line text-xs leading-relaxed">
                      {step.description}
                    </p>

                    {step.warning && (
                      <div className="ml-0 sm:ml-9 p-2.5 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div><strong>Atenção / Segurança:</strong> {step.warning}</div>
                      </div>
                    )}

                    {/* Step Attached Image */}
                    {step.image_url && (
                      <div className="ml-0 sm:ml-9 mt-3">
                        <div className="rounded-xl overflow-hidden border border-slate-300 bg-white max-w-lg shadow-xs">
                          <div 
                            className="relative group bg-slate-950/5 flex items-center justify-center p-2 cursor-pointer"
                            onClick={() => setSelectedImageModal({
                              url: step.image_url!,
                              title: `${step.step_number} - ${step.title}`,
                              caption: step.image_caption
                            })}
                          >
                            <img
                              src={step.image_url}
                              alt={step.image_caption || `Ilustração do passo ${step.step_number}`}
                              className="max-h-72 w-full object-contain rounded-lg transition-transform hover:scale-[1.01]"
                              loading="eager"
                              crossOrigin="anonymous"
                            />
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 shadow-xs pointer-events-none">
                              <Maximize2 className="w-3 h-3" /> Ampliar
                            </div>
                          </div>
                          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                            <ImageIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-[11px] leading-relaxed">
                              <span className="font-bold text-slate-900">Figura {step.step_number}: </span>
                              <span>{step.image_caption || 'Evidência fotográfica / instrução visual do procedimento.'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">Nenhum passo detalhado informado.</p>
            )}
          </div>

          {/* Section 6 */}
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-2">
              6. CUIDADOS E RISCOS OPERACIONAIS
            </h3>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <p className="whitespace-pre-line text-xs font-medium">{content.risks_and_care}</p>
            </div>
          </div>

          {/* Section 7 */}
          <div>
            <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-2">
              7. DOCUMENTOS RELACIONADOS
            </h3>
            <p className="whitespace-pre-line text-slate-700">{content.related_documents}</p>
          </div>

          {/* Section 8 - Anexos e Documentos de Apoio */}
          {((content.attachments && content.attachments.length > 0) || (activeVersion?.attachments && activeVersion.attachments.length > 0)) && (
            <div>
              <h3 className="font-extrabold text-blue-900 text-sm sm:text-base border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-purple-600" />
                8. ANEXOS E DOCUMENTOS DE APOIO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(content.attachments || activeVersion?.attachments || []).map(att => (
                  <div key={att.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-purple-700 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{att.file_name}</p>
                        <p className="text-[10px] text-slate-500">{(att.file_size / 1024).toFixed(1)} KB • {att.file_type || 'Arquivo'}</p>
                      </div>
                    </div>
                    <a
                      href={att.file_path}
                      download={att.file_name}
                      className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8 - Verification QR Code & Footer Hash */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-xs">
                <QRCodeSVG value={validationUrl} size={64} />
              </div>
              <div className="text-[10px] text-slate-500">
                <div className="font-bold text-slate-800">Validação Digital de Autenticidade</div>
                <div>Aponte a câmera para consultar a vigência e integridade deste documento.</div>
              </div>
            </div>

            <div className="sm:col-span-2 text-right text-[10px] text-slate-500 space-y-1">
              <div><strong>Document Hash (SHA-256):</strong> <span className="font-mono text-slate-700">{activeVersion?.document_hash || 'PENDING'}</span></div>
              <div>POP CONTROL &copy; 2026 | {pop.code} - Versão {activeVersion?.version_number} | Página 1 de 1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Employee Science & Signature Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Declaração de Ciência e Treinamento
              </h3>
              <p className="text-xs text-slate-400">
                Registro compulsório de leitura e concordância para o funcionário
              </p>
            </div>
          </div>

          {existingAck ? (
            <div className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ciência Confirmada em {formatDateTime(existingAck.acknowledged_at)}</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pendência de Ciência no seu Perfil</span>
            </div>
          )}
        </div>

        {existingAck ? (
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-2 text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block">Declarante:</span>
                <span className="font-bold text-white">{existingAck.employee_name} ({existingAck.employee_registration})</span>
              </div>
              <div>
                <span className="text-slate-400 block">Transação ID:</span>
                <span className="font-mono text-emerald-400">{existingAck.transaction_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Confirmação:</span>
                <span className="font-semibold text-white">{existingAck.confirmation_type.toUpperCase()}</span>
              </div>
            </div>
            <p className="italic text-slate-400 pt-1">
              "{existingAck.term_text}"
            </p>
          </div>
        ) : (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ao clicar no botão ao lado, você declara que realizou a leitura integral deste procedimento, compreendeu todas as etapas de operação e segurança, e assume o compromisso de executá-las em sua rotina de trabalho.
            </div>

            <button
              onClick={() => setShowSignModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Ciência & Assinar
            </button>
          </div>
        )}
      </div>

      {/* History Modal */}
      <VersionHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        pop={pop}
      />

      {/* Signature Modal */}
      <SignatureCanvasModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onConfirm={handleConfirmScienceSubmit}
        documentTitle={pop.title}
        documentCode={pop.code}
        versionNumber={activeVersion?.version_number || '01'}
      />

      {/* Step Image Lightbox / Zoom Modal */}
      {selectedImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImageModal(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedImageModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedImageModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto flex-1">
              <img
                src={selectedImageModal.url}
                alt={selectedImageModal.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>

            {selectedImageModal.caption && (
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Legenda: </span>
                <span>{selectedImageModal.caption}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
