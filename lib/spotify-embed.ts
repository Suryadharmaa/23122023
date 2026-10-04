export type SpotifyKind = 'track' | 'album' | 'playlist' | 'artist' | 'show' | 'episode';
export type SpotifyLink = { kind: SpotifyKind; id: string; url: string; embedUrl: string };

const kinds: SpotifyKind[] = ['track', 'album', 'playlist', 'artist', 'show', 'episode'];
export const kindLabels: Record<SpotifyKind, string> = {
  track: 'Lagu', album: 'Album', playlist: 'Playlist', artist: 'Artis', show: 'Podcast', episode: 'Episode',
};

/** Accept only official Spotify entities. Never place an unvalidated pasted URL in an iframe. */
export function parseSpotifyLink(input: string): SpotifyLink | null {
  let candidate = input.trim();
  const iframeSrc = candidate.match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/i);
  if (iframeSrc) candidate = iframeSrc[1].replaceAll('&amp;', '&');

  const uri = candidate.match(/^spotify:(track|album|playlist|artist|show|episode):([A-Za-z0-9]{22})$/i);
  if (uri) {
    const kind = uri[1].toLowerCase() as SpotifyKind;
    const id = uri[2];
    return { kind, id, url: `https://open.spotify.com/${kind}/${id}`, embedUrl: `https://open.spotify.com/embed/${kind}/${id}` };
  }

  let parsed: URL;
  try { parsed = new URL(candidate); } catch { return null; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'open.spotify.com' || parsed.port || parsed.username || parsed.password) return null;
  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments[0]?.startsWith('intl-')) segments.shift();
  if (segments[0] === 'embed') segments.shift();
  if (segments.length !== 2 || !kinds.includes(segments[0] as SpotifyKind) || !/^[A-Za-z0-9]{22}$/.test(segments[1])) return null;
  const [kind, id] = segments as [SpotifyKind, string];
  return { kind, id, url: `https://open.spotify.com/${kind}/${id}`, embedUrl: `https://open.spotify.com/embed/${kind}/${id}` };
}
