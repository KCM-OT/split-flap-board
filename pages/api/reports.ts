import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFReport, parsePDFReport } from '@/lib/pdf-parser';
import * as fs from 'fs';
import * as path from 'path';

let cachedReport: PDFReport | null = null;

async function loadPDFReport() {
  if (cachedReport) return cachedReport;

  try {
    const pdfPath = path.join(process.cwd(), 'pdf-reports', 'usefulness-study_report_nxw7mthavmev.pdf');
    if (fs.existsSync(pdfPath)) {
      cachedReport = await parsePDFReport(pdfPath);
      return cachedReport;
    }
  } catch (error) {
    console.error('Failed to load PDF:', error);
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const report = await loadPDFReport();

  if (!report) {
    return res.status(500).json({ error: 'Failed to load report' });
  }

  return res.status(200).json({ report });
}
