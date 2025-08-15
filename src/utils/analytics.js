import { load, save } from './storage'
import { pushAnalytics } from './cloudStore'

export function logEvent(name, payload={}){
  const ev = {name, payload, ts: Date.now()};
  const arr = load('analytics', []); arr.push(ev); save('analytics', arr.slice(-500));
}

export async function flushAnalytics(uid){
  try{ const arr = load('analytics', []); if(arr.length===0) return; const res = await pushAnalytics(uid, arr); if(res.ok) save('analytics', []); }
  catch(e){ console.error('Flush analytics error', e); }
}
