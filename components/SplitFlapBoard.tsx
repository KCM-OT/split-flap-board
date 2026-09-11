'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PDFReport } from '@/lib/pdf-parser';
import styles from './SplitFlapBoard.module.css';

const ALPHABET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/%-';
const SIZES = {
  hero: { w: 40, h: 56, fs: 34 },
  sub: { w: 24, h: 36, fs: 20 },
  table: { w: 22, h: 32, fs: 18 },
};

interface FlapCellRef {
  _front: HTMLDivElement;
  _back: HTMLDivElement;
  _inner: HTMLDivElement;
}

const STATUS_COLOR = {
  'ON TIME': 'color-green',
  'BOARDING': 'color-gold',
  'DELAYED': 'color-coral',
  'CANCELLED': 'color-grey',
};

function buildFlapCell(size: (typeof SIZES)[keyof typeof SIZES]): HTMLDivElement & Partial<FlapCellRef> {
  const flap = document.createElement('div');
  flap.className = styles.flap;
  flap.style.width = size.w + 'px';
  flap.style.height = size.h + 'px';

  const inner = document.createElement('div');
  inner.className = styles['flap-inner'];

  const front = document.createElement('div');
  front.className = `${styles.face} ${styles.front}`;
  front.style.fontSize = size.fs + 'px';
  front.textContent = ' ';

  const back = document.createElement('div');
  back.className = `${styles.face} ${styles.back}`;
  back.style.fontSize = size.fs + 'px';
  back.textContent = ' ';

  inner.appendChild(front);
  inner.appendChild(back);

  const seam = document.createElement('div');
  seam.className = styles['flap-seam'];

  flap.appendChild(inner);
  flap.appendChild(seam);

  (flap as any)._front = front;
  (flap as any)._back = back;
  (flap as any)._inner = inner;
  return flap as HTMLDivElement & FlapCellRef;
}

function spinFlap(flap: HTMLDivElement & Partial<FlapCellRef>, targetChar: string, opts: any = {}): Promise<void> {
  const idx = ALPHABET.indexOf(targetChar);
  const steps = opts.steps ?? (8 + Math.floor(Math.random() * 7));
  const baseDelay = opts.baseDelay ?? 55;

  if (idx === -1) {
    (flap._front as HTMLDivElement).textContent = targetChar;
    return Promise.resolve();
  }

  const sequence = [];
  for (let i = steps; i >= 0; i--) {
    const pos = ((idx - i) % ALPHABET.length + ALPHABET.length) % ALPHABET.length;
    sequence.push(ALPHABET[pos]);
  }

  return new Promise(resolve => {
    let i = 0;
    function step() {
      if (i >= sequence.length) {
        resolve();
        return;
      }
      const nextChar = sequence[i];
      (flap._back as HTMLDivElement).textContent = nextChar;
      (flap._inner as HTMLDivElement).classList.add(styles.flip);

      const onEnd = () => {
        (flap._inner as HTMLDivElement).removeEventListener('transitionend', onEnd);
        (flap._inner as HTMLDivElement).style.transition = 'none';
        (flap._inner as HTMLDivElement).classList.remove(styles.flip);
        (flap._front as HTMLDivElement).textContent = nextChar;
        void (flap as any).offsetWidth;
        (flap._inner as HTMLDivElement).style.transition = '';
        i++;
        const remaining = sequence.length - i;
        const delay = remaining < 3 ? baseDelay * 1.8 : baseDelay;
        setTimeout(step, delay);
      };
      (flap._inner as HTMLDivElement).addEventListener('transitionend', onEnd, { once: true });
    }
    step();
  });
}

function buildFlapGroup(text: string, sizeKey: keyof typeof SIZES, extraClass?: string): HTMLDivElement & { _cells: (HTMLDivElement & Partial<FlapCellRef>)[] } {
  const size = SIZES[sizeKey];
  const group = document.createElement('div');
  group.className = `${styles['flap-group']} ${extraClass || ''}`;
  const cells = [];
  for (const ch of text) {
    const cell = buildFlapCell(size);
    group.appendChild(cell);
    cells.push(cell);
  }
  (group as any)._cells = cells;
  return group as any;
}

async function revealGroup(group: any, text: string, opts: any = {}): Promise<void> {
  const cells = group._cells;
  const jobs = [];
  for (let i = 0; i < cells.length; i++) {
    const ch = text[i] ?? ' ';
    const delay = i * (opts.stagger ?? 22);
    jobs.push(
      new Promise(res => {
        setTimeout(() => {
          spinFlap(cells[i], ch, opts).then(res);
        }, delay);
      })
    );
  }
  await Promise.all(jobs);
}

function pad(str: string, width: number): string {
  return str.toUpperCase().padEnd(width, ' ').slice(0, width);
}

