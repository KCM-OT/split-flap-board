import { useEffect, useState } from 'react';
import SplitFlapBoard from '@/components/SplitFlapBoard';
import { PDFReport } from '@/lib/pdf-parser';

const POLLING_INTERVAL = 60000;
const INACTIVITY_REFRESH_TIME = 300000;

export default function Home() {
  const [currentReport, setCurrentReport] = useState<PDFReport | null>(null);
  const [reportHistory, setReportHistory] = useState<PDFReport[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (data.reports && data.reports.length > 0) {
          setReportHistory(data.reports);
          setCurrentReport(data.reports[0]);
          setCurrentIndex(0);
          setLastActivityTime(Date.now());
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      }
    }

    fetchReports();
  }, []);

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync-onedrive');
        const data = await res.json();

        if (data.newFiles && data.newFiles.length > 0) {
          const newFile = data.newFiles[0];

          try {
            const processRes = await fetch('/api/process-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileId: newFile.id, fileName: newFile.name }),
            });

            const processData = await processRes.json();
            if (processData.report) {
              const newReport = processData.report;

              setReportHistory(prev => [newReport, ...prev].slice(0, 20));
              setCurrentReport(newReport);
              setCurrentIndex(0);
              setLastActivityTime(Date.now());
            }
          } catch (error) {
            console.error('Failed to process PDF:', error);
          }
        }
      } catch (error) {
        console.error('Failed to sync OneDrive:', error);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;

      if (timeSinceLastActivity > INACTIVITY_REFRESH_TIME && reportHistory.length > 0) {
        const nextIndex = (currentIndex + 1) % reportHistory.length;
        setCurrentReport(reportHistory[nextIndex]);
        setCurrentIndex(nextIndex);
        setLastActivityTime(Date.now());
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [currentIndex, reportHistory, lastActivityTime]);

  return (
    <main style={{ minHeight: '100vh', background: `radial-gradient(1200px 600px at 50% -10%, #1c2027 0%, transparent 60%), linear-gradient(160deg, #0b0d10, #15181c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: "'Inter', sans-serif" }}>
      <SplitFlapBoard report={currentReport} />
    </main>
  );
}
