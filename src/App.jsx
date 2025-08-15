import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import Header from './components/Header'\nimport TeacherPanel from './components/TeacherPanel'
import Latex from './components/Latex'
import catalogData from './data/catalog.json'
import { save, load, pushHistory } from './utils/storage'
import { recommendNext } from './utils/recommender'
import { generateExam, EXAM_TEMPLATES } from './utils/exam'
import { loginWithGoogle, logout as fbLogout } from './firebase'
import { pullUserData, pushUserData } from './utils/cloudStore'

function Home(){
  const [search, setSearch] = useState('')
  const cats = catalogData.classes
  const navigate = useNavigate()
  const history = load('history', [])
  return (
    <div className="container grid" style={{gap:24}}>
      <div className="card">
        <h2>Xin chào 👋</h2>
        <p className="muted">Tìm nhanh bài học, công thức hoặc chủ đề…</p>
        <input placeholder="vd: phân số, phương trình bậc hai…" value={search} onChange={e=>setSearch(e.target.value)} />
        <div style={{marginTop:12}}>
          <button className="btn" onClick={()=>navigate(`/search?q=${encodeURIComponent(search)}`)}>Tìm kiếm</button>
        </div>
      </div>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))'}}>
        {cats.map(c=>(
          <Link key={c.id} to={`/class/${c.id}`} className="card">
            <h3>{c.name}</h3>
            <div className="muted">Bấm để vào danh mục</div>
          </Link>
        ))}
      </div>
      <div className="card">
        <h3>Lịch sử gần đây</h3>
        {history.length===0? <div className="muted">Chưa có hoạt động.</div>:
          <ul>{history.slice(0,8).map(h=>(<li key={h.ts} className="muted">{new Date(h.ts).toLocaleString()} – {h.title}</li>))}</ul>}
      </div>
    </div>
  )
}

function ClassPage(){
  const { id } = useParams()
  const cls = catalogData.classes.find(c=>c.id===id)
  return (
    <div className="container grid">
      <h2>{cls.name}</h2>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
        {cls.subjects.map(s=> (<Link key={s.id} to={`subject/${s.id}`} className="card">
          <h3>{s.name}</h3>
        </Link>))}
      </div>
    </div>
  )
}

function SubjectPage(){
  const { cid, sid } = useParams()
  const cls = catalogData.classes.find(c=>c.id===cid)
  const subj = cls.subjects.find(s=>s.id===sid)
  const rec = recommendNext(subj.topics)
  return (
    <div className="container grid">
      <h2>{cls.name} – {subj.name}</h2>
      <div className="card">
        <div className="muted">Gợi ý học tiếp:</div>
        {rec.map(r=><span className="tag" key={r.id}>{r.name} {r.acc!=null?`(${r.acc}%)`:''}</span>)}
      </div>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
        {subj.topics.map(t=>(<Link key={t.id} to={`topic/${t.id}`} className="card"><h3>{t.name}</h3></Link>))}
      </div>
    </div>
  )
}

function TopicPage(){
  const { cid, sid, tid } = useParams()
  const cls = catalogData.classes.find(c=>c.id===cid)
  const subj = cls.subjects.find(s=>s.id===sid)
  const topic = subj.topics.find(t=>t.id===tid)
  return (
    <div className="container grid">
      <h2>{cls.name} – {subj.name} – {topic.name}</h2>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))'}}>
        {topic.lessons.map(l=>(<Link key={l.id} to={`lesson/${l.id}`} className="card">
          <h3>{l.title}</h3>
          <div className="muted">{(l.examples?.[0]?.q||'').slice(0,40)}...</div>
        </Link>))}
      </div>
    </div>
  )
}

