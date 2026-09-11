# MAZE Split-Flap Board

Real-time KPI visualization using a split-flap board display that pulls data from Maze PDF reports stored in OneDrive.

## Features

- **Split-Flap Display**: Animated tile-flipping interface mimicking Vestaboard
- **Live PDF Monitoring**: Automatically detects and processes new PDF reports from OneDrive
- **Report Queue**: Maintains history of reports and cycles through them during inactivity
- **Auto-Refresh**: Displays a new report every 5 minutes if no new PDFs arrive
- **Dark Theme**: Modern, elegant interface designed for continuous display

## Tech Stack

- **Frontend**: React/Next.js with TypeScript
- **Backend**: Next.js API Routes
- **PDF Processing**: pdf-parse
- **OneDrive Integration**: Microsoft Graph API
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/KCM-OT/MAZE-SPLIT-FLAP-BOARD.git
cd MAZE-SPLIT-FLAP-BOARD
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MICROSOFT_GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
ONEDRIVE_CLIENT_ID=your_client_id
ONEDRIVE_CLIENT_SECRET=your_client_secret
ONEDRIVE_FOLDER_ID=your_folder_id
PDF_POLLING_INTERVAL=60000
INACTIVITY_REFRESH_TIME=300000
```

### 4. Set Up Microsoft Graph API Access

#### a. Create an Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Name: "Maze Split-Flap Board"
5. Select **Accounts in this organizational directory only**
6. Click **Register**

#### b. Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Copy the **Value** (this is your `ONEDRIVE_CLIENT_SECRET`)

#### c. Grant Permissions

1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Application permissions**
4. Search and add:
   - `Files.Read.All`
   - `Drive.Read.All`
5. Click **Grant admin consent**

#### d. Get Your Folder ID

1. Open OneDrive in your browser
2. Navigate to the folder where PDF reports will be stored
3. Copy the folder ID from the URL:
   - URL: `https://onedrive.live.com/?cid=xxx&id=FOLDER_ID%21xxx`
   - The `FOLDER_ID` is the long alphanumeric string

### 5. Set Up OneDrive Sharing

To allow team members to upload PDFs:

1. Right-click the folder in OneDrive
2. Click **Share**
3. Choose **Specific people**
4. Add your team members with **Can edit** permissions
5. Note: Contributors should use the same OneDrive folder

### 6. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts to connect your GitHub repository and set environment variables.

## PDF Data Structure

The app expects Maze PDF reports with the following information:

- **Title**: Report name (max 22 chars)
- **Subtitle**: Study/metric type (max 18 chars)
- **Respondents**: Number of respondents
- **Rows**: Each row should contain:
  - `metric`: Name of KPI (max 22 chars)
  - `votes`: Fractional votes (e.g., "2/2")
  - `score`: Percentage or rating (e.g., "100%", "4/5")
  - `status`: One of: "ON TIME", "BOARDING", "DELAYED", "CANCELLED"

## Customization

### Adjust Polling Intervals

Edit `.env.local`:

```env
PDF_POLLING_INTERVAL=60000  # Check OneDrive every 60 seconds
INACTIVITY_REFRESH_TIME=300000  # Refresh board every 5 minutes
```

### Modify Colors and Styling

Edit `components/SplitFlapBoard.module.css`:

```css
--green: #6fcf97;   /* ON TIME color */
--gold: #f2b807;    /* BOARDING color */
--coral: #ff7a59;   /* DELAYED color */
--grey: #7d8590;    /* CANCELLED color */
```

### Change Board Dimensions

Edit `components/SplitFlapBoard.tsx` to adjust flap sizes in the `SIZES` object.

## Troubleshooting

### "Failed to authenticate with OneDrive"

- Check that `ONEDRIVE_CLIENT_ID` and `ONEDRIVE_CLIENT_SECRET` are correct
- Verify the app registration has the required permissions
- Ensure permissions have been granted with admin consent

### "Failed to list OneDrive files"

- Verify `ONEDRIVE_FOLDER_ID` is correct
- Check that the app has `Files.Read.All` and `Drive.Read.All` permissions
- Ensure the service account has access to the folder

### PDFs not updating

- Verify polling interval in `.env.local`
- Check OneDrive folder permissions
- Look at server logs for PDF parsing errors

## Deployment Notes

- Vercel max function duration is 60 seconds for hobby plans; consider upgrading for longer-running tasks
- PDFs are processed in-memory; large files (>10MB) may exceed memory limits
- OneDrive polling adds minimal overhead (~1-2 seconds per check)

## Architecture

```
┌─────────────────┐
│   OneDrive      │
│  PDF Folder     │
└────────┬────────┘
         │ (polls every 60s)
         │
┌────────▼────────────────┐
│  Vercel Backend         │
│  - /api/sync-onedrive   │
│  - /api/process-pdf     │
│  - /api/reports         │
└────────┬────────────────┘
         │ (REST API)
         │
┌────────▼────────────────┐
│  React Frontend         │
│  - SplitFlapBoard       │
│  - Auto-refresh logic   │
└────────────────────────┘
```

## License

MIT

## Support

For issues or feature requests, please create a GitHub issue.
