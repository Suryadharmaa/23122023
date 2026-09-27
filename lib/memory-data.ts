export type Photo = { id: string; title: string; date: string; place: string; album: string; memoryId: string; tile?: number; url?: string; favorite?: boolean };
export type Memory = { id: string; title: string; date: string; place: string; description: string; photoIds: string[]; tags: string[] };
export type ArchiveFile = { id: string; name: string; kind: 'folder' | 'photo' | 'audio' | 'document'; parent: string; date: string; size: string; photoId?: string; url?: string; favorite?: boolean; trashed?: boolean };
export type Track = { id: string; title: string; artist: string; album: string; duration: number; url?: string; memoryId?: string };

export const demoPhotos: Photo[] = Array.from({length:10},(_,index)=>{
 const number=String(index+1).padStart(2,'0');
 return {id:`personal-${number}`,title:`Photo ${number}`,date:'',place:'',album:'My Photos',memoryId:'personal-collection',url:`${import.meta.env.BASE_URL}assets/personal/photo-${number}.jpeg`,favorite:index===0};
});
export const demoMemories: Memory[] = [
 {id:'personal-collection',title:'My Photos',date:'',place:'',description:'A collection of photos worth keeping.',photoIds:demoPhotos.map(p=>p.id),tags:[]},
];
export const demoTracks: Track[] = [
 {id:'track-about-you',title:'About You',artist:'The 1975',album:'Imports',duration:326,url:`${import.meta.env.BASE_URL}music/the-1975-about-you.mp3`},
 {id:'track-akad',title:'Akad',artist:'Payung Teduh',album:'Imports',duration:262,url:`${import.meta.env.BASE_URL}music/payung-teduh-akad.mp3`},
 {id:'track-untukku',title:'Untukku',artist:'Chrisye',album:'Imports',duration:275,url:`${import.meta.env.BASE_URL}music/chrisye-untukku.mp3`},
];
export const demoFiles: ArchiveFile[] = [
 {id:'memories',name:'Memories',kind:'folder',parent:'root',date:'',size:'1 collection'},
 {id:'photos',name:'Photos',kind:'folder',parent:'root',date:'',size:'10 items'},
 {id:'music',name:'Music',kind:'folder',parent:'root',date:'',size:'3 items'},
 {id:'letters',name:'Letters',kind:'folder',parent:'root',date:'',size:'1 item'},
 {id:'personal-collection',name:'My Photos',kind:'folder',parent:'memories',date:'',size:'10 photos'},
 ...demoPhotos.map(p=>({id:p.id,name:`${p.title}.jpeg`,kind:'photo' as const,parent:'photos',date:'',size:'Photo',photoId:p.id})),
 ...demoTracks.map(t=>({id:t.id,name:`${t.title}.mp3`,kind:'audio' as const,parent:'music',date:'',size:'Built-in MP3'})),
 {id:'letter-1',name:'A note to remember.txt',kind:'document',parent:'letters',date:'',size:'1 KB'},
];
export const wallpapers = [
 {id:'sonoma',name:'Sonoma Hills',style:`url(${import.meta.env.BASE_URL}assets/sonoma-inspired.png)`},
 {id:'evening',name:'Evening Glow',style:'linear-gradient(130deg,#192755 0%,#575aa5 30%,#d890a4 58%,#f6b76c 78%,#725942 100%)'},
 {id:'coast',name:'Coastal Blue',style:'radial-gradient(ellipse at 25% 25%,#89c7d9 0%,#3d82aa 34%,#164773 67%,#092945 100%)'},
 {id:'forest',name:'Deep Forest',style:'radial-gradient(ellipse at 20% 90%,#93ab62 0%,#376950 38%,#153a40 75%,#17253d 100%)'},
 {id:'dusk',name:'Purple Dusk',style:'linear-gradient(145deg,#1e214e 0%,#64518f 38%,#bb77a0 70%,#efb07d 100%)'},
 {id:'night',name:'Midnight',style:'radial-gradient(ellipse at 70% 20%,#354878 0%,#152448 45%,#0b142b 100%)'},
];
