'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ExternalLink, Link2, ListMusic, Plus, Trash2 } from 'lucide-react';
import { kindLabels, parseSpotifyLink, type SpotifyKind } from '@/lib/spotify-embed';
import './spotify.css';

type SavedLink = { key: string; kind: SpotifyKind; id: string; label: string; url: string; embedUrl: string };
const storageKey = 'memory-desktop-spotify-links-v1';

function SpotifyMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="#1db954"/>
    <path d="M7 12c6-2 13-1 19 2M8 17c5-2 11-1 16 2M10 22c4-1 9 0 12 2" stroke="#101810" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>;
}

export default function SpotifyApp() {
  const [ready, setReady] = useState(false);
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) {
        const valid: SavedLink[] = saved.slice(0, 100).flatMap(item => {
          const parsed = typeof item?.url === 'string' ? parseSpotifyLink(item.url) : null;
          return parsed ? [{ ...parsed, key: `${parsed.kind}:${parsed.id}`, label: typeof item.label === 'string' ? item.label.slice(0, 60) : kindLabels[parsed.kind] }] : [];
        });
        setLinks(valid);
        setSelected(valid[0]?.key ?? null);
      }
    } catch { /* An unreadable old list starts empty. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(links)); }
    catch { setError('Browser tidak dapat menyimpan daftar tautan ini.'); }
  }, [links, ready]);

  function addLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseSpotifyLink(input);
    if (!parsed) { setError('Tempel tautan open.spotify.com, Spotify URI, atau kode embed yang valid.'); return; }
    const key = `${parsed.kind}:${parsed.id}`;
    const existing = links.find(item => item.key === key);
    const named = label.trim().slice(0, 60);
    const next: SavedLink = { ...parsed, key, label: named || existing?.label || kindLabels[parsed.kind] };
    setLinks(current => [next, ...current.filter(item => item.key !== key)].slice(0, 100));
    setSelected(key); setInput(''); setLabel(''); setError('');
  }

  function removeLink(key: string) {
    const remaining = links.filter(item => item.key !== key);
    setLinks(remaining);
    if (selected === key) setSelected(remaining[0]?.key ?? null);
  }

  const current = links.find(item => item.key === selected);
  return <div className="spotify-app">
    <aside className="spotify-sidebar">
      <div className="spotify-brand"><SpotifyMark/><span>Spotify</span></div>
      <div className="spotify-library-label"><ListMusic size={15}/> Tautan tersimpan <span>{links.length}</span></div>
      <div className="spotify-library">{links.map(item => <div key={item.key} className={`spotify-library-item ${selected === item.key ? 'selected' : ''}`}>
        <button onClick={() => setSelected(item.key)} aria-current={selected === item.key ? 'page' : undefined}><span className="spotify-list-art">♫</span><span className="spotify-list-text"><b>{item.label}</b><small>{kindLabels[item.kind]}</small></span></button>
        <button className="spotify-remove" title={`Hapus ${item.label}`} aria-label={`Hapus ${item.label}`} onClick={() => removeLink(item.key)}><Trash2 size={14}/></button>
      </div>)}</div>
      <p className="spotify-local-note">Daftar tautan tersimpan di browser ini.</p>
    </aside>
    <main className="spotify-main">
      <div className="spotify-heading"><small>SPOTIFY DI MEMORY DESKTOP</small><h2>{current ? current.label : 'Musikmu, di desktop ini.'}</h2><p>Putar tautan Spotify melalui pemutar resminya di jendela ini.</p></div>
      <div className="spotify-service-row"><span>Sudah punya akun Spotify? Masuk langsung melalui Spotify jika pemutar memintanya.</span><a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Buka Spotify <ExternalLink size={14}/></a></div>
      <form className="spotify-add" onSubmit={addLink}><label htmlFor="spotify-link"><Link2 size={16}/> Tautan Spotify</label><div className="spotify-input-row"><input id="spotify-link" type="text" inputMode="url" autoComplete="off" value={input} onChange={e => { setInput(e.target.value); if (error) setError(''); }} placeholder="https://open.spotify.com/playlist/..."/><button type="submit"><Plus size={16}/> Tambah</button></div><input className="spotify-label-input" type="text" maxLength={60} value={label} onChange={e => setLabel(e.target.value)} placeholder="Nama di daftar (opsional)" aria-label="Nama di daftar (opsional)"/>{error && <p className="spotify-error" role="alert">{error}</p>}</form>
      {current ? <section className="spotify-player-panel"><div className="spotify-player-head"><div><span className="spotify-playing-dot"/><span>{kindLabels[current.kind]} · {current.label}</span></div><a href={current.url} target="_blank" rel="noopener noreferrer">Buka di Spotify <ExternalLink size={14}/></a></div><iframe key={current.key} title={`Pemutar Spotify: ${current.label}`} src={current.embedUrl} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen loading="eager" width="100%" height="100%"/></section> : <div className="spotify-empty"><SpotifyMark size={56}/><h3>Mulai dari tautan favoritmu</h3><p>Di Spotify, pilih Bagikan → Salin tautan, lalu tempel di atas. Tautan lagu, album, playlist, artis, dan podcast didukung.</p></div>}
      <p className="spotify-footnote">Pemutaran mengikuti akun, browser, dan aturan Spotify. Pada beberapa kondisi, Spotify hanya menyediakan cuplikan lagu.</p>
    </main>
  </div>;
}
