import React, { useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import katex from 'katex'

export default function Latex({ children, block=false }){
  const ref = useRef(null)
  useEffect(()=>{
    if(ref.current){
      katex.render(children, ref.current, { throwOnError: false, displayMode: block })
    }
  },[children, block])
  return <div ref={ref} />
}
