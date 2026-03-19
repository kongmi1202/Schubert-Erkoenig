import React from 'react'

const YOUTUBE_ID = 'BXeE7rIAiTM'
const EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0`

export default function ListenStep() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">감상 (영상)</h2>
        <p className="mt-2 text-sm text-slate-600">
          영상을 감상한 뒤 다음 단계로 이동하세요.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black/5">
        <div className="aspect-video w-full">
          <iframe
            title="슈베르트 마왕 감상 영상"
            src={EMBED_URL}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
