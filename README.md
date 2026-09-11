# MAZE Split-Flap Board

KPI visualization using a split-flap board display that loads data from local PDF reports.

## Features

- **Split-Flap Display**: Elegant tile display mimicking Vestaboard
- **PDF Data Loading**: Processes PDF reports and displays KPI metrics
- **Auto-Refresh**: Refreshes display every 5 minutes
- **Dark Theme**: Modern interface optimized for continuous display
- **Color-Coded Status**: Visual indicators for KPI status (ON TIME, BOARDING, DELAYED, CANCELLED)

## Tech Stack

- **Frontend**: React/Next.js with TypeScript
- **Backend**: Next.js API Routes
- **PDF Processing**: pdf-parse
- **Deployment**: Vercel

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/KCM-OT/MAZE-SPLIT-FLAP-BOARD.git
cd MAZE-SPLIT-FLAP-BOARD
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Local Development

```bash
npm run dev
```

Visit `http://localhost:3000`

The app will automatically load the sample PDF from `pdf-reports/usefulness-study_report_nxw7mthavmev.pdf`

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts to connect your GitHub repository. No environment variables needed!

## How to Use

**To update the displayed data:**

1. Replace the PDF file in the `pdf-reports/` directory with your new report
2. Keep the same filename: `usefulness-study_report_nxw7mthavmev.pdf`
3. Refresh the page or wait for auto-refresh (5 minutes)

**To customize the refresh intervals:**

Edit `pages/index.tsx` and adjust:
```typescript
const INACTIVITY_REFRESH_TIME = 300000; // 5 minutes
```

## PDF Data Format

The app expects Maze PDF reports with:

- **Title**: Report name (max 22 chars)
- **Subtitle**: Study/metric type (max 18 chars)
- **Respondents**: Number of respondents
- **Rows**: Each row with:
  - `metric`: Name of KPI (max 22 chars)
  - `votes`: Fractional votes (e.g., "2/2")
  - `score`: Percentage or rating (e.g., "100%", "4/5")
  - `status`: One of: "ON TIME", "BOARDING", "DELAYED", "CANCELLED"

## Customization

### Colors

Edit `components/SplitFlapBoard.tsx` to change status colors:

```typescript
const STATUS_COLOR = {
  'ON TIME': '#6fcf97',      // Green
  'BOARDING': '#f2b807',     // Gold
  'DELAYED': '#ff7a59',      // Red
  'CANCELLED': '#7d8590',    // Grey
};
```

### Styling

Edit `components/SplitFlapBoard.module.css` to customize appearance.

## Architecture

```
┌──────────────────┐
│   PDF File       │
│   (pdf-reports/) │
└─────────┬────────┘
          │
┌─────────▼────────────────┐
│   Vercel Backend         │
│   /api/reports (loads)   │
│   /api/pdf-parser        │
└─────────┬────────────────┘
          │
┌─────────▼────────────────┐
│   React Frontend         │
│   - SplitFlapBoard       │
│   - Auto-refresh (5min)  │
└──────────────────────────┘
```

## License

MIT

## Support

For issues or feature requests, please create a GitHub issue.
