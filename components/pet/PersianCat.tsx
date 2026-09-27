import { useId, useState } from 'react';
import { stageOf, type PetAnimation, type PetState } from '@/lib/pet-state';

/** Original vector rig: head, eyes, tail and paws animate independently. */
export default function PersianCat({ pet, animation = 'idle', onPet }: { pet: PetState; animation?: PetAnimation; onPet?: () => void }) {
  const id = useId().replace(/:/g, '');
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const sleepy = pet.sleeping || pet.stats.energy < 20;
  const sad = pet.stats.hunger < 25 || pet.stats.happiness < 25;
  const stage = stageOf(pet.xp);
  return <svg className={`persian-cat cat-${animation} ${sleepy ? 'cat-sleepy' : ''} ${sad ? 'cat-sad' : ''} ${stage === 'Anak kucing' ? 'cat-kitten' : stage === 'Remaja' ? 'cat-teen' : 'cat-adult'}`} viewBox="0 0 300 290" role="img" aria-label={`Kucing Persia ${pet.name}, ${stage.toLowerCase()}${pet.sleeping ? ', sedang tidur' : ''}`}
    onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); setGaze({ x: Math.max(-5, Math.min(5, ((e.clientX - r.left) / r.width - .5) * 12)), y: Math.max(-3, Math.min(3, ((e.clientY - r.top) / r.height - .5) * 8)) }); }}
    onPointerLeave={() => setGaze({ x: 0, y: 0 })} onClick={onPet}>
    <defs>
      <radialGradient id={`${id}-fur`} cx="38%" cy="28%" r="80%"><stop stopColor="#fffdf2"/><stop offset=".65" stopColor="#eee1cc"/><stop offset="1" stopColor="#d6c2a5"/></radialGradient>
      <linearGradient id={`${id}-ear`} x2="0" y2="1"><stop stopColor="#e9b0aa"/><stop offset="1" stopColor="#f8d6c6"/></linearGradient>
      <radialGradient id={`${id}-eye`}><stop stopColor="#c1a95d"/><stop offset=".7" stopColor="#a0783c"/><stop offset="1" stopColor="#664d37"/></radialGradient>
    </defs>
    <ellipse cx="150" cy="264" rx="91" ry="12" fill="#765d4720"/>
    <g className="cat-rig">
      <path className="cat-tail" d="M218 224C270 242 287 199 270 170C258 146 237 163 250 185C262 208 245 212 225 201" fill={`url(#${id}-fur)`} stroke="#c5ad92" strokeWidth="3"/>
      <path d="M90 161C61 174 58 202 64 225L56 228L67 238L64 246L80 248C112 274 195 275 223 245L234 245L232 235L241 229L229 223C236 194 223 176 206 164Z" fill={`url(#${id}-fur)`} stroke="#c5ad92" strokeWidth="2.5"/>
      <ellipse cx="147" cy="218" rx="53" ry="41" fill="#fff9ed" opacity=".7"/>
      <g className="cat-paw cat-paw-left"><ellipse cx="101" cy="253" rx="26" ry="13" fill="#eee0cb" stroke="#c5ad92" strokeWidth="2"/><path d="M97 251v7m7-7v7" stroke="#c5ad92" strokeWidth="2" strokeLinecap="round"/></g>
      <g className="cat-paw cat-paw-right"><ellipse cx="196" cy="253" rx="26" ry="13" fill="#eee0cb" stroke="#c5ad92" strokeWidth="2"/><path d="M193 251v7m7-7v7" stroke="#c5ad92" strokeWidth="2" strokeLinecap="round"/></g>
      <g className="cat-head">
        <path d="M67 115L59 48Q60 31 80 44L109 67M192 69L222 44Q240 33 240 52L234 115" fill={`url(#${id}-fur)`} stroke="#c5ad92" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M70 53L78 99L102 77Z M228 55L222 101L200 77Z" fill={`url(#${id}-ear)`}/>
        <path d="M88 69L85 59L107 62L112 52L130 59L143 48L156 57L176 52L181 64L202 61L207 73C236 80 249 99 249 121L257 127L246 134L255 145L242 151L245 165L228 166L222 180L206 179L194 190L179 184L165 194L149 189L135 195L123 187L106 190L96 179L79 180L76 167L61 164L64 151L52 147L59 134L49 127L60 118C58 94 72 79 88 69Z" fill={`url(#${id}-fur)`} stroke="#c5ad92" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M128 72L139 81M151 69L151 79M172 73L163 82" stroke="#d1bfa5" strokeWidth="3" strokeLinecap="round"/>
        <g className="cat-eyes">
          {[110, 191].map(x => <g key={x}><ellipse cx={x} cy="119" rx="22" ry="24" fill="#fffdfa" stroke="#99806a" strokeWidth="2.5"/><ellipse cx={x + gaze.x} cy={119 + gaze.y} rx="17" ry="20" fill={`url(#${id}-eye)`}/><ellipse cx={x + gaze.x} cy={119 + gaze.y} rx="9" ry="17" fill="#302a26"/><circle cx={x - 6 + gaze.x} cy={111 + gaze.y} r="6" fill="white"/><circle cx={x + 5 + gaze.x} cy={129 + gaze.y} r="2.5" fill="#fffc"/></g>)}
        </g>
        <g className="cat-closed-eyes" fill="none" stroke="#775e4f" strokeWidth="4" strokeLinecap="round"><path d="M92 123Q110 136 128 123M173 123Q191 136 209 123"/></g>
        <ellipse cx="105" cy="150" rx="22" ry="9" fill="#ebad9e" opacity=".5"/><ellipse cx="195" cy="150" rx="22" ry="9" fill="#ebad9e" opacity=".5"/>
        <ellipse cx="132" cy="147" rx="23" ry="16" fill="#fff9ee"/><ellipse cx="168" cy="147" rx="23" ry="16" fill="#fff9ee"/>
        <path d="M141 140Q150 136 159 140L150 148Z" fill="#bb8581"/>
        <path className="cat-mouth" d={sad ? 'M150 148v5m-10 6q10-10 20 0' : 'M150 148v5q-6 8-13 1m13-1q6 8 13 1'} fill="none" stroke="#775e4f" strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse className="cat-nom" cx="150" cy="158" rx="9" ry="7" fill="#8b5a50"/>
        <g className="cat-whiskers" stroke="#ac947d" strokeWidth="1.8" strokeLinecap="round"><path d="M115 147L76 139M113 153L73 156M185 147L223 139M187 153L227 156"/></g>
        {pet.accessory === 'crown' && <g className="cat-accessory"><path d="M122 63L113 28L137 43L150 21L164 43L187 28L178 63Z" fill="#f4cf66" stroke="#c59738" strokeWidth="2.5"/><circle cx="150" cy="48" r="5" fill="#e697a4"/></g>}
      </g>
      {pet.accessory === 'bow' && <g className="cat-accessory" fill="#d98da1" stroke="#b66b86" strokeWidth="2"><path d="M145 193Q109 172 118 203Q118 217 145 200M155 193Q191 172 182 203Q182 217 155 200"/><circle cx="150" cy="196" r="7"/></g>}
      {pet.accessory === 'collar' && <g className="cat-accessory"><path d="M106 185Q151 211 196 185" fill="none" stroke="#6da69a" strokeWidth="9"/><circle cx="150" cy="204" r="9" fill="#edca68" stroke="#c59738" strokeWidth="2"/><path d="M150 207v5" stroke="#9d7935" strokeWidth="2"/></g>}
      {pet.stats.hygiene < 30 && <g fill="#9d826e" opacity=".35"><ellipse cx="76" cy="124" rx="10" ry="6"/><ellipse cx="203" cy="215" rx="15" ry="9"/><ellipse cx="120" cy="227" rx="8" ry="5"/></g>}
    </g>
    <g className="cat-hearts" fill="#d67e96"><text x="42" y="85" fontSize="24">♥</text><text x="235" y="68" fontSize="19">♥</text><text x="209" y="34" fontSize="15">♥</text></g>
    <g className="cat-bubbles" fill="#d8f3ffbb" stroke="#fff" strokeWidth="2"><circle cx="72" cy="176" r="19"/><circle cx="210" cy="169" r="24"/><circle cx="169" cy="74" r="17"/><circle cx="115" cy="225" r="15"/><circle cx="244" cy="105" r="10"/></g>
    <g className="cat-zzz" fill="#aba0d1" fontWeight="700"><text x="216" y="70" fontSize="28">z</text><text x="239" y="48" fontSize="20">z</text><text x="259" y="30" fontSize="14">z</text></g>
  </svg>;
}
