import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFReport, parsePDFReport } from '@/lib/pdf-parser';
import * as fs from 'fs';
import * as path from 'path';

let reportHistory: PDFReport[] = [];
let initialized = false;

async function initializeMockData() {
  if (initialized) return;

  try {
    const pdfPath = path.join(process.cwd(), 'pdf-reports', 'usefulness-study_report_nxw7mthavmev.pdf');
    if (fs.existsSync(pdfPath)) {
      const report = await parsePDFReport(pdfPath);
      reportHistory = [report];
    }
  } catch (error) {
    console.error('Failed to load mock PDF:', error);
  }

  initialized = true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await initializeMockData();

  if (req.method === 'GET') {
    const action = req.query.action as string;

    if (action === 'current') {
      const current = reportHistory[0] || null;
      return res.status(200).json({ report: current });
    }

    if (action === 'history') {
      return res.status(200).json({ reports: reportHistory });
    }

    return res.status(200).json({ reports: reportHistory });
  }

  if (req.method === 'POST') {
    const report = req.body as PDFReport;
    reportHistory.unshift(report);
    reportHistory = reportHistory.slice(0, 20);

    return res.status(201).json({ success: true, report });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
