const DB_NAME='memory-desktop-archive';
const STORE='records';
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export async function loadRecord<T>(key:string):Promise<T|undefined>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result as T|undefined);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
export async function saveRecord<T>(key:string,value:T):Promise<void>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)})}
