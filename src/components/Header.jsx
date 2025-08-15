import React from 'react'
import { Link } from 'react-router-dom'

export default function Header({user, onLogin, onLogout}){
  const toggleTheme = ()=>{ const cur = localStorage.getItem('theme')||'dark'; const next = cur==='dark'?'light':'dark'; localStorage.setItem('theme', next); document.documentElement.dataset.theme = next; }

  return (
    <div className="header container">
      <a href="/" style="display:flex;align-items:center;gap:10px;"><img src="/public_assets/logo.svg" alt="Toán 6-9" style="height:48px;"/></a>
      <Link to="/" className="pill">Toán 6–9</Link>
      <nav className="nav">
        <Link className="pill" to="/exam">Thi thử</Link>
        <Link className="pill" to="/formula">Công thức nhanh</Link>
        {user? <button className="btn secondary" onClick={onLogout}>Đăng xuất</button> :
               <button className="btn" onClick={onLogin}>Đăng nhập</button>}
      </nav>
            <button className="pill" onClick={toggleTheme}>Toggle theme</button>
      </div>
    </div>
  )
}

