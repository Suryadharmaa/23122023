import { useEffect, useRef, useState } from 'react';

type Props = { onReward: (score: number) => void; disabled: boolean };
export function CatchGame({ onReward, disabled }: Props) {
  const [status, setStatus] = useState<'ready' | 'playing' | 'done'>('ready');
  const [seconds, setSeconds] = useState(25);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ x: 45, y: 45 });
  const scoreRef = useRef(0);
  const settled = useRef(false);
  const deadline = useRef(0);
  const rewardRef = useRef(onReward);
  rewardRef.current = onReward;
  useEffect(() => {
    if (status !== 'playing') return;
    if (disabled) { settled.current = true; setStatus('done'); setScore(0); return; }
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining && !settled.current) {
        settled.current = true; setStatus('done'); rewardRef.current(Math.min(45, scoreRef.current * 2));
      }
    }, 200);
    const move = window.setInterval(() => setTarget({ x: 8 + Math.random() * 76, y: 8 + Math.random() * 65 }), 1300);
    return () => { clearInterval(timer); clearInterval(move); };
  }, [status, disabled]);
  function start() {
    if (disabled) return;
    scoreRef.current = 0; settled.current = false; deadline.current = Date.now() + 25000;
    setScore(0); setSeconds(25); setStatus('playing');
  }
  return <section className="pet-minigame">
    <div className="pet-game-heading"><div><h3>Tangkap bintang</h3><p>Ketuk bintang sebelum berpindah. 2 koin per tangkapan, maksimal 45.</p></div><b>{seconds}s · {score} ★</b></div>
    <div className="pet-catch-field">
      {status === 'playing' ? <button className="pet-star-target" aria-label="Tangkap bintang" style={{ left: `${target.x}%`, top: `${target.y}%` }} onClick={() => {
        if (settled.current || Date.now() >= deadline.current) return;
        scoreRef.current++; setScore(scoreRef.current); setTarget({ x: 8 + Math.random() * 76, y: 8 + Math.random() * 65 });
      }}>⭐</button> : <div className="pet-game-intro"><span>✦</span><h4>{status === 'done' ? `${score} bintang tertangkap!` : 'Seberapa cepat kaki kecilmu?'}</h4><button className="pet-primary" disabled={disabled} onClick={start}>{status === 'done' ? 'Main lagi' : 'Mulai · 25 detik'}</button></div>}
    </div>
    {disabled && <p className="pet-help">Bangunkan pet atau pulihkan energi sampai 10 untuk bermain.</p>}
  </section>;
}

const pictures = ['🐟', '🧶', '🌼', '🌙'];
function shuffledCards() { return [...pictures, ...pictures].map((icon, index) => ({ icon, index, sort: Math.random() })).sort((a, b) => a.sort - b.sort); }
export function MemoryGame({ onReward, disabled }: Props) {
  const [cards, setCards] = useState(shuffledCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [status, setStatus] = useState<'ready' | 'playing' | 'done'>('ready');
  const [seconds, setSeconds] = useState(45);
  const [earned, setEarned] = useState(0);
  const deadline = useRef(0);
  const settled = useRef(false);
  const matchesRef = useRef(0);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rewardRef = useRef(onReward);
  rewardRef.current = onReward;
  function finish(reward: number) {
    if (settled.current) return;
    settled.current = true; clearTimeout(revealTimer.current); setFlipped([]);
    setStatus('done'); setEarned(reward); rewardRef.current(reward);
  }
  useEffect(() => {
    if (status !== 'playing') return;
    if (disabled) { settled.current = true; setStatus('done'); setEarned(0); setFlipped([]); return; }
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setSeconds(remaining);
      if (!remaining && !settled.current) { settled.current = true; setStatus('done'); const reward = matchesRef.current * 5; setEarned(reward); rewardRef.current(reward); }
    }, 200);
    return () => { clearInterval(timer); clearTimeout(revealTimer.current); };
  }, [status, disabled]);
  function start() {
    if (disabled) return;
    clearTimeout(revealTimer.current); settled.current = false; matchesRef.current = 0; deadline.current = Date.now() + 45000;
    setCards(shuffledCards()); setFlipped([]); setMatched([]); setSeconds(45); setStatus('playing');
  }
  function choose(index: number) {
    if (disabled || status !== 'playing' || settled.current || Date.now() >= deadline.current || flipped.length === 2 || matched.includes(index) || flipped.includes(index)) return;
    const next = [...flipped, index]; setFlipped(next);
    if (next.length !== 2) return;
    if (cards[next[0]].icon === cards[next[1]].icon) {
      const matches = [...matched, ...next]; setMatched(matches); setFlipped([]); matchesRef.current = matches.length / 2;
      if (matches.length === cards.length) finish(25 + Math.min(15, Math.max(0, Math.floor((deadline.current - Date.now()) / 3000))));
    } else revealTimer.current = setTimeout(() => setFlipped([]), 650);
  }
  return <section className="pet-minigame">
    <div className="pet-game-heading"><div><h3>Pasangan Mochi</h3><p>Cari 4 pasangan dalam 45 detik. Selesaikan untuk mendapat bonus koin.</p></div><b>{seconds}s</b></div>
    {status === 'playing' ? <div className="pet-memory-grid">{cards.map((card, i) => <button key={card.index} className={`pet-memory-card ${matched.includes(i) ? 'matched' : ''}`} aria-label={matched.includes(i) ? 'Pasangan ditemukan' : flipped.includes(i) ? `Kartu ${card.icon}` : `Buka kartu ${i + 1}`} disabled={matched.includes(i)} onClick={() => choose(i)}>{flipped.includes(i) || matched.includes(i) ? card.icon : '🐾'}</button>)}</div> : <div className="pet-game-intro pet-memory-intro"><span>🧶</span><h4>{status === 'done' ? `Selesai! +${earned} koin` : 'Ingat letak mainan favoritnya.'}</h4><button className="pet-primary" disabled={disabled} onClick={start}>{status === 'done' ? 'Main lagi' : 'Mulai · 45 detik'}</button></div>}
    {disabled && <p className="pet-help">Bangunkan pet atau pulihkan energi sampai 10 untuk bermain.</p>}
  </section>;
}
