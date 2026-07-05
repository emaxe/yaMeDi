import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

import type { CsvHeader } from './csvExport'

export type PdfHeader = CsvHeader

export function exportToPdf(
  filename: string,
  headers: PdfHeader[],
  rows: Record<string, string | number | undefined>[]
): void {
  if (rows.length === 0) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const tableHead = [headers.map((h) => h.label)]
  const tableBody = rows.map((row) => headers.map((h) => row[h.key] ?? ''))

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [55, 65, 81], textColor: 255, fontStyle: 'bold' },
    margin: { top: 15, right: 10, bottom: 10, left: 10 },
  })

  doc.save(filename)
}

export async function exportElementToPdf(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;
    
    // Config for html2pdf
    const opt: any = {
      margin:       10, // 10mm margin on all sides
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        ignoreElements: (el: Element) => el.classList.contains('no-export')
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'], avoid: ['tr', '.bg-surface-elevated', 'h2', 'h3'] }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}
