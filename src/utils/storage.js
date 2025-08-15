export const save = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
export const load = (k,def=null)=>{
  try{const v=JSON.parse(localStorage.getItem(k)); return v ?? def}catch{ return def }
};
export const pushHistory=(entry)=>{
  const list = load('history', []);
  list.unshift({...entry, ts: Date.now()});
  save('history', list.slice(0,200));
};
