import React, { useState } from 'react';
import { 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Building2, 
  Users, 
  Clock, 
  AlertTriangle,
  Send,
  Upload,
  Paperclip,
  Image as ImageIcon,
  Camera,
  Link,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { POP, POPStep, POPStepImage, POPAttachment, RevisionPeriodMonths } from '../../types';
import { fileToOptimizedDataUrl, PRESET_STEP_IMAGES, getStepImages } from '../../utils/imageHelper';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

interface POPEditCreateFormProps {
  initialPOP?: POP;
  onSave: () => void;
  onCancel: () => void;
}

export const POPEditCreateForm: React.FC<POPEditCreateFormProps> = ({
  initialPOP,
  onSave,
  onCancel
}) => {
  const { companies, departments, positions, createPOP, updatePOP, createNewPOPVersion } = useData();
  const { currentUser } = useAuth();

  const isEditing = Boolean(initialPOP);

  // Form State
  const [code, setCode] = useState(initialPOP?.code || `POP-PROD-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState(initialPOP?.title || '');
  const [companyId, setCompanyId] = useState(initialPOP?.company_id || companies[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(initialPOP?.department_id || departments[0]?.id || '');
  const [responsibleName, setResponsibleName] = useState(initialPOP?.responsible_name || currentUser.full_name);
  const [classification, setClassification] = useState(initialPOP?.classification || 'Operacional');
  const [reviewPeriodMonths, setReviewPeriodMonths] = useState<RevisionPeriodMonths>(
    initialPOP?.review_period_months || 12
  );

  const [assignedDepts, setAssignedDepts] = useState<string[]>(
    initialPOP?.assigned_department_ids || (departments[0]?.id ? [departments[0].id] : [])
  );
  const [assignedPositions, setAssignedPositions] = useState<string[]>(
    initialPOP?.assigned_position_ids || []
  );

  // Versioning state
  const [isNewVersion, setIsNewVersion] = useState(false);
  const [versionNumber, setVersionNumber] = useState(
    initialPOP ? String(Number(initialPOP.current_version) + 1).padStart(2, '0') : '01'
  );
  const [changeReason, setChangeReason] = useState(
    initialPOP ? 'Revisão periódica com ajustes nos procedimentos operacionais.' : 'Elaboração inicial do POP.'
  );

  // Section contents
  const initialContent = initialPOP?.versions?.find(v => v.version_number === initialPOP.current_version)?.content;

  const [objective, setObjective] = useState(initialContent?.objective || '');
  const [application, setApplication] = useState(initialContent?.application || '');
  const [responsibilities, setResponsibilities] = useState(initialContent?.responsibilities || '');
  const [materials, setMaterials] = useState(initialContent?.materials || '');
  const [risksAndCare, setRisksAndCare] = useState(initialContent?.risks_and_care || '');
  const [relatedDocuments, setRelatedDocuments] = useState(initialContent?.related_documents || '');

  // Step List
  const [steps, setSteps] = useState<POPStep[]>(
    initialContent?.steps || [
      { id: '1', step_number: '5.1', title: 'Checklist e Preparação', description: 'Inspeção inicial da área de trabalho e equipamentos.' },
      { id: '2', step_number: '5.2', title: 'Execução do Procedimento', description: 'Realizar o corte/operação conforme o plano.' }
    ]
  );

  const filteredPositions = positions.filter(p => p.department_id === departmentId);

  const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const [urlInputStepId, setUrlInputStepId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState('');

  // Attachments State
  const [attachments, setAttachments] = useState<POPAttachment[]>(
    initialContent?.attachments || initialPOP?.versions?.find(v => v.version_number === initialPOP.current_version)?.attachments || []
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleAddStep = () => {
    const nextIndex = steps.length + 1;
    setSteps([
      ...steps,
      {
        id: String(Date.now()),
        step_number: `5.${nextIndex}`,
        title: `Passo ${nextIndex}`,
        description: ''
      }
    ]);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleStepChange = (id: string, field: keyof POPStep, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleMoveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index - 1];
    newSteps[index - 1] = temp;
    setSteps(newSteps);
  };

  const handleMoveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + 1];
    newSteps[index + 1] = temp;
    setSteps(newSteps);
  };

  const handleAttachmentUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAttachments(prev => [
          ...prev,
          {
            id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            pop_version_id: '',
            file_name: file.name,
            file_path: dataUrl,
            file_type: file.type || 'application/octet-stream',
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  
  const handleStepDragOver = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingStepId !== stepId) setDraggingStepId(stepId);
  };

  const handleStepDragLeave = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (draggingStepId === stepId) setDraggingStepId(null);
  };

  const handleStepDrop = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingStepId(null);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      handleImageFilesUpload(stepId, files);
    }
  };

  const handleStepPaste = (e: React.ClipboardEvent, stepId: string) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      handleImageFilesUpload(stepId, imageFiles);
    }
  };

  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; title: string; caption?: string } | null>(null);

  const handleImageFilesUpload = async (stepId: string, files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    try {
      setUploadingStepId(stepId);
      const newImages: POPStepImage[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const dataUrl = await fileToOptimizedDataUrl(file);
        newImages.push({
          id: 'img-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 6),
          url: dataUrl,
          caption: ''
        });
      }

      setSteps(prev => prev.map(s => {
        if (s.id !== stepId) return s;
        const currentImages = getStepImages(s);
        const combined = [...currentImages, ...newImages];
        return {
          ...s,
          images: combined,
          image_url: combined[0]?.url,
          image_caption: combined[0]?.caption
        };
      }));
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem.');
    } finally {
      setUploadingStepId(null);
    }
  };

  const handleSelectPreset = (stepId: string, preset: typeof PRESET_STEP_IMAGES[0]) => {
    const newImg: POPStepImage = {
      id: 'img-preset-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      url: preset.dataUrl,
      caption: preset.caption
    };

    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const currentImages = getStepImages(s);
      const combined = [...currentImages, newImg];
      return {
        ...s,
        images: combined,
        image_url: combined[0]?.url,
        image_caption: combined[0]?.caption
      };
    }));
  };

  const handleRemoveStepImage = (stepId: string, imageId: string) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const currentImages = getStepImages(s);
      const filtered = currentImages.filter(img => img.id !== imageId);
      return {
        ...s,
        images: filtered,
        image_url: filtered[0]?.url,
        image_caption: filtered[0]?.caption
      };
    }));
  };

  const handleUpdateStepImageCaption = (stepId: string, imageId: string, caption: string) => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const currentImages = getStepImages(s);
      const updated = currentImages.map(img => img.id === imageId ? { ...img, caption } : img);
      return {
        ...s,
        images: updated,
        image_caption: updated[0]?.caption
      };
    }));
  };

  const handleMoveStepImage = (stepId: string, imgIndex: number, direction: 'prev' | 'next') => {
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const currentImages = [...getStepImages(s)];
      const targetIndex = direction === 'prev' ? imgIndex - 1 : imgIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentImages.length) return s;
      const temp = currentImages[imgIndex];
      currentImages[imgIndex] = currentImages[targetIndex];
      currentImages[targetIndex] = temp;
      return {
        ...s,
        images: currentImages,
        image_url: currentImages[0]?.url,
        image_caption: currentImages[0]?.caption
      };
    }));
  };

  const handleApplyUrl = (stepId: string) => {
    if (!tempUrl.trim()) return;
    const newImg: POPStepImage = {
      id: 'img-url-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      url: tempUrl.trim(),
      caption: ''
    };

    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s;
      const currentImages = getStepImages(s);
      const combined = [...currentImages, newImg];
      return {
        ...s,
        images: combined,
        image_url: combined[0]?.url,
        image_caption: combined[0]?.caption
      };
    }));
    setUrlInputStepId(null);
    setTempUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const versionContent = {
      objective,
      application,
      responsibilities,
      materials,
      steps,
      risks_and_care: risksAndCare,
      related_documents: relatedDocuments,
      attachments
    };

    if (isEditing && initialPOP) {
      updatePOP(
        initialPOP.id,
        {
          code,
          title,
          company_id: companyId,
          department_id: departmentId,
          responsible_name: responsibleName,
          classification,
          review_period_months: reviewPeriodMonths,
          assigned_department_ids: assignedDepts,
          assigned_position_ids: assignedPositions
        },
        isNewVersion ? undefined : versionContent,
        currentUser
      );

      if (isNewVersion) {
        createNewPOPVersion(
          initialPOP.id,
          versionNumber,
          changeReason,
          versionContent,
          currentUser
        );
      }
    } else {
      createPOP(
        {
          code,
          title,
          company_id: companyId,
          department_id: departmentId,
          responsible_name: responsibleName,
          classification,
          review_period_months: reviewPeriodMonths,
          status: 'rascunho'
        },
        versionContent,
        assignedDepts,
        assignedPositions,
        currentUser
      );
    }

    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">
              {isEditing ? `Editar Procedimento: ${initialPOP?.code}` : 'Criar Novo Procedimento (POP)'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Atualize as seções estruturadas ou crie uma nova versão' : 'Preencha a estrutura padrão do POP de acordo com as diretrizes da empresa'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Salvar POP
          </button>
        </div>
      </div>

      {/* Versioning Switch if editing */}
      {isEditing && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-amber-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Opção de Incremento de Versão
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
              <input
                type="checkbox"
                checked={isNewVersion}
                onChange={e => setIsNewVersion(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-xs border-amber-300 focus:ring-amber-500"
              />
              Criar Nova Versão (Versão {versionNumber})
            </label>
          </div>

          {isNewVersion && (
            <div className="space-y-2 pt-2 border-t border-amber-200 text-xs">
              <div>
                <label className="block font-bold text-amber-900 mb-1">Motivo / Justificativa da Nova Versão:</label>
                <input
                  type="text"
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  required
                  placeholder="Ex: Adequação à nova NR-12 e alteração dos passos 5.2 e 5.3"
                  className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section A: Identificação Básica */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Identificação do Documento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Código do POP *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              placeholder="POP-PROD-001"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Título do Procedimento *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              placeholder="Procedimento para operação da máquina de corte..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Empresa</label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.trade_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Setor Principal</label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Classificação</label>
            <input
              type="text"
              value={classification}
              onChange={e => setClassification(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
              placeholder="Segurança e Operação"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Responsável TÉcnico</label>
            <input
              type="text"
              value={responsibleName}
              onChange={e => setResponsibleName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Periodicidade de Revisão</label>
            <select
              value={reviewPeriodMonths}
              onChange={e => setReviewPeriodMonths(Number(e.target.value) as RevisionPeriodMonths)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value={3}>A cada 3 Meses</option>
              <option value={6}>A cada 6 Meses</option>
              <option value={12}>A cada 12 Meses (1 Ano)</option>
              <option value={24}>A cada 24 Meses (2 Anos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section B: Matriz de Cargos Obrigatórios */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          Atribuição de Obrigatoriedade (Quais cargos precisam ter ciência deste POP?)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-2">Cargos Vinculados no Setor ({departments.find(d => d.id === departmentId)?.name}):</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
              {filteredPositions.length === 0 ? (
                <p className="text-slate-500 italic">Nenhum cargo cadastrado neste setor.</p>
              ) : (
                filteredPositions.map(pos => (
                  <label key={pos.id} className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedPositions.includes(pos.id)}
                      onChange={e => {
                        if (e.target.checked) setAssignedPositions([...assignedPositions, pos.id]);
                        else setAssignedPositions(assignedPositions.filter(id => id !== pos.id));
                      }}
                      className="w-4 h-4 text-blue-600 rounded-xs border-slate-300"
                    />
                    <span>{pos.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="text-slate-500 text-xs flex flex-col justify-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <span className="font-bold text-blue-950 mb-1">Rastreabilidade Automática:</span>
            <span>
              Ao selecionar os cargos obrigatórios, todos os funcionários atualmente ocupantes ou recém-cadastrados nesses cargos receberão automaticamente uma pendência de ciência assim que a versão for publicada.
            </span>
          </div>
        </div>
      </div>

      {/* Section C: Conteúdo Estruturado */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
          Estrutura Padrão do POP
        </h3>

        {/* 1. Objetivo */}
        <div>
          <label className="block font-bold text-xs text-slate-800 mb-1">1. OBJETIVO</label>
          <textarea
            value={objective}
            onChange={e => setObjective(e.target.value)}
            rows={3}
            required
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Descreva o propósito principal do procedimento..."
          />
        </div>

        {/* 2. Aplicação */}
        <div>
          <label className="block font-bold text-xs text-slate-800 mb-1">2. APLICAÇÃO</label>
          <textarea
            value={application}
            onChange={e => setApplication(e.target.value)}
            rows={2}
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            placeholder="A quais áreas, equipamentos e equipes se aplica..."
          />
        </div>

        {/* 3. Responsabilidades */}
        <div>
          <label className="block font-bold text-xs text-slate-800 mb-1">3. RESPONSABILIDADES</label>
          <textarea
            value={responsibilities}
            onChange={e => setResponsibilities(e.target.value)}
            rows={2}
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Defina quem executa, quem supervisiona e quem aprova..."
          />
        </div>

        {/* 4. Materiais */}
        <div>
          <label className="block font-bold text-xs text-slate-800 mb-1">4. MATERIAIS E EQUIPAMENTOS</label>
          <textarea
            value={materials}
            onChange={e => setMaterials(e.target.value)}
            rows={2}
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Listagem de EPIs, insumos, ferramentas e instrumentos de medição..."
          />
        </div>

        {/* 5. Procedimento em Passos Dynamicos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold text-xs text-slate-800">5. PROCEDIMENTO (PASSOS NUMERADOS)</label>
            <button
              type="button"
              onClick={handleAddStep}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Passo
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isStepDragging = draggingStepId === step.id;
              return (
              <div 
                key={step.id} 
                onDragOver={(e) => handleStepDragOver(e, step.id)} 
                onDragLeave={(e) => handleStepDragLeave(e, step.id)} 
                onDrop={(e) => handleStepDrop(e, step.id)} 
                onPaste={(e) => handleStepPaste(e, step.id)} 
                tabIndex={0} 
                className={`p-3.5 rounded-xl border transition-all duration-150 space-y-2.5 relative outline-none ${
                  isStepDragging 
                    ? "bg-blue-50/95 border-2 border-dashed border-blue-500 shadow-md ring-2 ring-blue-300" 
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                {isStepDragging && (
                  <div className="p-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold text-center flex items-center justify-center gap-2 animate-pulse shadow-sm pointer-events-none">
                    <Upload className="w-4 h-4" />
                    Solte a foto aqui para salvar no Passo {step.step_number || idx + 1}!
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveStepUp(idx)}
                        disabled={idx === 0}
                        title="Mover passo para cima"
                        className="p-0.5 rounded text-slate-400 hover:text-blue-600 disabled:opacity-20 hover:bg-slate-200"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStepDown(idx)}
                        disabled={idx === steps.length - 1}
                        title="Mover passo para baixo"
                        className="p-0.5 rounded text-slate-400 hover:text-blue-600 disabled:opacity-20 hover:bg-slate-200"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={step.step_number}
                      onChange={e => handleStepChange(step.id, 'step_number', e.target.value)}
                      className="w-16 p-1.5 text-xs font-bold rounded-lg border border-slate-300 text-center bg-white"
                    />
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => handleStepChange(step.id, 'title', e.target.value)}
                      placeholder="Título do passo..."
                      className="flex-1 p-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(step.id)}
                    className="text-rose-600 hover:text-rose-800 p-1"
                    title="Excluir este passo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  value={step.description}
                  onChange={e => handleStepChange(step.id, 'description', e.target.value)}
                  rows={2}
                  placeholder="Detalhamento instrucional do passo..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                />

                <input
                  type="text"
                  value={step.warning || ''}
                  onChange={e => handleStepChange(step.id, 'warning', e.target.value)}
                  placeholder="Aviso de segurança ou atenção (Opcional)..."
                  className="w-full p-1.5 text-xs rounded-lg border border-rose-200 bg-rose-50 text-rose-900"
                />

                {/* Step Attached Images Section */}
                {(() => {
                  const stepImages = getStepImages(step);
                  const hasImages = stepImages.length > 0;

                  return (
                    <div className={`rounded-xl border transition-all ${
                      hasImages ? 'p-3.5 bg-slate-50/80 border-slate-200 space-y-3' : 'p-3 bg-white/80 border-dashed border-slate-300 space-y-2.5'
                    }`}>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {hasImages ? (
                            <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-700">
                            {hasImages ? 'Fotos e Esquemas deste Passo:' : 'Fotos ou Esquemas deste Passo:'}
                          </span>
                          {hasImages ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {stepImages.length} {stepImages.length === 1 ? 'imagem anexada' : 'imagens anexadas'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              Arraste ou cole com Ctrl+V
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <label className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            {uploadingStepId === step.id ? 'Processando...' : (hasImages ? '+ Adicionar Mais Imagens' : 'Carregar Imagens')}
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingStepId === step.id}
                              onChange={e => {
                                if (e.target.files && e.target.files.length > 0) {
                                  handleImageFilesUpload(step.id, e.target.files);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              if (urlInputStepId === step.id) {
                                setUrlInputStepId(null);
                              } else {
                                setUrlInputStepId(step.id);
                                setTempUrl('');
                              }
                            }}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Link className="w-3.5 h-3.5 text-slate-500" />
                            + URL
                          </button>
                        </div>
                      </div>

                      {/* URL Input Box */}
                      {urlInputStepId === step.id && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 shadow-xs">
                          <input
                            type="url"
                            value={tempUrl}
                            onChange={e => setTempUrl(e.target.value)}
                            placeholder="Cole aqui o link da imagem (https://...)"
                            className="flex-1 p-1.5 text-xs rounded-md border border-slate-300 bg-slate-50"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyUrl(step.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1 shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" /> Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={() => setUrlInputStepId(null)}
                            className="p-1.5 text-xs text-slate-400 hover:text-slate-600 rounded-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Grid of Attached Images */}
                      {hasImages && (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {stepImages.map((img, imgIdx) => (
                              <div 
                                key={img.id || imgIdx}
                                className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs flex flex-col justify-between space-y-2 hover:border-blue-300 transition-colors"
                              >
                                {/* Image Preview & Order Controls */}
                                <div className="relative group bg-slate-950/5 rounded-lg overflow-hidden border border-slate-200 h-36 flex items-center justify-center">
                                  <img
                                    src={img.url}
                                    alt={img.caption || `Foto ${imgIdx + 1}`}
                                    className="max-h-full max-w-full object-contain cursor-pointer"
                                    onClick={() => setPreviewImageModal({
                                      url: img.url,
                                      title: `${step.step_number} - ${step.title} (Foto ${imgIdx + 1})`,
                                      caption: img.caption
                                    })}
                                    title="Clique para ver imagem em tela cheia com zoom"
                                  />
                                  <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                    Foto {imgIdx + 1} de {stepImages.length}
                                  </div>

                                  {/* Actions overlay */}
                                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-slate-900/85 p-0.5 rounded-md backdrop-blur-xs shadow-sm">
                                    <button
                                      type="button"
                                      disabled={imgIdx === 0}
                                      onClick={() => handleMoveStepImage(step.id, imgIdx, 'prev')}
                                      className="p-1 text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:text-slate-300 rounded"
                                      title="Mover foto para a esquerda/anterior"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={imgIdx === stepImages.length - 1}
                                      onClick={() => handleMoveStepImage(step.id, imgIdx, 'next')}
                                      className="p-1 text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:text-slate-300 rounded"
                                      title="Mover foto para a direita/próxima"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-px h-3 bg-white/20 mx-0.5" />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStepImage(step.id, img.id)}
                                      className="p-1 text-rose-300 hover:text-rose-100 hover:bg-rose-600/70 rounded transition-colors"
                                      title="Remover esta foto"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Caption input */}
                                <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                                    Legenda da Foto {imgIdx + 1} (Exibida no PDF e na Leitura)
                                  </label>
                                  <input
                                    type="text"
                                    value={img.caption || ''}
                                    onChange={e => handleUpdateStepImageCaption(step.id, img.id, e.target.value)}
                                    placeholder="Ex: Ponto de lubrificação, detalhe do botão..."
                                    className="w-full p-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              {stepImages.length} {stepImages.length === 1 ? 'foto pronta.' : 'fotos prontas.'} Serão impressas e diagramadas no PDF e exibidas na leitura.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Presets */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                          {hasImages ? '+ Adicionar modelo industrial como foto adicional:' : 'Ou selecione um modelo industrial rápido:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_STEP_IMAGES.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectPreset(step.id, preset)}
                              className="text-[10px] font-medium text-slate-600 hover:text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 px-2 py-0.5 rounded-md transition-colors"
                            >
                              + {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              );
            })}
          </div>
        </div>

        {/* 6. Riscos */}
        <div>
          <label className="block font-bold text-xs text-slate-800 mb-1">6. CUIDADOS / RISCOS OPERACIONAIS</label>
          <textarea
            value={risksAndCare}
            onChange={e => setRisksAndCare(e.target.value)}
            rows={2}
            className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Riscos de acidentes, ergonomia e cuidados especiais..."
          />
        </div>

        {/* 7. Documentos */}
        <div>
          <label className="block font-bold text-xs text-slate-800 mb-1">7. DOCUMENTOS RELACIONADOS</label>
          <input
            type="text"
            value={relatedDocuments}
            onChange={e => setRelatedDocuments(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
            placeholder="Manuais, NRs, ordens de serviço relativas..."
          />
        </div>
      </div>

      {/* Upload attachments functional */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-purple-600" />
            Anexos e Documentos de Apoio (PDFs, Manuais Técnicos e Fotos)
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {attachments.length} anexo(s) adicionado(s)
          </span>
        </div>

        {/* Dropzone interativa */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleAttachmentUpload(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            className="hidden" 
            onChange={(e) => handleAttachmentUpload(e.target.files)}
          />
          <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">Clique para selecionar arquivos ou arraste documentos para cá</p>
          <p className="text-[10px] text-slate-400 mt-1">Suporta manuais em PDF, planilhas Excel, documentos e fotos comprobatórias</p>
        </div>

        {/* Lista de Arquivos Anexados */}
        {attachments.length > 0 && (
          <div className="space-y-2 pt-1">
            {attachments.map((att) => (
              <div 
                key={att.id} 
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{att.file_name}</p>
                    <p className="text-[10px] text-slate-500">{(att.file_size / 1024).toFixed(1)} KB • {att.file_type || 'Arquivo'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a 
                    href={att.file_path} 
                    download={att.file_name} 
                    className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    title="Baixar arquivo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remover anexo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen image preview lightbox */}
      {previewImageModal && (
        <ImageLightboxModal
          image={previewImageModal}
          onClose={() => setPreviewImageModal(null)}
        />
      )}
    </form>
  );
};
