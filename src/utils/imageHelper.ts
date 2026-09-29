/**
 * Helper utility for handling and optimizing POP Step images.
 * Produces crisp, base64-encoded Data URLs suitable for instant rendering,
 * storage within the POP document structure, and flawless html2canvas PDF exports.
 */

export function fileToOptimizedDataUrl(file: File, maxDim: number = 1200, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem.'));
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Não foi possível carregar a imagem.'));
        return;
      }

      // If SVG or very small image, return directly
      if (file.type === 'image/svg+xml' || file.size < 80 * 1024) {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(result); // Fallback to raw data url if load fails
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG for optimal size/clarity balance
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedDataUrl);
        } catch {
          resolve(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Standard industrial procedural SVG templates for quick visual demonstration
 */
export const PRESET_STEP_IMAGES = [
  {
    id: 'safety_inspection',
    label: 'Inspeção & Botão de Emergência',
    caption: 'Foto do painel frontal com acionamento do botão cogumelo e barreiras de luz',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340"><rect width="600" height="340" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="300" cy="140" r="60" fill="%23e11d48" stroke="%23ffe4e6" stroke-width="8"/><rect x="288" y="100" width="24" height="40" rx="4" fill="%23ffffff"/><circle cx="300" cy="155" r="10" fill="%23ffffff"/><text x="300" y="240" fill="%23f8fafc" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">PARADA DE EMERGÊNCIA NR-12</text><text x="300" y="268" fill="%2394a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">Verificar destravamento e integridade do relé de segurança</text><rect x="40" y="40" width="100" height="24" rx="4" fill="%2310b981"/><text x="90" y="56" fill="%23ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">INSPEÇÃO OK</text></svg>`
  },
  {
    id: 'precision_measurement',
    label: 'Medição & Paquímetro Digital',
    caption: 'Conferência dimensional da primeira peça com paquímetro digital calibrado',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340"><rect width="600" height="340" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/><rect x="80" y="130" width="440" height="30" rx="4" fill="%2394a3b8"/><rect x="180" y="90" width="130" height="110" rx="8" fill="%23334155" stroke="%2338bdf8" stroke-width="3"/><rect x="195" y="105" width="100" height="45" rx="4" fill="%230284c7"/><text x="245" y="138" fill="%23ffffff" font-family="monospace" font-weight="bold" font-size="24" text-anchor="middle">18.52</text><text x="282" y="125" fill="%23bae6fd" font-family="sans-serif" font-size="10" text-anchor="middle">mm</text><text x="300" y="245" fill="%23f8fafc" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">TOLERÂNCIA DIMENSIONAL (+/- 0,2 mm)</text><text x="300" y="272" fill="%2394a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">Garantir esquadro e espessura do lote piloto antes da liberação</text></svg>`
  },
  {
    id: 'barcode_labeling',
    label: 'Etiquetagem & Paletização',
    caption: 'Fixação de etiqueta de identificação e padrão de empilhamento no palete',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340"><rect width="600" height="340" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/><rect x="190" y="60" width="220" height="130" rx="8" fill="%23ffffff"/><line x1="220" y1="85" x2="220" y2="135" stroke="%23000" stroke-width="4"/><line x1="230" y1="85" x2="230" y2="135" stroke="%23000" stroke-width="2"/><line x1="240" y1="85" x2="240" y2="135" stroke="%23000" stroke-width="6"/><line x1="255" y1="85" x2="255" y2="135" stroke="%23000" stroke-width="2"/><line x1="265" y1="85" x2="265" y2="135" stroke="%23000" stroke-width="5"/><line x1="280" y1="85" x2="280" y2="135" stroke="%23000" stroke-width="3"/><line x1="295" y1="85" x2="295" y2="135" stroke="%23000" stroke-width="6"/><line x1="315" y1="85" x2="315" y2="135" stroke="%23000" stroke-width="4"/><line x1="330" y1="85" x2="330" y2="135" stroke="%23000" stroke-width="2"/><line x1="345" y1="85" x2="345" y2="135" stroke="%23000" stroke-width="5"/><line x1="365" y1="85" x2="365" y2="135" stroke="%23000" stroke-width="3"/><line x1="380" y1="85" x2="380" y2="135" stroke="%23000" stroke-width="4"/><text x="300" y="165" fill="%231e293b" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">LOTE-2026-RUFATO-091</text><text x="300" y="240" fill="%23f8fafc" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">PADRÃO DE ETIQUETAGEM & RASTREABILIDADE</text><text x="300" y="268" fill="%2394a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">Etiqueta visível no canto superior direito do fardo</text></svg>`
  },
  {
    id: 'ppe_checklist',
    label: 'Uso de EPIs Obrigatórios',
    caption: 'Equipamentos de Proteção Individual exigidos para execução da tarefa',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340"><rect width="600" height="340" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%23334155" stroke-width="2"/><circle cx="210" cy="120" r="45" fill="%232563eb"/><text x="210" y="128" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle">EPI</text><circle cx="390" cy="120" r="45" fill="%23f59e0b"/><text x="390" y="128" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle">NR-6</text><text x="300" y="230" fill="%23f8fafc" font-family="sans-serif" font-weight="bold" font-size="18" text-anchor="middle">USO OBRIGATÓRIO DE ÓCULOS E PROTETOR AURICULAR</text><text x="300" y="258" fill="%2394a3b8" font-family="sans-serif" font-size="13" text-anchor="middle">Calçado com biqueira e luvas anticorte nos pontos de pinçamento</text></svg>`
  }
];
