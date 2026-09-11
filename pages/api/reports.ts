import type { NextApiRequest, NextApiResponse } from 'next';
import { PDFReport } from '@/lib/pdf-parser';

let reportHistory: PDFReport[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
