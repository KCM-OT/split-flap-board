import pdfParse from 'pdf-parse';
import * as fs from 'fs';
import * as path from 'path';

export interface KPIRow {
  metric: string;
  votes: string;
  score: string;
  status: 'ON TIME' | 'BOARDING' | 'DELAYED' | 'CANCELLED';
}

export interface PDFReport {
  title: string;
  subtitle: string;
  respondents: number;
  rows: KPIRow[];
  timestamp: string;
  filename: string;
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

function parseStatusFromText(text: string): 'ON TIME' | 'BOARDING' | 'DELAYED' | 'CANCELLED' {
  const normalized = text.toUpperCase().trim();
  if (normalized.includes('ON TIME') || normalized.includes('ON-TIME')) return 'ON TIME';
  if (normalized.includes('BOARDING')) return 'BOARDING';
  if (normalized.includes('DELAYED')) return 'DELAYED';
  if (normalized.includes('CANCELLED')) return 'CANCELLED';
  return 'BOARDING';
}

export async function parsePDFReport(filePath: string): Promise<PDFReport> {
  const text = await extractTextFromPDF(filePath);
  const lines = text.split('\n').filter(l => l.trim());

  // Extract title and subtitle from first lines
  const title = lines[0]?.substring(0, 22).padEnd(22) || 'REPORT';
  const subtitle = lines[1]?.substring(0, 20).padEnd(20) || 'ANALYSIS';

  // Mock extraction - adjust based on actual PDF structure
  const rows: KPIRow[] = [
    { metric: 'ON-TIME COMPLETION', votes: '2/2', score: '100%', status: 'ON TIME' },
    { metric: 'CYCLE TIME BY STAGE', votes: '1/2', score: '50%', status: 'BOARDING' },
    { metric: 'RESIDUAL RISK TREND', votes: '1/2', score: '50%', status: 'BOARDING' },
    { metric: 'SETUP EASE', votes: '1/1', score: '4/5', status: 'ON TIME' },
    { metric: 'USE FREQUENTLY', votes: '1/1', score: '4/5', status: 'ON TIME' },
    { metric: 'TRUST FOR DECISIONS', votes: '1/1', score: '4/5', status: 'ON TIME' },
    { metric: 'FOUND COMPLEX', votes: '1/1', score: '4/5', status: 'DELAYED' },
    { metric: 'OPEN INSIGHTS CAPTURED', votes: '0/3', score: '--', status: 'CANCELLED' },
  ];

  return {
    title: title.substring(0, 22),
    subtitle: subtitle.substring(0, 20),
    respondents: 2,
    rows,
    timestamp: new Date().toISOString(),
    filename: path.basename(filePath),
  };
}
