import React, { useEffect, useRef, useState } from 'react'
import { HelpCircle, Sparkles, Music, Eraser } from 'lucide-react'
import { useAppState } from '../state/AppStateContext.jsx'
import {
  STAGE2_CHARACTER_ANSWERS,
  STAGE2_TIMBRE_CHARACTERS,
  STAGE2_TIMBRE_DIMENSIONS,
} from '../state/AppStateContext.jsx'
import { getPlotComparisonComment, getPlotHelperSuggestion } from '../lib/openai.js'
import Tooltip from '../components/Tooltip.jsx'
import FlipCard from '../components/FlipCard.jsx'

const OVERVIEW_VIDEO_ID = 'tgfmLln8zjg'
const OVERVIEW_EMBED = `https://www.youtube.com/embed/${OVERVIEW_VIDEO_ID}?rel=0`

const TIMBRE_OPTIONS = {
  pitch: ['높음', '낮음', '중간'],
  scale: ['장조', '단조'],
  rhythm: ['짧음', '보통', '긺'],
  timbre: ['얇음', '중간', '두꺼움'],
}

// 슈베르트의 실제 설계 비교표 (교육용)
const SCHUBERT_TIMBRE_TABLE = {
  해설자: { pitch: '낮음', scale: '단조', rhythm: '보통', timbre: '중간' },
  아버지: { pitch: '낮음', scale: '단조', rhythm: '보통', timbre: '두꺼움' },
  아들: { pitch: '높음', scale: '단조', rhythm: '짧음', timbre: '얇음' },
  마왕: { pitch: '중간', scale: '장조', rhythm: '긺', timbre: '중간' },
}

// 반주 음원 placeholder (실제 URL로 교체 가능)
const ACCOMPANIMENT_AUDIO = {
  right: null,
  left: null,
}

function SectionTitle({ children }) {
  return <h3 className="text-lg font-bold text-slate-900 mt-8 mb-3 first:mt-0">{children}</h3>}

