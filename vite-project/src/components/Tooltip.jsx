import React, { useState } from 'react'

export default function Tooltip({ text, children }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {show && (
        <span
          className="absolute left-1/2 top-full z-50 mt-1 w-56 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
          role="tooltip"
        >
          {text}
        </span>
      )}
    </span>
  )
}
