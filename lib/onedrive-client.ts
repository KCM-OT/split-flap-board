import axios from 'axios';

interface OneDriveFile {
  id: string;
  name: string;
  webUrl: string;
  lastModifiedDateTime: string;
}

export class OneDriveClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const params = new URLSearchParams();
    params.append('client_id', process.env.ONEDRIVE_CLIENT_ID || '');
    params.append('client_secret', process.env.ONEDRIVE_CLIENT_SECRET || '');
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    try {
      const response = await axios.post(tokenUrl, params);
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to authenticate with OneDrive:', error);
      throw error;
    }
  }

  async listPDFsInFolder(): Promise<OneDriveFile[]> {
    const token = await this.authenticate();
    const folderId = process.env.ONEDRIVE_FOLDER_ID;

    try {
      const response = await axios.get(
        `${process.env.MICROSOFT_GRAPH_API_ENDPOINT}/me/drive/items/${folderId}/children`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { $filter: "endsWith(name, '.pdf')" },
        }
      );

      return response.data.value || [];
    } catch (error) {
      console.error('Failed to list OneDrive files:', error);
      return [];
    }
  }

  async downloadFile(fileId: string, fileName: string): Promise<Buffer> {
    const token = await this.authenticate();

    try {
      const response = await axios.get(
        `${process.env.MICROSOFT_GRAPH_API_ENDPOINT}/me/drive/items/${fileId}/content`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error(`Failed to download file ${fileName}:`, error);
      throw error;
    }
  }
}

export const oneDriveClient = new OneDriveClient();
