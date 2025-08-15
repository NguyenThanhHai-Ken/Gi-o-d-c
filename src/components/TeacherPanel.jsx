import React, {useState, useEffect} from 'react'
import catalog from '../data/catalog.json'
import { load, save } from '../utils/storage'
import { toCSV, historyToRows, statsToRows } from '../utils/exporter'

export default function TeacherPanel({user}){
  const [classes, setClasses] = useState([])
  const [selected, setSelected] = useState(null)
  useEffect(()=>{
    setClasses(catalog.classes.map(c=>({id:c.id,name:c.name})))
  },[])

  const history = load('history',[])
  const stats = load('topicStats',{})

  const doExportHistory = ()=>{
    const rows = historyToRows(history)
    toCSV(rows, 'history_export.csv')
  }
  const doExportStats = ()=>{
    const rows = statsToRows(stats)
    toCSV(rows, 'topic_stats.csv')
  }

  return (
    <div className="container grid">
      <h2>Trang giáo viên</h2>
      <div className="card">
        <div className="muted">Tài khoản: {user? user.email : 'Chưa đăng nhập'}</div>
        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button className="btn" onClick={doExportHistory}>Xuất lịch sử (CSV)</button>
          <button className="btn secondary" onClick={doExportStats}>Xuất thống kê chủ đề</button>
        </div>
      </div>
      <div className="card">
        <h3>Danh sách lớp</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {classes.map(c=> <button key={c.id} className="pill" onClick={()=>setSelected(c.id)}>{c.name}</button>)}
        </div>
        {selected && <div style={{marginTop:12}}>Lớp đang chọn: <b>{selected}</b></div>}
      </div>
      <div className="card">
        <h3>Giao bài nhanh</h3>
        <div className="muted">(Tính năng mẫu: tạo bản ghi 'assignments' trong Firestore khi hoàn thiện)</div>
<div style={{marginTop:8}}>
  <button className="btn secondary" onClick={()=>alert('Tạo bài mẫu (demo)')}>Tạo bài mẫu</button>
  <button className="btn" onClick={async ()=>{
    const title = prompt('Tiêu đề bài giao'); if(!title) return; 
    const cls = selected || (classes[0] && classes[0].id);
    const questions = [{level:'easy', type:'mcq', question:'Câu mẫu', options:['A','B','C'], answer:0}];
    const payload = { classId: cls, title, questions, createdBy: 'teacher_demo', due: Date.now() + 7*24*3600*1000 };
    try{ const res = await window.createAssignment(payload); alert('Tạo xong: '+JSON.stringify(res)); }catch(e){ alert('Lỗi tạo: '+e.message) }
  }}>Tạo & Lưu lên Cloud</button>
</div>
      </div>
    </div>
  )
}