function LessonPage(){
  const { cid, sid, tid, lid } = useParams()
  const cls = catalogData.classes.find(c=>c.id===cid)
  const subj = cls.subjects.find(s=>s.id===sid)
  const topic = subj.topics.find(t=>t.id===tid)
  const lesson = topic.lessons.find(l=>l.id===lid)
  useEffect(()=>{ pushHistory({title:`${cls.name}/${subj.name}/${lesson.title}`}) },[])
  const [answers, setAnswers] = useState({})
  const stats = load('topicStats', {})
  const onSubmit=()=>{
    let correct=0, total=lesson.questions?.length||0
    lesson.questions?.forEach((q,i)=>{
      if(answers[i]===q.answer) correct++
    })
    const st = stats[topic.id] || {done:0, correct:0}
    st.done += total
    st.correct += correct
    stats[topic.id]=st; save('topicStats', stats)
    alert(`Kết quả: ${correct}/${total}`)
  }
  return (
    <div className="container grid">
      <h2>{lesson.title}</h2>
      <div className="card"><Latex block>{lesson.theory}</Latex></div>
      <div className="card">
        <h3>Ví dụ</h3>
        {(lesson.examples||[]).map((ex,i)=>(
          <div key={i} style={{marginBottom:12}}>
            <Latex>{ex.q}</Latex> ⇒ <span className="badge">{ex.a}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Luyện tập</h3>
        {(lesson.questions||[]).map((q,i)=>(
          <div key={i} className="card" style={{margin:'8px 0'}}>
            <div><b>Câu {i+1}</b> <span className="tag">{q.level}</span></div>
            <div style={{margin:'8px 0'}}>{q.question}</div>
            {q.options.map((op,idx)=>(
              <label key={idx} style={{display:'block',margin:'4px 0'}}>
                <input type="radio" name={`q${i}`} onChange={()=>setAnswers(a=>({...a,[i]:idx}))} checked={answers[i]===idx}/> {op}
              </label>
            ))}
            {answers[i]!=null && <div className="muted">Giải thích: {q.explain}</div>}
          </div>
        ))}
        <button className="btn" onClick={onSubmit}>Nộp bài</button>
      </div>
    </div>
  )
}

function FormulaPage(){
  const buckets = []
  catalogData.classes.forEach(c=>c.subjects.forEach(s=>{
    s.topics.forEach(t=> t.lessons.forEach(l=> buckets.push({subject:s.name, title:l.title, theory:l.theory})))
  }))
  return (
    <div className="container grid">
      <h2>Công thức nhanh</h2>
      <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
        {buckets.map((b,i)=>(
          <div key={i} className="card">
            <div className="muted">{b.subject}</div>
            <div><b>{b.title}</b></div>
            <Latex block>{b.theory}</Latex>
          </div>
        ))}
      </div>
    </div>
  )
}

function SearchPage(){
  const params = new URLSearchParams(location.search)
  const q = (params.get('q')||'').toLowerCase()
  const items=[]
  catalogData.classes.forEach(c=>c.subjects.forEach(s=>s.topics.forEach(t=>t.lessons.forEach(l=>{
    const hay = `${c.name} ${s.name} ${t.name} ${l.title}`.toLowerCase()
    if(hay.includes(q)) items.push({c,s,t,l})
  }))))
  return (
    <div className="container grid">
      <h2>Kết quả cho “{q}”</h2>
      {items.length===0? <div className="muted">Không tìm thấy.</div>:
        <div className="grid">{items.map((it,idx)=>(
          <Link key={idx} to={`/class/${it.c.id}/subject/${it.s.id}/topic/${it.t.id}/lesson/${it.l.id}`} className="card">
            <div><b>{it.c.name}</b> → {it.s.name} → {it.t.name}</div>
            <div>{it.l.title}</div>
          </Link>
        ))}</div>
      }
    </div>
  )
}

function ExamPage(){
  const [grade, setGrade] = useState('9')
  const [duration, setDuration] = useState(45)
  const [count, setCount] = useState(15)
  const pool = useMemo(()=>{
    const cls = catalogData.classes.find(c=>c.id===grade)
    return cls.subjects.flatMap(s=> s.topics.map(t=>({id:t.id, questions: t.lessons.flatMap(l=>l.questions||[])})))
  },[grade])
  const [exam,setExam] = useState(null)
  const startExam=()=> setExam(generateExam({pool, minutes: duration, count}))
  return (
    <div className="container grid">
      <h2>Thi thử</h2>
      {!exam? <div className="card">
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
          {EXAM_TEMPLATES.map(t => (
            <button key={t.name} className="btn secondary" onClick={()=>{setDuration(t.minutes); setCount(t.count)}}>{t.name}</button>
          ))}
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))'}}>
          <div><div className="muted">Chọn lớp</div><select value={grade} onChange={e=>setGrade(e.target.value)}>
            {catalogData.classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
          <div><div className="muted">Thời gian (phút)</div><input type="number" value={duration} onChange={e=>setDuration(+e.target.value)}/></div>
          <div><div className="muted">Số câu</div><input type="number" value={count} onChange={e=>setCount(+e.target.value)}/></div>
        </div>
        <button className="btn" onClick={startExam}>Bắt đầu</button>
      </div>:
      <ExamRunner exam={exam} onQuit={()=>setExam(null)} />}
    </div>
  )
}

function ExamRunner({exam, onQuit}){
  const [left, setLeft] = useState(exam.minutes*60)
  const [answers, setAnswers] = useState({})
  useEffect(()=>{
    const t = setInterval(()=> setLeft(s=> s>0? s-1: 0), 1000)
    return ()=> clearInterval(t)
  },[])
  const done = left===0
  const submit = ()=>{
    let correct=0
    exam.questions.forEach((q,i)=> { if(answers[i]===q.answer) correct++ })
    alert(`Điểm: ${correct}/${exam.questions.length}`)
    onQuit()
  }
  return (
    <div className="grid">
      <div className="card"><b>Thời gian còn:</b> {Math.floor(left/60)}:{String(left%60).padStart(2,'0')}</div>
      {exam.questions.map((q,i)=>(
        <div className="card" key={q.id}>
          <div><b>Câu {i+1}</b> <span className="tag">{q.level}</span></div>
          <div style={{margin:'8px 0'}}>{q.question}</div>
          {q.options.map((op,idx)=>(
            <label key={idx} style={{display:'block'}}>
              <input type="radio" name={`ex${i}`} disabled={done} checked={answers[i]===idx} onChange={()=>setAnswers(a=>({...a,[i]:idx}))}/> {op}
            </label>
          ))}
        </div>
      ))}
      <div>
        <button className="btn" onClick={submit}>Nộp bài</button>
        <button className="btn secondary" onClick={onQuit} style={{marginLeft:8}}>Thoát</button>
      </div>
    </div>
  )
}

export default function App(){
  const [user, setUser] = useState(null)
  const doLogin = async()=>{ try{ const u = await loginWithGoogle(); setUser(u); await pullUserData(u.uid);}catch(e){alert('Login lỗi: '+e.message)} }
  const doLogout = async()=>{ try{ if(user) await pushUserData(user.uid); await fbLogout(); setUser(null)}catch(e){alert('Logout lỗi')} }
  return (
    <>
      <Header user={user} onLogin={doLogin} onLogout={doLogout}/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/formula" element={<FormulaPage/>}/>
        <Route path="/search" element={<SearchPage/>}/>
        <Route path="/exam" element={<ExamPage/>}/>
        <Route path="/class/:id" element={<ClassPage/>}/>
        <Route path="/class/:cid/subject/:sid" element={<SubjectPage/>}/>
        <Route path="/class/:cid/subject/:sid/topic/:tid" element={<TopicPage/>}/>
        <Route path="/class/:cid/subject/:sid/topic/:tid/lesson/:lid" element={<LessonPage/>}/>
      </Routes>
    </>
  )
}
