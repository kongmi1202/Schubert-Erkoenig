import React, { useState } from 'react'

export default function FlipCard({ front, back }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="group relative h-32 w-full min-w-[140px] max-w-[200px] perspective-1000"
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 preserve-3d"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-100 p-4 text-center text-sm font-semibold text-slate-800 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-800 p-4 text-center text-sm text-white"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </div>
    </button>
  )
}
