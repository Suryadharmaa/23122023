import { useEffect, useRef, useState } from 'react';
import { Home, Utensils, Droplets, Moon, Gamepad2, ShoppingBag, Coins, PawPrint } from 'lucide-react';
import { accessories, foods, levelOf, stageOf, type Need } from '@/lib/pet-state';
import type { PetController } from '@/hooks/use-pet';
import PersianCat from './PersianCat';
import { CatchGame, MemoryGame } from './PetGames';
import './pet.css';

const needs: { id: Need; label: string; icon: string; color: string }[] = [
  { id: 'hunger', label: 'Kenyang', icon: '🥣', color: '#d6a15b' },
  { id: 'happiness', label: 'Bahagia', icon: '💗', color: '#cb8299' },
  { id: 'energy', label: 'Energi', icon: '🌙', color: '#a18ac8' },
  { id: 'hygiene', label: 'Bersih', icon: '🫧', color: '#6faeae' },
];
const rooms = [
  { id: 'home', label: 'Ruang santai', Icon: Home }, { id: 'kitchen', label: 'Dapur', Icon: Utensils },
  { id: 'bath', label: 'Kamar mandi', Icon: Droplets }, { id: 'bed', label: 'Kamar tidur', Icon: Moon },
  { id: 'play', label: 'Ruang bermain', Icon: Gamepad2 }, { id: 'shop', label: 'Toko kecil', Icon: ShoppingBag },
] as const;
type Room = typeof rooms[number]['id'];

