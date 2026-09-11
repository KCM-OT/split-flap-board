import type { NextApiRequest, NextApiResponse } from 'next';

// Mock implementation - no OneDrive integration for demo mode
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In demo mode, always return no new files
  // OneDrive integration can be enabled later by setting environment variables
  return res.status(200).json({
    newFiles: [],
    lastProcessedId: null,
    mode: 'demo',
  });
}
