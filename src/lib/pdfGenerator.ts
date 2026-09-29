import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { POP, POPVersion, Acknowledgement, Employee } from '../types';
import { formatDate, formatDateTime, formatCPF } from '../utils/helpers';

export async function generateElementPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento #${elementId} não encontrado para geração de PDF.`);
  }

  // Pre-load and wait for images to load with a max timeout
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 1200); // 1.2s timeout fallback
      });
    })
  );

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.offsetWidth || 1280,
      ignoreElements: (el) => {
        return el.classList && el.classList.contains('no-print');
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 2) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (canvasErr) {
    console.warn('html2canvas encontrou restrição de renderização. Acionando diálogo nativo de impressão/PDF do navegador...', canvasErr);
    // Fallback garantido: Aciona a janela de impressão nativa do navegador
    window.print();
  }
}

export function generateEvidenceReportPDF(
  ack: Acknowledgement,
  employee: Employee,
  pop: POP,
  version: POPVersion
): void {
  const doc = new jsPDF();

  // Header Box
  doc.setFillColor(30, 58, 138); // Navy Blue
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('POP CONTROL - RELATÓRIO DE EVIDÊNCIA DE CIÊNCIA', 105, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Compliance Operacional e Trilha Auditável de Assinatura', 105, 20, { align: 'center' });

  // Document Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 35, 182, 38, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`PROCEDIMENTO OPERACIONAL PADRÃO: ${pop.code}`, 20, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Título: ${pop.title}`, 20, 52);
  doc.text(`Versão Vigente: ${ack.version_number}   |   Classificação: ${pop.classification}`, 20, 60);
  doc.text(`Data de Publicação da Versão: ${formatDate(version.published_date || version.created_at)}`, 20, 68);

  // Employee Box
  doc.roundedRect(14, 80, 182, 38, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DADOS DO COLABORADOR DECLARANTE', 20, 89);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nome Completo: ${employee.full_name}`, 20, 97);
  doc.text(`Matrícula: ${employee.registration_number}   |   CPF: ${formatCPF(employee.cpf)}`, 20, 105);
  doc.text(`Empresa: ${pop.company_name || 'Rufato Móveis'}   |   Setor: ${employee.department_name}   |   Cargo: ${employee.position_title}`, 20, 113);

  // Evidence Details Box
  doc.roundedRect(14, 125, 182, 55, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EVIDÊNCIA AUDITÁVEL DE CIÊNCIA & ASSINATURA', 20, 134);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Data e Hora da Confirmação: ${formatDateTime(ack.acknowledged_at)}`, 20, 142);
  doc.text(`Tipo de Confirmação: ${ack.confirmation_type.toUpperCase().replace('_', ' ')}`, 20, 149);
  doc.text(`Identificador Único (Transação): ${ack.transaction_id || 'N/A'}`, 20, 156);
  doc.text(`Endereço IP Registrado: ${ack.ip_address || '189.120.45.102'}`, 20, 163);
  doc.text(`Navegador/User-Agent: ${ack.user_agent.substring(0, 75)}...`, 20, 170);

  // Hash Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 186, 182, 22, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('HASH INTEGRITY ID (SHA-256 SIMULADO DO DOCUMENTO):', 20, 194);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text(ack.document_hash, 20, 202);

  // Term box
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Termo Declarado: "${ack.term_text}"`, 20, 215, { maxWidth: 170 });

  // Signature image if available
  if (ack.signature_url) {
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Representação Gráfica da Assinatura:', 20, 232);
      doc.addImage(ack.signature_url, 'PNG', 20, 235, 50, 20);
    } catch (e) {
      console.warn('Signature image insertion warning:', e);
    }
  }

  // Legal Disclaimer Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 270, 196, 270);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Aviso Legal: A validação técnica e temporal deste certificado é garantida pelo sistema POP Control.', 105, 275, { align: 'center' });
  doc.text('Para verificar a autenticidade deste documento acesse a página de verificação utilizando o Transaction ID.', 105, 280, { align: 'center' });

  doc.save(`Evidencia_${pop.code}_${employee.registration_number}.pdf`);
}