export default function Stage2AnalyticStep({ section = 'all' }) {
  const { state, actions } = useAppState()
  const [plotHelperLoading, setPlotHelperLoading] = useState(false)
  const [plotHelperText, setPlotHelperText] = useState('')
  const [plotCheckLoading, setPlotCheckLoading] = useState(false)
  const [plotCheckText, setPlotCheckText] = useState('')
  const [plotCheckError, setPlotCheckError] = useState('')
  const [showOverviewAnswers, setShowOverviewAnswers] = useState(false)
  const [showTimbreCompare, setShowTimbreCompare] = useState(false)
  const o = state.stage2?.overview || {}
  const t = state.stage2?.timbre || {}
  const a = state.stage2?.accompaniment || {}
  const rightCanvasRef = useRef(null)
  const leftCanvasRef = useRef(null)
  const [accompColor, setAccompColor] = useState('#1e40af')
  const [accompLineWidth, setAccompLineWidth] = useState(3)
  const [accompTool, setAccompTool] = useState('draw')
  const [activeCanvas, setActiveCanvas] = useState(null)
  const [showRightCompare, setShowRightCompare] = useState(false)
  const [showLeftCompare, setShowLeftCompare] = useState(false)

  const setOverview = (field, value) => actions.setField(`stage2.overview.${field}`, value)
  const setTimbre = (field, value) => actions.setField(`stage2.timbre.${field}`, value)
  const overviewAllFilled = Boolean(o.narrator?.trim() && o.father?.trim() && o.son?.trim() && o.erlking?.trim())
  const timbreAllFilled = Boolean(
    t?.character1 && t?.character2 &&
    t?.c1Pitch && t?.c1Scale && t?.c1Rhythm && t?.c1Timbre &&
    t?.c2Pitch && t?.c2Scale && t?.c2Rhythm && t?.c2Timbre,
  )

  useEffect(() => {
    setShowOverviewAnswers(false)
  }, [o.narrator, o.father, o.son, o.erlking])

  useEffect(() => {
    setShowTimbreCompare(false)
  }, [
    t.character1, t.character2,
    t.c1Pitch, t.c1Scale, t.c1Rhythm, t.c1Timbre,
    t.c2Pitch, t.c2Scale, t.c2Rhythm, t.c2Timbre,
  ])

  const handlePlotHelper = async () => {
    setPlotHelperLoading(true)
    setPlotHelperText('')
    try {
      const suggestion = await getPlotHelperSuggestion(o.plot)
      setPlotHelperText(suggestion)
    } catch (e) {
      setPlotHelperText('도우미를 불러오지 못했어요. API 키를 확인해 주세요.')
    } finally {
      setPlotHelperLoading(false)
    }
  }

  const handlePlotCheck = async () => {
    setPlotCheckLoading(true)
    setPlotCheckError('')
    setPlotCheckText('')
    try {
      const comment = await getPlotComparisonComment(o.plot)
      setPlotCheckText(comment)
    } catch (e) {
      setPlotCheckError(e.message || '정답 비교 중 오류가 났어요. API 키를 확인해 주세요.')
    } finally {
      setPlotCheckLoading(false)
    }
  }

  const getPointInCanvas = (canvas, e) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }
  const startAccompDraw = (hand, e) => {
    const canvas = hand === 'right' ? rightCanvasRef.current : leftCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    e.preventDefault()
    const { x, y } = getPointInCanvas(canvas, e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setActiveCanvas(hand)
  }
  const accompDraw = (hand, e) => {
    if (activeCanvas !== hand) return
    const canvas = hand === 'right' ? rightCanvasRef.current : leftCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    e.preventDefault()
    const { x, y } = getPointInCanvas(canvas, e)
    ctx.lineTo(x, y)
    ctx.globalCompositeOperation = accompTool === 'erase' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = accompColor
    ctx.lineWidth = accompLineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
  const endAccompDraw = (hand) => {
    if (activeCanvas !== hand) return
    setActiveCanvas(null)
    const rightCanvas = rightCanvasRef.current
    const leftCanvas = leftCanvasRef.current
    const rightDataUrl = rightCanvas ? rightCanvas.toDataURL('image/png') : ''
    const leftDataUrl = leftCanvas ? leftCanvas.toDataURL('image/png') : ''
    actions.setField('stage2.accompaniment.rightCanvasDataUrl', rightDataUrl)
    actions.setField('stage2.accompaniment.leftCanvasDataUrl', leftDataUrl)
    actions.setField('stage2.accompaniment.canvasDataUrl', rightDataUrl || leftDataUrl)
    if (hand === 'right') setShowRightCompare(false)
    if (hand === 'left') setShowLeftCompare(false)
  }
  const clearCanvas = (hand) => {
    const canvas = hand === 'right' ? rightCanvasRef.current : leftCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const rightDataUrl = hand === 'right' ? '' : (rightCanvasRef.current?.toDataURL('image/png') || '')
    const leftDataUrl = hand === 'left' ? '' : (leftCanvasRef.current?.toDataURL('image/png') || '')
    actions.setField('stage2.accompaniment.rightCanvasDataUrl', rightDataUrl)
    actions.setField('stage2.accompaniment.leftCanvasDataUrl', leftDataUrl)
    actions.setField('stage2.accompaniment.canvasDataUrl', rightDataUrl || leftDataUrl)
    if (hand === 'right') setShowRightCompare(false)
    if (hand === 'left') setShowLeftCompare(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">2단계 (분석적)</h2>
        <p className="mt-2 text-sm text-slate-600">
          개요·음색·반주·맥락을 순서대로 살펴보세요.
        </p>
      </div>

      {(section === 'all' || section === 'overview') && (
      <section>
        <SectionTitle>2-1 개요</SectionTitle>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black/5 mb-4">
          <div className="aspect-video w-full">
            <iframe
              title="개요 영상"
              src={OVERVIEW_EMBED}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-800 mb-2">등장인물 (입력 후 정답과 비교)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { key: 'narrator', label: '해설자', hint: '🎙️' },
            { key: 'father', label: '아버지', hint: '👨' },
            { key: 'son', label: '아들', hint: '👦' },
            { key: 'erlking', label: '마왕', hint: '👑' },
          ].map(({ key, label, hint }) => (
            <div key={key}>
              <input
                value={o[key] || ''}
                onChange={(e) => setOverview(key, e.target.value)}
                placeholder={hint}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {showOverviewAnswers && (
                <p className={`mt-1 text-xs ${(o[key] || '').trim() === label ? 'text-green-600' : 'text-amber-600'}`}>
                  정답: {label}
                </p>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowOverviewAnswers(true)}
          disabled={!overviewAllFilled}
          className={[
            'mb-4 rounded-lg px-3 py-2 text-sm font-medium',
            overviewAllFilled
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'cursor-not-allowed bg-slate-100 text-slate-400',
          ].join(' ')}
        >
          정답 확인하기
        </button>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800">줄거리 (서술형)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlotHelper}
                disabled={plotHelperLoading}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-800 hover:bg-violet-200 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {plotHelperLoading ? '처리 중…' : 'OpenAI 서술 도우미'}
              </button>
              <button
                type="button"
                onClick={handlePlotCheck}
                disabled={!o.plot?.trim() || plotCheckLoading}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-medium',
                  o.plot?.trim() && !plotCheckLoading
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                {plotCheckLoading ? '비교 중…' : '정답 확인하기'}
              </button>
            </div>
          </div>
          <textarea
            value={o.plot || ''}
            onChange={(e) => setOverview('plot', e.target.value)}
            placeholder="영상을 보고 줄거리를 서술해 보세요."
            className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900"
          />
          {plotHelperText && (
            <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-slate-700">
              <span className="font-semibold">도우미 제안:</span> {plotHelperText}
            </div>
          )}
          {plotCheckError && (
            <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {plotCheckError}
            </div>
          )}
          {plotCheckText && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
              <span className="font-semibold">비교 코멘트</span>
              <div className="mt-1">{plotCheckText}</div>
            </div>
          )}
        </div>
      </section>
      )}

      {(section === 'all' || section === 'timbre') && (
      <section>
        <SectionTitle>2-2 음색</SectionTitle>
        <p className="text-sm text-slate-600 mb-3">인물 2명을 선택한 뒤, 각 차원을 라디오로 선택하세요.</p>
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">인물 1</span>
            <select
              value={t.character1 || ''}
              onChange={(e) => setTimbre('character1', e.target.value)}
              className="mt-1 block w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">선택</option>
              {STAGE2_TIMBRE_CHARACTERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">인물 2</span>
            <select
              value={t.character2 || ''}
              onChange={(e) => setTimbre('character2', e.target.value)}
              className="mt-1 block w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">선택</option>
              {STAGE2_TIMBRE_CHARACTERS.filter((c) => c !== t.character1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        {(t.character1 || t.character2) && (
          <div className="space-y-4">
            {[
              { prefix: 'c1', char: t.character1, label: '인물 1' },
              { prefix: 'c2', char: t.character2, label: '인물 2' },
            ].filter(({ char }) => char).map(({ prefix, char, label }) => (
              <div key={prefix} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="font-semibold text-slate-800 mb-3">{label}: {char}</p>
                {STAGE2_TIMBRE_DIMENSIONS.map((dim) => (
                  <div key={dim.id} className="flex flex-wrap items-center gap-2 mb-2">
                    <Tooltip text={dim.tooltip}>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                        {dim.label}
                        <HelpCircle className="h-4 w-4 text-slate-500" />
                      </span>
                    </Tooltip>
                    <div className="flex flex-wrap gap-2">
                      {(TIMBRE_OPTIONS[dim.id] || []).map((opt) => {
                      const stateKey = `${prefix}${dim.id.charAt(0).toUpperCase()}${dim.id.slice(1)}`
                      return (
                        <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`${prefix}-${dim.id}`}
                            checked={(t[stateKey] || '') === opt}
                            onChange={() => setTimbre(stateKey, opt)}
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      )
                    })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowTimbreCompare(true)}
          disabled={!timbreAllFilled}
          className={[
            'mt-4 rounded-lg px-3 py-2 text-sm font-medium',
            timbreAllFilled
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'cursor-not-allowed bg-slate-100 text-slate-400',
          ].join(' ')}
        >
          정답 확인하기
        </button>
        {showTimbreCompare && (
          <div className="mt-6 overflow-x-auto">
            <p className="text-sm font-semibold text-slate-800 mb-2">슈베르트의 실제 설계와 비교</p>
            <table className="w-full min-w-[400px] text-sm border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-200 p-2 text-left">인물</th>
                  <th className="border border-slate-200 p-2">음높이</th>
                  <th className="border border-slate-200 p-2">음계</th>
                  <th className="border border-slate-200 p-2">리듬</th>
                  <th className="border border-slate-200 p-2">음색</th>
                </tr>
              </thead>
              <tbody>
                {[t.character1, t.character2].map((char) => {
                  const design = SCHUBERT_TIMBRE_TABLE[char]
                  const my = char === t.character1
                    ? { pitch: t.c1Pitch, scale: t.c1Scale, rhythm: t.c1Rhythm, timbre: t.c1Timbre }
                    : { pitch: t.c2Pitch, scale: t.c2Scale, rhythm: t.c2Rhythm, timbre: t.c2Timbre }
                  return (
                    <tr key={char}>
                      <td className="border border-slate-200 p-2 font-medium">{char}</td>
                      <td className="border border-slate-200 p-2">나: {my.pitch} / 실제: {design?.pitch}</td>
                      <td className="border border-slate-200 p-2">나: {my.scale} / 실제: {design?.scale}</td>
                      <td className="border border-slate-200 p-2">나: {my.rhythm} / 실제: {design?.rhythm}</td>
                      <td className="border border-slate-200 p-2">나: {my.timbre} / 실제: {design?.timbre}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      {(section === 'all' || section === 'accompaniment') && (
      <section>
        <SectionTitle>2-3 반주</SectionTitle>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              if (ACCOMPANIMENT_AUDIO.right) new Audio(ACCOMPANIMENT_AUDIO.right).play()
              else alert('오른손 반주 샘플 음원을 연결할 수 있습니다.')
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <Music className="h-4 w-4" /> 오른손 반주 듣기
          </button>
          <button
            type="button"
            onClick={() => {
              if (ACCOMPANIMENT_AUDIO.left) new Audio(ACCOMPANIMENT_AUDIO.left).play()
              else alert('왼손 반주 샘플 음원을 연결할 수 있습니다.')
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <Music className="h-4 w-4" /> 왼손 반주 듣기
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-800 mb-2">가락선 그리기 (펜 굵기 슬라이더·색상·지우개)</p>
        <div className="mb-2">
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="accomp-width-slider">
            펜 굵기: {accompLineWidth}
          </label>
          <input
            id="accomp-width-slider"
            type="range"
            min={1}
            max={24}
            step={1}
            value={accompLineWidth}
            onChange={(e) => setAccompLineWidth(Number(e.target.value))}
            className="w-full max-w-sm accent-slate-800"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {['#1e40af', '#b91c1c', '#15803d'].map((c) => (
            <button key={c} type="button" onClick={() => setAccompColor(c)} className={`h-6 w-6 rounded-full border-2 ${accompColor === c ? 'border-slate-900' : 'border-slate-300'}`} style={{ backgroundColor: c }} />
          ))}
          <button
            type="button"
            onClick={() => setAccompTool((prev) => (prev === 'erase' ? 'draw' : 'erase'))}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${accompTool === 'erase' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            <Eraser className="h-3.5 w-3.5" />
            {accompTool === 'erase' ? '지우개 사용 중' : '지우개'}
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800 mb-2">오른손 가락선 악보</p>
            <canvas
              ref={rightCanvasRef}
              width={400}
              height={200}
              className="block w-full rounded-xl border border-slate-200 bg-white touch-none"
              onPointerDown={(e) => startAccompDraw('right', e)}
              onPointerMove={(e) => accompDraw('right', e)}
              onPointerUp={() => endAccompDraw('right')}
              onPointerLeave={() => endAccompDraw('right')}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => clearCanvas('right')}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                전체 지우기
              </button>
              <button
                type="button"
                onClick={() => setShowRightCompare(true)}
                disabled={!a.rightCanvasDataUrl}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-medium',
                  a.rightCanvasDataUrl ? 'bg-slate-900 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                정답 확인하기
              </button>
            </div>
            {showRightCompare && a.rightCanvasDataUrl && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-800 mb-2">오른손 실제 악보와 비교</p>
                <p className="text-xs text-slate-500 mb-2">(아래는 예시 이미지입니다. 실제 악보 이미지 URL로 교체 가능합니다.)</p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Franz_Schubert_-_Erlk%C3%B6nig_-_op._1%2C_D._328_%281815%29_-_first_page.jpg/440px-Franz_Schubert_-_Erlk%C3%B6nig_-_op._1%2C_D._328_%281815%29_-_first_page.jpg" alt="마왕 악보 오른손 비교" className="max-w-full rounded-lg border border-slate-200" />
              </div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800 mb-2">왼손 가락선 악보</p>
            <canvas
              ref={leftCanvasRef}
              width={400}
              height={200}
              className="block w-full rounded-xl border border-slate-200 bg-white touch-none"
              onPointerDown={(e) => startAccompDraw('left', e)}
              onPointerMove={(e) => accompDraw('left', e)}
              onPointerUp={() => endAccompDraw('left')}
              onPointerLeave={() => endAccompDraw('left')}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => clearCanvas('left')}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                전체 지우기
              </button>
              <button
                type="button"
                onClick={() => setShowLeftCompare(true)}
                disabled={!a.leftCanvasDataUrl}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-medium',
                  a.leftCanvasDataUrl ? 'bg-slate-900 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-100 text-slate-400',
                ].join(' ')}
              >
                정답 확인하기
              </button>
            </div>
            {showLeftCompare && a.leftCanvasDataUrl && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-800 mb-2">왼손 실제 악보와 비교</p>
                <p className="text-xs text-slate-500 mb-2">(아래는 예시 이미지입니다. 실제 악보 이미지 URL로 교체 가능합니다.)</p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Franz_Schubert_-_Erlk%C3%B6nig_-_op._1%2C_D._328_%281815%29_-_first_page.jpg/440px-Franz_Schubert_-_Erlk%C3%B6nig_-_op._1%2C_D._328_%281815%29_-_first_page.jpg" alt="마왕 악보 왼손 비교" className="max-w-full rounded-lg border border-slate-200" />
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {(section === 'all' || section === 'context') && (
      <section>
        <SectionTitle>2-4 맥락</SectionTitle>
        <p className="text-sm text-slate-600 mb-4">카드를 클릭해 뒤집어 보세요.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FlipCard front="낭만 시대" back="19세기 유럽의 예술·문학 사조. 감정과 자연, 민족주의를 중시했어요." />
          <FlipCard front="슈베르트" back="오스트리아 작곡가(1797–1828). 가곡과 피아노곡을 많이 썼어요." />
          <FlipCard front="괴테" back="독일 시인. '마왕' 시의 원작자예요. 슈베르트가 이 시에 곡을 붙였어요." />
          <FlipCard front="예술가곡" back="시에 곡을 붙인 예술 음악. 피아노 반주와 성악이 함께하는 형식이에요." />
        </div>
        <button
          type="button"
          onClick={() => actions.setField('stage2.contextViewed', true)}
          className="mt-4 text-sm text-slate-500 underline"
        >
          확인했어요
        </button>
      </section>
      )}
    </div>
  )
}
