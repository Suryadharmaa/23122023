import { useCallback, useEffect, useRef, useState } from 'react';
import { advancePet, careFor, newPet, PET_STORAGE, restorePet, rewardGame, type PetAction, type PetAnimation, type PetState } from '@/lib/pet-state';

export function usePet() {
  const [pet, setPet] = useState<PetState>(() => newPet());
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [animation, setAnimation] = useState<PetAnimation>('idle');
  const [animationItem, setAnimationItem] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState('Halo! Aku Mochi. Elus pipiku, yuk.');
  const ref = useRef(pet);
  const active = useRef(true);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commit = useCallback((next: PetState) => { ref.current = next; setPet(next); }, []);
  const save = useCallback((next: PetState) => {
    try { localStorage.setItem(PET_STORAGE, JSON.stringify(next)); setStorageOk(true); }
    catch { setStorageOk(false); }
  }, []);
  useEffect(() => {
    let next = newPet();
    try {
      const stored = localStorage.getItem(PET_STORAGE);
      if (stored) next = restorePet(JSON.parse(stored));
    } catch { setStorageOk(false); }
    commit(next); save(next); setMessage(`Halo! Aku ${next.name}. Elus pipiku, yuk.`); setReady(true); active.current = !document.hidden;
    const tick = () => { const next = advancePet(ref.current, Date.now(), active.current); commit(next); save(next); };
    const visibility = () => { tick(); active.current = !document.hidden; };
    const timer = window.setInterval(tick, 5000);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', tick);
    return () => { clearInterval(timer); clearTimeout(reactionTimer.current); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', tick); };
  }, [commit, save]);
  const respond = useCallback((result: ReturnType<typeof careFor>) => {
    commit(result.pet); save(result.pet); setMessage(result.message);
    if (result.animation) {
      setAnimation(result.animation); clearTimeout(reactionTimer.current);
      reactionTimer.current = setTimeout(() => setAnimation('idle'), 3200);
    }
  }, [commit, save]);
  const act = useCallback((action: PetAction, item?: string) => {
    const result = careFor(advancePet(ref.current, Date.now(), active.current), action, item);
    if (result.animation) setAnimationItem(item);
    respond(result);
  }, [respond]);
  const reward = useCallback((score: number) => respond(rewardGame(ref.current, score)), [respond]);
  const rename = useCallback((name: string) => { const next = { ...ref.current, name: name.trim().slice(0, 20) || 'Mochi' }; commit(next); save(next); setMessage(`Hai! Sekarang panggil aku ${next.name}.`); }, [commit, save]);
  const toggleCompanion = useCallback(() => { const next = { ...ref.current, companion: !ref.current.companion }; commit(next); save(next); }, [commit, save]);
  const restore = useCallback((value: unknown) => { const next = restorePet(value); commit(next); save(next); setAnimation('idle'); setMessage('Progres pet berhasil dipulihkan.'); }, [commit, save]);
  return { pet, ready, storageOk, message, animationItem, animation: pet.sleeping ? 'sleep' as const : animation, act, reward, rename, toggleCompanion, restore };
}
export type PetController = ReturnType<typeof usePet>;
