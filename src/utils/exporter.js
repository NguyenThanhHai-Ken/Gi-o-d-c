export function toCSV(rows, filename='export.csv'){
  if(!rows || rows.length===0){
    const blob = new Blob([''], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach(r=>{
    const row = headers.map(h=>{
      let v = r[h];
      if(v===null || v===undefined) return '';
      const s = String(v).replace(/"/g,'""');
      return '"'+s+'"';
    }).join(',');
    lines.push(row);
  });
  const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

export function historyToRows(history){
  return history.map(h=>({when:new Date(h.ts).toLocaleString(), title:h.title || '', score:h.score||'', correct:h.correct||'', total:h.total||''}));
}

export function statsToRows(stats){
  return Object.entries(stats||{}).map(([k,v])=>({topic:k, done:v.done||0, correct:v.correct||0, accuracy: v.done? Math.round(100*(v.correct||0)/v.done)+'%':'N/A'}));
}


// Optional: export XLSX via SheetJS if loaded
export function toXLSX(rows, filename='export.xlsx'){
  try{
    if(!window.XLSX){ alert('SheetJS (XLSX) không được tải; sẽ xuất CSV thay thế.'); toCSV(rows, filename.replace('.xlsx','.csv')); return; }
    const ws = window.XLSX.utils.json_to_sheet(rows);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const wbout = window.XLSX.write(wb, { bookType:'xlsx', type:'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }catch(e){ console.error(e); toCSV(rows, filename.replace('.xlsx','.csv')); }
}
