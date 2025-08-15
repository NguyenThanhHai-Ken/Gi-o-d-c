import { load } from './storage'
/** Recommend next topics based on per-topic accuracy */
export function recommendNext(topics){
  const stats = load('topicStats', {});
  const rows = topics.map(t=>{
    const s = stats[t.id] || {done:0, correct:0};
    const acc = s.done? Math.round(100*s.correct/s.done):null;
    return {id:t.id, name:t.name, acc, done:s.done}
  });
  rows.sort((a,b)=> (a.acc??101) - (b.acc??101) || a.done - b.done);
  return rows.slice(0,3);
}
