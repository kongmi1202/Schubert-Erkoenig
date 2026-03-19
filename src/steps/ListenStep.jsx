import React from 'react'

const YOUTUBE_ID = 'BXeE7rIAiTM'
const EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0`
const LYRICS = `[🎙️해설자] 누가 늦은 밤 말을 달려 그들은 아버지와 아들
아버지 아이를 품에 안고, 안고 달리네, 따뜻하게.
[👨아버지] 아들아, 무엇 때문에 떠느냐?
[👦아들] 아빠, 마왕이 안 보여요? 검은 옷에다 관을 썼는데.
[👨아버지] 아들아, 그것은 안개다.
[👑마왕] 예쁜 아가, 이리 오렴. 함께 재밌게 놀자꾸나.
예쁜 꽃이 피어있단다. 너에게 줄 예쁜 황금빛 옷
[👦아들] 아버지, 아버지, 들리잖아요. 저 마왕이 속삭이는 소리.
[👨아버지] 진정해, 진정해, 아가. 낙엽이 날리는 소리다.
[👑마왕] 예쁜 아가, 나랑 가볼래? 예쁜 내 딸이 너를 기다려. 너와 함께 밤 강가로 갈 거야. 함께 춤추며 노래 부를 거야. x2
[👦아들] 아버지, 아버지, 보이잖아요, 마왕의 딸 서 있는 것이.
[👨아버지] 아가, 아가, 내 보고 있어. 그것은 오래된 나무란다.
[👑마왕] 니가 좋아, 이 끌리는 예쁜 모습. 니가 싫어해도 데려가야지.
[👦아들] 아버지, 아버지, 나를 덮쳐요. 마왕이 나를 끌고 가요.
[🎙️해설자] 아버지 급히 마을 달려가 그의 품 안에 신음하는 아기
그가 집에 다 왔을 때, 품 속의 아기는 죽었네.`

export default function ListenStep() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">감상 (영상)</h2>
        <p className="mt-2 text-sm text-slate-600">
          영상을 감상한 뒤 다음 단계로 이동하세요.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">가사</h3>
          <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{LYRICS}</pre>
        </div>
      </div>
    </div>
  )
}
