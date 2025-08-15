export function generateExam({pool, minutes=45, count=20, mixLevels=true}){
  const qs = [];
  const flat = pool.flatMap(topic=>topic.questions.map(q=>({...q, topic: topic.id})));
  const levels = ['easy','medium','hard'];
  let i=0, tries=0;
  while(qs.length<count && tries<5000){
    let pick;
    if(mixLevels){
      const lv = levels[i%levels.length];
      const candidates = flat.filter(q=>q.level===lv);
      pick = candidates[Math.floor(Math.random()*candidates.length)];
    }else{
      pick = flat[Math.floor(Math.random()*flat.length)];
    }
    if(pick){
      // avoid adjacent duplicates (best effort)
      const key = JSON.stringify({q:pick.question, opts:pick.options});
      if(!qs.find(x=>JSON.stringify({q:x.question, opts:x.options})===key)){
        qs.push({...pick, id:`ex_${i}_${Math.random().toString(36).slice(2,7)}`});
        i++;
      }
    }
    tries++;
  }
  return { id:`exam_${Date.now()}`, minutes, questions: qs };
}

export const EXAM_TEMPLATES = [
  { name: 'Đề 15 phút', minutes: 15, count: 10 },
  { name: 'Đề 45 phút', minutes: 45, count: 25 },
  { name: 'Đề 90 phút', minutes: 90, count: 40 },
];
