'use client';

import React, { useEffect, useState } from 'react';
import { PDFReport } from '@/lib/pdf-parser';
import styles from './SplitFlapBoard.module.css';

const STATUS_COLOR = {
  'ON TIME': '#6fcf97',
  'BOARDING': '#f2b807',
  'DELAYED': '#ff7a59',
  'CANCELLED': '#7d8590',
};

function pad(str: string, width: number): string {
  return str.toUpperCase().padEnd(width, ' ').slice(0, width);
}

interface SplitFlapBoardProps {
  report: PDFReport | null;
}

export default function SplitFlapBoard({ report }: SplitFlapBoardProps) {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const ticker = setInterval(() => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      setTime(`${String(h).padStart(2, '0')}:${m}:${s} ${period}`);
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  if (!report) {
    return (
      <div className={styles.stage}>
        <div className={styles['board-frame']}>
          <div className={styles['hero-wrap']}>Loading...</div>
        </div>
      </div>
    );
  }

  const baseTextStyle = { fontFamily: "'Big Shoulders Display', sans-serif", color: '#ece6d8', lineHeight: '1.2' };

  return (
    <div className={styles.stage}>
      <div
        className={styles['board-frame']}
        style={
          {
            '--w-metric': '576px',
            '--w-votes': '78px',
            '--w-score': '104px',
            '--w-status': '234px',
          } as any
        }
      >
        <div className={styles['hero-wrap']}>
          <div style={{ ...baseTextStyle, fontSize: '34px', fontWeight: 700 }}>
            {report.title.padEnd(20)}
          </div>
        </div>

        <div className={styles['sub-wrap']}>
          <div style={{ ...baseTextStyle, fontSize: '20px', fontWeight: 700 }}>
            {report.subtitle.padEnd(18)}
          </div>
          <div className={styles.clock}>{time}</div>
        </div>

        <div className={styles['table-head']}>
          <span>METRIC</span>
          <span>VOTES</span>
          <span>SCORE</span>
          <span>STATUS</span>
        </div>

        <div className={styles.rows}>
          {report.rows.map((row, idx) => (
            <div key={idx} className={`${styles.row} ${styles.visible}`} style={{ display: 'grid', gridTemplateColumns: 'var(--w-metric) var(--w-votes) var(--w-score) var(--w-status)', columnGap: '28px', alignItems: 'center', padding: '6px 2px', borderRadius: '8px' }}>
              <span style={{ ...baseTextStyle, fontSize: '18px' }}>
                {pad(row.metric, 22)}
              </span>
              <span style={{ ...baseTextStyle, fontSize: '18px' }}>
                {pad(row.votes, 3)}
              </span>
              <span style={{ ...baseTextStyle, fontSize: '18px' }}>
                {pad(row.score, 4)}
              </span>
              <span style={{ ...baseTextStyle, fontSize: '18px', fontWeight: 800, color: STATUS_COLOR[row.status] }}>
                {pad(row.status, 9)}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.nameplate}>
          <span>MODEL SF·24 · SOURCE: MAZE REPORT · N = {report.respondents} RESPONDENTS</span>
          <button className={styles['replay-btn']} onClick={() => window.location.reload()}>
            REFRESH BOARD
          </button>
        </div>
      </div>
    </div>
  );
}
