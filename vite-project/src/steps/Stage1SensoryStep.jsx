import React, { useRef } from 'react'
import { ImagePlus, Palette, BookOpen } from 'lucide-react'
import { useAppState } from '../state/AppStateContext.jsx'
import { STAGE1_KEYWORDS, STAGE1_COLORS, STAGE1_SUBJECTS } from '../state/AppStateContext.jsx'

function toggleInArray(arr, value) {
  if (!Array.isArray(arr)) return [value]
  const set = new Set(arr)
  if (set.has(value)) {
    set.delete(value)
    return [...set]
  }
  set.add(value)
  return [...set]
}

function SubjectChoice({ subject, selected, onToggle, maxSelected }) {
  const disabled = !selected && maxSelected >= 2
  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(subject)}
      className={[
        'rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-slate-900 bg-slate-900 text-white'
          : disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
      ].join(' ')}
    >
      {subject}
    </button>
  )
}

// 체육: 사진 업로드 + 텍스트
function Input체육({ value, onChange }) {
  const inputRef = useRef(null)
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ ...value, photoDataUrl: reader.result })
    reader.readAsDataURL(file)
  }
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-sm font-semibold text-slate-800">체육</div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <ImagePlus className="h-4 w-4" />
          사진 업로드
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value.photoDataUrl && (
          <img src={value.photoDataUrl} alt="업로드" className="h-20 w-20 rounded-lg object-cover" />
        )}
      </div>
      <input
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="체육과 연결한 설명을 입력하세요"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  )
}

// 과학: 자연현상 선택 + 텍스트
const PHENOMENA = ['천둥/번개', '바람', '비', '눈', '물결', '숲', '달', '해', '그 외']
function Input과학({ value, onChange }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-sm font-semibold text-slate-800">과학</div>
      <select
        value={value.phenomenon}
        onChange={(e) => onChange({ ...value, phenomenon: e.target.value })}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="">자연현상 선택</option>
        {PHENOMENA.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <input
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="자연현상과 음악의 연결을 설명하세요"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  )
}

// 사회: 지도 마크(장소 텍스트) + 텍스트
function Input사회({ value, onChange }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-sm font-semibold text-slate-800">사회</div>
      <input
        value={value.mapMark}
        onChange={(e) => onChange({ ...value, mapMark: e.target.value })}
        placeholder="예: 장소, 지역, 지도에서 떠오른 곳"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="사회/지리와 연결한 설명을 입력하세요"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  )
}

// 수학: 도형 그리기 캔버스 + 텍스트
function Input수학({ value, onChange }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = React.useState(false)
  const [color, setColor] = React.useState('#3b82f6')
  const [lineWidth, setLineWidth] = React.useState(3)

  const startDraw = (e) => {
    setDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const rect = canvasRef.current.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!drawing) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const rect = canvasRef.current.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const endDraw = () => {
    setDrawing(false)
    const canvas = canvasRef.current
    if (canvas) onChange({ ...value, shapeDataUrl: canvas.toDataURL('image/png') })
  }

  React.useEffect(() => {
    const canvas = canvasRef.current
    const dataUrl = value.shapeDataUrl
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!dataUrl) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = dataUrl
  }, [value.shapeDataUrl])

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-sm font-semibold text-slate-800">수학</div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">펜 굵기:</span>
        {[2, 4, 6].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setLineWidth(w)}
            className={`rounded px-2 py-1 text-xs ${lineWidth === w ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}
          >
            {w}
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-2">색상:</span>
        {['#3b82f6', '#ef4444', '#22c55e'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-6 w-6 rounded-full border-2 ${color === c ? 'border-slate-900' : 'border-slate-300'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={320}
        height={160}
        className="block w-full max-w-md rounded-lg border border-slate-200 bg-white"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
      />
      <input
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="도형/수학과 연결한 설명을 입력하세요"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  )
}

export default function Stage1SensoryStep() {
  const { state, actions } = useAppState()
  const s1 = state.stage1 || {}
  const keywords = s1.keywords || []
  const colors = s1.colors || []
  const subjectChoices = s1.subjectChoices || []
  const subjectInputs = s1.subjectInputs || {}

  const setKeywords = (kw) => actions.setField('stage1.keywords', kw)
  const setColors = (c) => actions.setField('stage1.colors', c)
  const setSubjectChoices = (sc) => actions.setField('stage1.subjectChoices', sc)
  const setSubjectInput = (sub, v) => actions.setField(`stage1.subjectInputs.${sub}`, v)

  const toggleKeyword = (k) => setKeywords(toggleInArray(keywords, k))
  const toggleColor = (c) => {
    if (colors.includes(c)) {
      setColors(colors.filter((x) => x !== c))
    } else if (colors.length < 4) {
      setColors([...colors, c])
    }
  }
  const toggleSubject = (sub) => {
    if (subjectChoices.includes(sub)) {
      setSubjectChoices(subjectChoices.filter((s) => s !== sub))
    } else if (subjectChoices.length < 2) {
      setSubjectChoices([...subjectChoices, sub])
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">1단계 (감각적)</h2>
        <p className="mt-2 text-sm text-slate-600">
          음악을 들으며 떠오른 감정·색·다른 교과와의 연결을 선택·입력하세요.
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-800">키워드 (다중 선택)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGE1_KEYWORDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleKeyword(k)}
              className={[
                'rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors',
                keywords.includes(k) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
              ].join(' ')}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-800">색상 (2~4개 선택)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGE1_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleColor(c)}
              disabled={!colors.includes(c) && colors.length >= 4}
              className={[
                'h-10 w-10 rounded-full border-2 transition-transform',
                colors.includes(c) ? 'scale-110 ring-2 ring-slate-900 ring-offset-2' : 'border-slate-200',
              ].join(' ')}
              style={{ backgroundColor: c }}
              title={colors.includes(c) ? '클릭하면 해제' : '클릭하면 선택'}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">선택: {colors.length}개</p>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-800">교과 통합 (2개 선택)</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {STAGE1_SUBJECTS.map((sub) => (
            <SubjectChoice
              key={sub}
              subject={sub}
              selected={subjectChoices.includes(sub)}
              onToggle={toggleSubject}
              maxSelected={subjectChoices.length}
            />
          ))}
        </div>
        <div className="space-y-4">
          {subjectChoices.includes('체육') && (
            <Input체육
              value={subjectInputs.체육 || { photoDataUrl: '', text: '' }}
              onChange={(v) => setSubjectInput('체육', v)}
            />
          )}
          {subjectChoices.includes('과학') && (
            <Input과학
              value={subjectInputs.과학 || { phenomenon: '', text: '' }}
              onChange={(v) => setSubjectInput('과학', v)}
            />
          )}
          {subjectChoices.includes('사회') && (
            <Input사회
              value={subjectInputs.사회 || { mapMark: '', text: '' }}
              onChange={(v) => setSubjectInput('사회', v)}
            />
          )}
          {subjectChoices.includes('수학') && (
            <Input수학
              value={subjectInputs.수학 || { shapeDataUrl: '', text: '' }}
              onChange={(v) => setSubjectInput('수학', v)}
            />
          )}
        </div>
      </section>
    </div>
  )
}
