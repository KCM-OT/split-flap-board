import type { NextApiRequest, NextApiResponse } from 'next';
import { parsePDFReport } from '@/lib/pdf-parser';
import { oneDriveClient } from '@/lib/onedrive-client';
import * as fs from 'fs';
import * as path from 'path';

const TEMP_DIR = '/tmp/split-flap-pdfs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    const fileId = req.body.fileId as string;
    const fileName = req.body.fileName as string;

    const fileBuffer = await oneDriveClient.downloadFile(fileId, fileName);
    const tempFilePath = path.join(TEMP_DIR, fileName);

    fs.writeFileSync(tempFilePath, fileBuffer);

    const report = await parsePDFReport(tempFilePath);

    fs.unlinkSync(tempFilePath);

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('PDF processing failed:', error);
    return res.status(500).json({ error: 'Failed to process PDF' });
  }
}
