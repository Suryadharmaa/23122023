export type Need = 'hunger' | 'happiness' | 'energy' | 'hygiene';
export type FoodId = 'kibble' | 'fish' | 'chicken';
export type Accessory = 'none' | 'bow' | 'collar' | 'crown';
export type PetAction = 'pet' | 'feed' | 'wash' | 'sleep' | 'play' | 'buy-food' | 'buy-accessory' | 'equip';
export type PetAnimation = 'idle' | 'pet' | 'eat' | 'wash' | 'play' | 'sleep' | 'walk';
export type PetState = {
  version: 1; name: string; stats: Record<Need, number>; coins: number; xp: number;
  sleeping: boolean; inventory: Record<FoodId, number>; owned: Accessory[];
  accessory: Accessory; companion: boolean; lastSeen: number;
  lastCare: Partial<Record<PetAction, number>>;
};
export const PET_STORAGE = 'memory-desktop-persian-pet-v1';
export const foods: { id: FoodId; name: string; icon: string; price: number; nutrition: number }[] = [
  { id: 'kibble', name: 'Biskuit', icon: '🥣', price: 5, nutrition: 18 },
  { id: 'fish', name: 'Ikan', icon: '🐟', price: 12, nutrition: 32 },
  { id: 'chicken', name: 'Ayam', icon: '🍗', price: 18, nutrition: 42 },
];
export const accessories: { id: Accessory; name: string; icon: string; price: number; level: number }[] = [
  { id: 'none', name: 'Tanpa aksesori', icon: '🐱', price: 0, level: 1 },
  { id: 'bow', name: 'Pita stroberi', icon: '🎀', price: 45, level: 2 },
  { id: 'collar', name: 'Kalung lonceng', icon: '🔔', price: 70, level: 4 },
  { id: 'crown', name: 'Mahkota kecil', icon: '👑', price: 120, level: 6 },
];
export const clamp = (n: number) => Math.max(0, Math.min(100, n));
export const levelOf = (xp: number) => Math.floor(Math.sqrt(Math.max(0, xp) / 60)) + 1;
export const stageOf = (xp: number) => levelOf(xp) < 4 ? 'Anak kucing' : levelOf(xp) < 8 ? 'Remaja' : 'Dewasa';
export function newPet(now = Date.now()): PetState {
  return { version: 1, name: 'Mochi', stats: { hunger: 80, happiness: 85, energy: 80, hygiene: 90 }, coins: 100, xp: 0, sleeping: false, inventory: { kibble: 3, fish: 2, chicken: 1 }, owned: ['none'], accessory: 'none', companion: true, lastSeen: now, lastCare: {} };
}
/** Only elapsed time is simulated; a closed tab does not run timers. Offline needs
 * decline at one tenth the active rate, for at most twelve hours per absence. */
