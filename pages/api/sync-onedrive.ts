import type { NextApiRequest, NextApiResponse } from 'next';
import { oneDriveClient } from '@/lib/onedrive-client';

let lastProcessedFileId: string | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const files = await oneDriveClient.listPDFsInFolder();

    if (!files || files.length === 0) {
      return res.status(200).json({ newFiles: [], lastProcessedId: lastProcessedFileId });
    }

    const sortedFiles = files.sort(
      (a, b) => new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime()
    );

    const newFiles = sortedFiles.filter(f => f.id !== lastProcessedFileId).slice(0, 1);

    if (newFiles.length > 0) {
      lastProcessedFileId = newFiles[0].id;
    }

    return res.status(200).json({
      newFiles: newFiles.map(f => ({
        id: f.id,
        name: f.name,
        lastModified: f.lastModifiedDateTime,
      })),
      lastProcessedId: lastProcessedFileId,
    });
  } catch (error) {
    console.error('OneDrive sync failed:', error);
    return res.status(500).json({ error: 'Failed to sync OneDrive' });
  }
}