export default function PetApp({ controller: c }: { controller: PetController }) {
  const { pet } = c;
  const [room, setRoom] = useState<Room>('home');
  const [name, setName] = useState(pet.name);
  const [game, setGame] = useState<'catch' | 'memory' | null>(null);
  const [dragging, setDragging] = useState(false);
  const [toy, setToy] = useState<'ball' | 'feather' | null>(null);
  const [toyPoint, setToyPoint] = useState({ x: 70, y: 58 });
  const toyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => setName(pet.name), [pet.name]);
  useEffect(() => () => clearTimeout(toyTimer.current), []);
  const level = levelOf(pet.xp);
  const prevXP = 60 * (level - 1) ** 2;
  const nextXP = 60 * level ** 2;
  const xpProgress = (pet.xp - prevXP) / (nextXP - prevXP) * 100;
  const roomInfo = rooms.find(r => r.id === room)!;
  const lowNeed = needs.find(n => pet.stats[n.id] < 25);
  function showToy(type: 'ball' | 'feather') {
    if (pet.sleeping || pet.stats.energy < 10) { c.act('play', type); return; }
    c.act('play', type); setToy(type); clearTimeout(toyTimer.current); toyTimer.current = setTimeout(() => setToy(null), 3200);
  }
  return <div className="pet-app">
    <aside className="pet-sidebar"><div className="pet-brand"><span>🐾</span><div><b>Mochi & you</b><small>A little fluffy life</small></div></div>
      <div className="pet-nav-label">RUMAH KECIL</div>{rooms.map(({ id, label, Icon }) => <button key={id} className={`pet-room-button ${room === id ? 'selected' : ''}`} onClick={() => { setRoom(id); setGame(null); setToy(null); }}><Icon size={17}/>{label}</button>)}
      <div className="pet-sidebar-bottom"><label><input type="checkbox" checked={pet.companion} onChange={c.toggleCompanion}/> Teman di desktop</label><p>Kebutuhan tetap turun saat kamu pergi, tetapi 10× lebih pelan. Tidur memulihkan energi.</p><small>{c.storageOk ? '● Progres tersimpan di browser ini' : 'Penyimpanan browser tidak tersedia; progres hanya untuk sesi ini.'}</small></div>
    </aside>
    <main className="pet-main">
      <header className="pet-header"><div><small>MY FLUFFY COMPANION</small><label><input aria-label="Nama kucing" maxLength={20} value={name} onChange={e => setName(e.target.value)} onBlur={() => c.rename(name)} onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}/><span>✎</span></label><p>Persia gembul · {stageOf(pet.xp)}</p></div><div className="pet-level"><span><Coins size={17}/>{pet.coins}</span><b>Level {level}</b><div className="pet-xp-track" role="progressbar" aria-label="Progres level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(xpProgress)}><i style={{ width: `${xpProgress}%` }}/></div><small>{Math.floor(pet.xp - prevXP)} / {nextXP - prevXP} XP</small></div></header>
      <div className="pet-needs">{needs.map(n => <div key={n.id} className={`pet-need ${pet.stats[n.id] < 25 ? 'low' : ''}`}><span>{n.icon} {n.label}<b>{Math.round(pet.stats[n.id])}%</b></span><div role="progressbar" aria-label={n.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pet.stats[n.id])}><i style={{ width: `${pet.stats[n.id]}%`, background: n.color }}/></div></div>)}</div>
      {!c.ready ? <p>Menyiapkan rumah Mochi…</p> : <>
        {room === 'shop' ? <section className="pet-shop"><div className="pet-section-heading"><h3>Toko kecil</h3><p>Makanan untuk perutnya. Aksesori untuk gaya fluffy-nya.</p></div><h4>Makanan</h4><div className="pet-shop-grid">{foods.map(f => <article key={f.id}><span>{f.icon}</span><h4>{f.name}</h4><p>+{f.nutrition} kenyang · stok {pet.inventory[f.id]}</p><button disabled={pet.coins < f.price} onClick={() => c.act('buy-food', f.id)}>{f.price} koin · Beli</button></article>)}</div><h4>Aksesori</h4><div className="pet-shop-grid">{accessories.map(a => { const owned = pet.owned.includes(a.id); return <article key={a.id}><span>{a.icon}</span><h4>{a.name}</h4><p>{owned ? 'Sudah dimiliki' : `Terbuka di level ${a.level}`}</p><button disabled={pet.accessory === a.id || (!owned && (level < a.level || pet.coins < a.price))} onClick={() => c.act(owned ? 'equip' : 'buy-accessory', a.id)}>{pet.accessory === a.id ? 'Dipakai' : owned ? 'Pakai' : `${a.price} koin · Beli`}</button></article>; })}</div><p className="pet-help">Anak kucing tumbuh menjadi remaja di level 4 dan dewasa di level 8.</p></section> : room === 'play' && game ? <><button className="pet-back" onClick={() => setGame(null)}>← Kembali ke ruang bermain</button>{game === 'catch' ? <CatchGame disabled={pet.sleeping || pet.stats.energy < 10} onReward={c.reward}/> : <MemoryGame disabled={pet.sleeping || pet.stats.energy < 10} onReward={c.reward}/>}</> : <>
          <div className={`pet-scene pet-room-${room} ${pet.sleeping ? 'lights-out' : ''} ${dragging ? 'drop-ready' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); const food = e.dataTransfer.getData('text/mochi-food'); if (foods.some(f => f.id === food)) c.act('feed', food); }} onPointerMove={e => { if (!toy) return; const r = e.currentTarget.getBoundingClientRect(); setToyPoint({ x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }); }}>
            <span className="pet-room-caption">{roomInfo.label}</span><div className="pet-room-window"><i/><i/></div><div className="pet-room-plant">🌿</div><div className="pet-rug"/>
            {room === 'bed' && <div className="pet-cushion"/>}{room === 'bath' && <div className="pet-bathtub"/>}
            <div className="pet-scene-cat" role="button" tabIndex={0} aria-label={`Elus ${pet.name}`} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.act('pet'); } }}><PersianCat pet={pet} animation={c.animation} onPet={() => c.act('pet')}/></div>
            {c.animation === 'eat' && <span className="pet-food-nom">{foods.find(f => f.id === c.animationItem)?.icon ?? String.fromCodePoint(0x1f36a)}</span>}{toy && <button className={`pet-toy toy-${toy}`} style={{ left: `${toyPoint.x}%`, top: `${toyPoint.y}%` }} aria-label={toy === 'ball' ? 'Lempar bola lagi' : 'Gerakkan bulu'} onClick={() => showToy(toy)}>{toy === 'ball' ? '🧶' : '🪶'}</button>}
            {dragging && <span className="pet-drop-hint">Lepaskan makanan di sini</span>}
          </div>
          <div className="pet-room-actions">
            {room === 'home' && <><h3>Waktu bersama {pet.name}</h3><p>{pet.sleeping ? 'Ssst… sedang mimpi mengejar kupu-kupu.' : lowNeed ? `${lowNeed.label} sedang rendah. Yuk rawat dulu.` : 'Elus pipi, lihat matanya mengikuti kursor, dan temani hari kecilnya.'}</p><div className="pet-action-row"><button onClick={() => c.act('pet')} disabled={pet.sleeping}>♡ Elus</button><button onClick={() => { setRoom('play'); showToy('ball'); }} disabled={pet.sleeping}>🧶 Lempar bola</button><button onClick={() => setRoom('kitchen')}>🥣 Beri makan</button><button onClick={() => setRoom('bed')}>🌙 Istirahat</button></div></>}
            {room === 'kitchen' && <><h3>Menu hari ini</h3><p>Klik makanan atau seret ke kucing. Makan menambah kenyang dan membuat sedikit kotor.</p><div className="pet-foods">{foods.map(f => <button key={f.id} draggable={!pet.sleeping && pet.inventory[f.id] > 0} onDragStart={e => e.dataTransfer.setData('text/mochi-food', f.id)} disabled={pet.sleeping || pet.inventory[f.id] === 0} onClick={() => c.act('feed', f.id)}><span>{f.icon}</span><b>{f.name}</b><small>Stok {pet.inventory[f.id]} · +{f.nutrition}</small></button>)}<button disabled={pet.sleeping} onClick={() => c.act('feed', 'free')}><span>🍪</span><b>Camilan gratis</b><small>Selalu tersedia · +12</small></button></div></>}
            {room === 'bath' && <><h3>Mandi busa</h3><p>Bulunya gembul lagi setelah mandi. Klik untuk menyabuni dan membilas.</p><button className="pet-primary" disabled={pet.sleeping} onClick={() => c.act('wash')}>🫧 Mandikan · +35 kebersihan</button></>}
            {room === 'bed' && <><h3>{pet.sleeping ? 'Mimpi yang lembut' : 'Sudah waktunya istirahat?'}</h3><p>Energi naik selama tidur, termasuk ketika web ditutup. Bangunkan untuk bermain lagi.</p><button className="pet-primary" onClick={() => c.act('sleep')}>{pet.sleeping ? '☀ Bangunkan' : '🌙 Matikan lampu & tidur'}</button></>}
            {room === 'play' && <><h3>Hari ini mau main apa?</h3><div className="pet-action-row"><button disabled={pet.sleeping || pet.stats.energy < 10} onClick={() => showToy('ball')}>🧶 Lempar bola</button><button disabled={pet.sleeping || pet.stats.energy < 10} onClick={() => showToy('feather')}>🪶 Main bulu</button></div><div className="pet-game-choices"><button disabled={pet.sleeping || pet.stats.energy < 10} onClick={() => setGame('catch')}><span>⭐</span><div><b>Tangkap bintang</b><small>Refleks cepat · 25 detik</small></div><em>→</em></button><button disabled={pet.sleeping || pet.stats.energy < 10} onClick={() => setGame('memory')}><span>🧠</span><div><b>Pasangan Mochi</b><small>4 pasangan · 45 detik</small></div><em>→</em></button></div></>}
          </div>
        </>}
        <div className="pet-message" role="status" aria-live="polite"><PawPrint size={15}/>{c.message}</div>
      </>}
    </main>
  </div>;
}

export function DesktopPet({ controller: c, onOpen }: { controller: PetController; onOpen: () => void }) {
  const [x, setX] = useState(0);
  const [walking, setWalking] = useState(false);
  const [direction, setDirection] = useState(1);
  const xRef = useRef(0);
  const hovering = useRef(false);
  const dragging = useRef<{ x: number; start: number } | null>(null);
  const moved = useRef(false);
  const walkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    function resize() { const next = Math.min(Math.max(0, window.innerWidth - 170), xRef.current || window.innerWidth * .73); xRef.current = next; setX(next); }
    resize(); window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); clearTimeout(walkTimer.current); };
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (c.pet.sleeping || hovering.current || dragging.current) return;
      const next = Math.max(0, Math.min(window.innerWidth - 160, xRef.current + (Math.random() - .5) * 400));
      setDirection(next >= xRef.current ? 1 : -1); xRef.current = next; setX(next); setWalking(true);
      clearTimeout(walkTimer.current); walkTimer.current = setTimeout(() => setWalking(false), 3300);
    }, 14000);
    return () => clearInterval(timer);
  }, [c.pet.sleeping]);
  if (!c.ready || !c.pet.companion) return null;
  return <div className={`desktop-pet ${walking ? 'walking' : ''}`} style={{ left: x }} onMouseEnter={() => { hovering.current = true; }} onMouseLeave={() => { hovering.current = false; }} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onOpen(); }}>
    <div className="desktop-pet-menu"><button title="Buka rumah pet" onClick={onOpen}>🐾 Rumah</button><button title={c.pet.sleeping ? 'Bangunkan' : 'Tidurkan'} onClick={() => c.act('sleep')}>{c.pet.sleeping ? '☀' : '🌙'}</button><button title="Beri camilan" disabled={c.pet.sleeping} onClick={() => c.act('feed', 'free')}>🍪</button></div>
    <button className="desktop-cat-button" aria-label={`Elus ${c.pet.name}; klik dua kali untuk membuka Pet. Bisa diseret.`} onDoubleClick={onOpen} onClick={() => { if (!moved.current) c.act('pet'); }} onPointerDown={e => { if (e.button !== 0) return; const currentX = e.currentTarget.closest('.desktop-pet')!.getBoundingClientRect().left; xRef.current = currentX; setX(currentX); dragging.current = { x: e.clientX, start: currentX }; moved.current = false; e.currentTarget.setPointerCapture(e.pointerId); setWalking(false); }} onPointerMove={e => { if (!dragging.current) return; const dx = e.clientX - dragging.current.x; if (Math.abs(dx) > 5) moved.current = true; const next = Math.max(0, Math.min(window.innerWidth - 160, dragging.current.start + dx)); xRef.current = next; setX(next); }} onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}>
      <span style={{ display: 'block', transform: walking && direction === -1 ? 'scaleX(-1)' : undefined }}><PersianCat pet={c.pet} animation={c.pet.sleeping ? 'sleep' : walking ? 'walk' : c.animation}/></span>
    </button><button className="desktop-pet-name" onClick={onOpen}>{c.pet.name} <small>Lv {levelOf(c.pet.xp)}</small></button>
  </div>;
}
