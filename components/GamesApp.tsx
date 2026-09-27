'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check, Eye, RotateCcw, Trophy } from 'lucide-react';
import './games.css';

const levels = [
  { title: 'Cipondut', image: `${import.meta.env.BASE_URL}assets/games/cat-01.jpeg`, columns: 3, rows: 3 },
  { title: 'Cikonduy', image: `${import.meta.env.BASE_URL}assets/games/cat-02.jpeg`, columns: 3, rows: 4 },
  { title: 'Chimdut', image: `${import.meta.env.BASE_URL}assets/games/cat-03.jpeg`, columns: 4, rows: 4 },
] as const;

type Best = { moves: number; seconds: number };
const bestKey = 'memory-desktop-cat-puzzle-bests';
const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function shuffled(count: number): number[] {
  const result = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.every((value, i) => value === i)) [result[0], result[1]] = [result[1], result[0]];
  return result;
}

export default function GamesApp() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [pieces, setPieces] = useState<number[]>(() => shuffled(9));
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [solved, setSolved] = useState(false);
  const [peek, setPeek] = useState(false);
  const [bests, setBests] = useState<Record<number, Best>>({});
  const level = levels[levelIndex];

  useEffect(() => {
    try { setBests(JSON.parse(localStorage.getItem(bestKey) || '{}')); } catch { /* Ignore invalid old data. */ }
  }, []);
  useEffect(() => {
    if (!started || solved) return;
    const timer = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, solved]);

  function startLevel(index: number) {
    const next = levels[index];
    setLevelIndex(index);
    setPieces(shuffled(next.columns * next.rows));
    setSelected(null);
    setDragging(null);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setSolved(false);
    setPeek(false);
  }

  function swap(from: number, to: number) {
    if (solved || from === to) { setSelected(null); return; }
    const next = [...pieces];
    [next[from], next[to]] = [next[to], next[from]];
    setPieces(next);
    setSelected(null);
    setStarted(true);
    setMoves(m => m + 1);
    if (next.every((value, index) => value === index)) {
      setSolved(true);
      const score = { moves: moves + 1, seconds };
      const previous = bests[levelIndex];
      if (!previous || score.moves < previous.moves || (score.moves === previous.moves && score.seconds < previous.seconds)) {
        const updated = { ...bests, [levelIndex]: score };
        setBests(updated);
        try { localStorage.setItem(bestKey, JSON.stringify(updated)); } catch { /* Storage may be disabled. */ }
      }
    }
  }

  function choose(index: number) {
    if (solved) return;
    if (selected === null) setSelected(index);
    else if (selected === index) setSelected(null);
    else swap(selected, index);
  }

  return <div className="games-app">
    <aside className="games-sidebar">
      <div className="games-side-title">PUZZLE KUCING</div>
      {levels.map((item, index) => <button key={item.image} className={`games-level ${index === levelIndex ? 'current' : ''}`} onClick={() => startLevel(index)} aria-current={index === levelIndex ? 'step' : undefined}>
        <img src={item.image} alt="" />
        <span><b>Level {index + 1}</b><small>{item.title}</small></span>
        {bests[index] && <Check size={14} aria-label="Selesai sebelumnya" />}
      </button>)}
      <div className="games-side-note">Ketuk dua keping untuk menukar posisi. Bisa juga seret keping dengan mouse.</div>
    </aside>
    <main className="games-main">
      <div className="games-heading"><div><small>LEVEL {levelIndex + 1} DARI {levels.length}</small><h2>{level.title}</h2><p>Susun kembali foto kucing ini.</p></div><span className="games-difficulty">{level.columns} × {level.rows}</span></div>
      <div className="games-play-area">
        <div className="games-board-wrap">
          <div className={`games-board ${solved ? 'is-solved' : ''}`} style={{ gridTemplateColumns: `repeat(${level.columns}, 1fr)`, gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))` }} aria-label={`Puzzle ${level.title}, ${level.columns} kali ${level.rows} keping`}>
            {solved ? <img className="games-complete-photo" src={level.image} alt={`Foto lengkap: ${level.title}`} /> : pieces.map((piece, position) => <button
              key={piece}
              type="button"
              className={`games-piece ${selected === position ? 'picked' : ''} ${dragging === position ? 'dragging' : ''}`}
              aria-label={`Keping ${piece + 1}, posisi ${position + 1}${selected === position ? ', dipilih' : ''}`}
              aria-pressed={selected === position}
              onClick={() => choose(position)}
              draggable
              onDragStart={event => { setDragging(position); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(position)); }}
              onDragEnd={() => setDragging(null)}
              onDragOver={event => event.preventDefault()}
              onDrop={event => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(from) && from >= 0 && from < pieces.length) swap(from, position); setDragging(null); }}
              style={{ backgroundImage: `url("${level.image}")`, backgroundSize: `${level.columns * 100}% ${level.rows * 100}%`, backgroundPosition: `${(piece % level.columns) / (level.columns - 1) * 100}% ${Math.floor(piece / level.columns) / (level.rows - 1) * 100}%` }}
            />)}
            {peek && !solved && <img className="games-peek" src={level.image} alt={`Pratinjau foto ${level.title}`} />}
          </div>
        </div>
        <div className="games-panel">
          <div className="games-reference"><img src={level.image} alt={`Foto referensi: ${level.title}`} /><span>FOTO ASLI</span></div>
          <div className="games-stats"><div><small>LANGKAH</small><strong>{moves}</strong></div><div><small>WAKTU</small><strong>{formatTime(seconds)}</strong></div></div>
          {bests[levelIndex] && <div className="games-best"><Trophy size={15} /> Terbaik: {bests[levelIndex].moves} langkah · {formatTime(bests[levelIndex].seconds)}</div>}
          {solved ? <div className="games-success"><strong>Foto tersusun! ✨</strong><span>{moves} langkah dalam {formatTime(seconds)}</span><button onClick={() => startLevel(levelIndex < levels.length - 1 ? levelIndex + 1 : 0)}>{levelIndex < levels.length - 1 ? 'Level berikutnya' : 'Main dari awal'} <ArrowRight size={15} /></button></div> : <div className="games-actions"><button onClick={() => startLevel(levelIndex)}><RotateCcw size={15} /> Acak ulang</button><button onPointerDown={() => setPeek(true)} onPointerUp={() => setPeek(false)} onPointerLeave={() => setPeek(false)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setPeek(true); }} onKeyUp={() => setPeek(false)}><Eye size={15} /> Tahan untuk lihat</button></div>}
        </div>
      </div>
    </main>
  </div>;
}