interface SplitFlapBoardProps {
  report: PDFReport | null;
}

export default function SplitFlapBoard({ report }: SplitFlapBoardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const heroGroupRef = useRef<any>(null);
  const subGroupRef = useRef<any>(null);
  const rowsRef = useRef<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const W_METRIC = 22;
  const W_VOTES = 3;
  const W_SCORE = 4;
  const W_STATUS = 9;

  useEffect(() => {
    const ticker = setInterval(() => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;

      const clockEl = document.getElementById('clock');
      if (clockEl) {
        clockEl.innerHTML = `${String(h).padStart(2, '0')}:${m}:${s} <span>${period}</span>`;
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!stageRef.current || !report) return;

    setIsAnimating(true);

    const boardFrame = stageRef.current.querySelector('.board-frame');
    if (!boardFrame) return;

    const heroEl = boardFrame.querySelector('#hero');
    const subEl = boardFrame.querySelector('#sub');
    const rowsEl = boardFrame.querySelector('#rows');

    if (!heroEl || !subEl || !rowsEl) return;

    heroEl.innerHTML = '';
    subEl.innerHTML = '';
    rowsEl.innerHTML = '';

    const heroGroup = buildFlapGroup(report.title.padEnd(20, ' '), 'hero');
    heroEl.appendChild(heroGroup);
    heroGroupRef.current = heroGroup;

    const subGroup = buildFlapGroup(report.subtitle.padEnd(18, ' '), 'sub');
    subEl.appendChild(subGroup);
    subGroupRef.current = subGroup;

    rowsRef.current = report.rows.map(d => {
      const row = document.createElement('div');
      row.className = styles.row;

      const metricGroup = buildFlapGroup(pad(d.metric, W_METRIC), 'table', styles.metric);
      const votesGroup = buildFlapGroup(pad(d.votes, W_VOTES), 'table', styles.votes);
      const scoreGroup = buildFlapGroup(pad(d.score, W_SCORE), 'table', styles.score);
      const statusColor = STATUS_COLOR[d.status] || '';
      const statusGroup = buildFlapGroup(pad(d.status, W_STATUS), 'table', `${styles.status} ${statusColor}`);

      row.appendChild(metricGroup);
      row.appendChild(votesGroup);
      row.appendChild(scoreGroup);
      row.appendChild(statusGroup);

      rowsEl.appendChild(row);
      return { row, groups: { metricGroup, votesGroup, scoreGroup, statusGroup } };
    });

    (async () => {
      await revealGroup(heroGroup, report.title.padEnd(20, ' '), { stagger: 26, baseDelay: 60 });
      await new Promise(r => setTimeout(r, 150));
      await revealGroup(subGroup, report.subtitle.padEnd(18, ' '), { stagger: 18, baseDelay: 50 });
      await new Promise(r => setTimeout(r, 200));

      for (let i = 0; i < report.rows.length; i++) {
        const { row, groups } = rowsRef.current[i];
        const d = report.rows[i];
        row.classList.add(styles.visible);
        await new Promise(r => setTimeout(r, 90));
        revealGroup(groups.metricGroup, pad(d.metric, W_METRIC), { stagger: 12, baseDelay: 34 });
        revealGroup(groups.votesGroup, pad(d.votes, W_VOTES), { stagger: 12, baseDelay: 34 });
        revealGroup(groups.scoreGroup, pad(d.score, W_SCORE), { stagger: 12, baseDelay: 34 });
        await revealGroup(groups.statusGroup, pad(d.status, W_STATUS), { stagger: 12, baseDelay: 34 });
        await new Promise(r => setTimeout(r, 160));
      }

      setIsAnimating(false);
    })();
  }, [report]);

  return (
    <div className={styles.stage} ref={stageRef}>
      <div className={styles['board-frame']} style={{ '--w-metric': '576px', '--w-votes': '78px', '--w-score': '104px', '--w-status': '234px' } as any}>
        <div className={styles['hero-wrap']} id="hero"></div>

        <div className={styles['sub-wrap']}>
          <div className={styles['sub-flap']} id="sub"></div>
          <div className={styles.clock} id="clock">
            --:--:-- <span id="clock-period"></span>
          </div>
        </div>

        <div className={styles['table-head']}>
          <span>METRIC</span>
          <span>VOTES</span>
          <span>SCORE</span>
          <span>STATUS</span>
        </div>

        <div className={styles.rows} id="rows"></div>

        <div className={styles.nameplate}>
          <span>MODEL SF·24 · SOURCE: MAZE REPORT · N = {report?.respondents || 0} RESPONDENTS</span>
          <button className={styles['replay-btn']} onClick={() => window.location.reload()} disabled={isAnimating}>
            REFRESH BOARD
          </button>
        </div>
      </div>
    </div>
  );
}