export function advancePet(pet: PetState, now: number, active: boolean): PetState {
  const minutes = Math.min(active ? 1440 : 720, Math.max(0, now - pet.lastSeen) / 60000);
  const rate = active ? 1 : 0.1;
  const stats = { ...pet.stats };
  stats.hunger = clamp(stats.hunger - minutes * (pet.sleeping ? 0.3 : 0.7) * rate);
  stats.happiness = clamp(stats.happiness - minutes * (pet.sleeping ? 0.2 : 0.55) * rate);
  stats.hygiene = clamp(stats.hygiene - minutes * 0.45 * rate);
  stats.energy = clamp(stats.energy + minutes * (pet.sleeping ? (active ? 4 : 0.4) : -0.5 * rate));
  return { ...pet, stats, lastSeen: now };
}
export function restorePet(value: unknown, now = Date.now()): PetState {
  const base = newPet(now);
  if (!value || typeof value !== 'object') return base;
  const v = value as Partial<PetState>;
  if (v.version !== 1) return base;
  const number = (n: unknown, fallback: number) => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  const stats = Object.fromEntries(Object.entries(base.stats).map(([k, n]) => [k, clamp(number(v.stats?.[k as Need], n))])) as PetState['stats'];
  const owned = accessories.map(a => a.id).filter(id => id === 'none' || (Array.isArray(v.owned) && v.owned.includes(id)));
  const inventory = Object.fromEntries(foods.map(f => [f.id, Math.max(0, Math.floor(number(v.inventory?.[f.id], base.inventory[f.id])))])) as PetState['inventory'];
  const lastCare: PetState['lastCare'] = {};
  for (const action of ['pet', 'feed', 'wash', 'play'] as PetAction[]) {
    if (typeof v.lastCare?.[action] === 'number') lastCare[action] = Math.min(now, Math.max(0, number(v.lastCare[action], 0)));
  }
  return advancePet({ ...base, name: typeof v.name === 'string' && v.name.trim() ? v.name.trim().slice(0, 20) : base.name, stats, coins: Math.max(0, Math.floor(number(v.coins, base.coins))), xp: Math.max(0, number(v.xp, 0)), inventory, owned, accessory: owned.includes(v.accessory as Accessory) ? v.accessory! : 'none', sleeping: v.sleeping === true, companion: v.companion !== false, lastSeen: Math.min(now, Math.max(0, number(v.lastSeen, now))), lastCare }, now, false);
}
export type ActionResult = { pet: PetState; message: string; animation?: PetAnimation };
export function careFor(p: PetState, action: PetAction, item?: string, now = Date.now()): ActionResult {
  const reject = (message: string): ActionResult => ({ pet: p, message });
  if (action === 'sleep') return { pet: { ...p, sleeping: !p.sleeping }, message: p.sleeping ? 'Selamat pagi! Siap main lagi?' : 'Lampu redup. Selamat tidur, kucing kecil.', animation: p.sleeping ? 'idle' : 'sleep' };
  if (action === 'buy-food') {
    const f = foods.find(f => f.id === item);
    if (!f) return reject('Pilih makanan terlebih dahulu.');
    if (p.coins < f.price) return reject('Koin belum cukup. Main minigame untuk mendapat koin.');
    return { pet: { ...p, coins: p.coins - f.price, inventory: { ...p.inventory, [f.id]: p.inventory[f.id] + 1 } }, message: `${f.name} masuk ke persediaan!` };
  }
  if (action === 'buy-accessory' || action === 'equip') {
    const a = accessories.find(a => a.id === item);
    if (!a) return reject('Pilih aksesori terlebih dahulu.');
    if (p.owned.includes(a.id)) return { pet: { ...p, accessory: a.id }, message: a.id === 'none' ? 'Tampil fluffy alami.' : `${a.name} dipakai!`, animation: 'pet' };
    if (action === 'equip') return reject('Aksesori ini belum dimiliki.');
    if (levelOf(p.xp) < a.level) return reject(`Aksesori terbuka di level ${a.level}.`);
    if (p.coins < a.price) return reject('Koin belum cukup untuk aksesori ini.');
    return { pet: { ...p, coins: p.coins - a.price, owned: [...p.owned, a.id], accessory: a.id }, message: `${a.name} dibeli dan dipakai!`, animation: 'pet' };
  }
  if (p.sleeping) return reject('Sedang tidur. Bangunkan dulu untuk merawat atau bermain.');
  const cooldown: Partial<Record<PetAction, number>> = { pet: 12000, feed: 8000, wash: 12000, play: 8000 };
  if (now - (p.lastCare[action] ?? -Infinity) < (cooldown[action] ?? 0)) return reject(`Tunggu sebentar, biarkan ${p.name} menikmati aktivitasnya.`);
  const updated = { ...p, stats: { ...p.stats }, inventory: { ...p.inventory }, lastCare: { ...p.lastCare, [action]: now } };
  if (action === 'feed') {
    if (p.stats.hunger > 94) return reject('Perutnya masih kenyang. Coba main atau istirahat dulu.');
    const f = foods.find(f => f.id === item);
    if (item !== 'free' && (!f || p.inventory[f.id] < 1)) return reject('Makanan habis. Ada camilan gratis atau makanan di toko.');
    if (f) updated.inventory[f.id]--;
    updated.stats.hunger = clamp(p.stats.hunger + (f?.nutrition ?? 12));
    updated.stats.hygiene = clamp(p.stats.hygiene - 4);
    updated.xp += 15;
    return { pet: updated, message: 'Nyam nyam… perut kenyang, hati senang!', animation: 'eat' };
  }
  if (action === 'wash') {
    if (p.stats.hygiene > 94) return reject('Bulunya masih bersih dan wangi.');
    updated.stats.hygiene = clamp(p.stats.hygiene + 35);
    updated.stats.happiness = clamp(p.stats.happiness + 4);
    updated.xp += 20;
    return { pet: updated, message: 'Busa, bilas, lalu fluffy lagi!', animation: 'wash' };
  }
  if (action === 'play') {
    if (p.stats.energy < 10) return reject('Terlalu mengantuk untuk bermain. Yuk tidur dulu.');
    updated.stats.happiness = clamp(p.stats.happiness + 14);
    updated.stats.energy = clamp(p.stats.energy - 5);
    updated.stats.hunger = clamp(p.stats.hunger - 3);
    updated.stats.hygiene = clamp(p.stats.hygiene - 2);
    updated.xp += 10;
    return { pet: updated, message: item === 'feather' ? 'Bulu itu bikin penasaran! Tangkap!' : 'Bola kecil, lompatan besar!', animation: 'play' };
  }
  if (p.stats.happiness > 97) return { pet: p, message: 'Prrr… senang sekali ditemani.', animation: 'pet' };
  updated.stats.happiness = clamp(p.stats.happiness + 6);
  updated.xp += 4;
  return { pet: updated, message: 'Prrr… elus pipi gembulnya lagi nanti.', animation: 'pet' };
}
export function rewardGame(p: PetState, score: number): ActionResult {
  const reward = Math.max(0, Math.min(45, Math.floor(score)));
  if (!reward) return { pet: p, message: 'Belum ada koin kali ini. Coba lagi!' };
  return { pet: { ...p, coins: p.coins + reward, xp: p.xp + reward, stats: { ...p.stats, happiness: clamp(p.stats.happiness + 15), energy: clamp(p.stats.energy - 8), hunger: clamp(p.stats.hunger - 4), hygiene: clamp(p.stats.hygiene - 3) } }, message: `Hebat! +${reward} koin dan +${reward} XP.`, animation: 'play' };
}
