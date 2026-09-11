import { useEffect, useState } from 'react';
import SplitFlapBoard from '@/components/SplitFlapBoard';
import { PDFReport } from '@/lib/pdf-parser';

const INACTIVITY_REFRESH_TIME = 300000;

export default function Home() {
  const [report, setReport] = useState<PDFReport | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (data.report) {
          setReport(data.report);
          setLastActivityTime(Date.now());
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
      }
    }

    fetchReport();
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;

      if (timeSinceLastActivity > INACTIVITY_REFRESH_TIME) {
        try {
          const res = await fetch('/api/reports');
          const data = await res.json();
          if (data.report) {
            setReport(data.report);
            setLastActivityTime(Date.now());
          }
        } catch (error) {
          console.error('Failed to refresh report:', error);
        }
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [lastActivityTime]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: `radial-gradient(1200px 600px at 50% -10%, #1c2027 0%, transparent 60%), linear-gradient(160deg, #0b0d10, #15181c)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <SplitFlapBoard report={report} />
    </main>
  );
}
