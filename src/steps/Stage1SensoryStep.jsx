import React, { useEffect, useRef, useState } from 'react'
import { Camera, Palette, BookOpen, MapPin } from 'lucide-react'
import { useAppState } from '../state/AppStateContext.jsx'
import { STAGE1_KEYWORDS, STAGE1_COLORS, STAGE1_SUBJECTS } from '../state/AppStateContext.jsx'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

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

// 체육: 카메라 촬영 + 텍스트
function Input체육({ value, onChange }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraOn(false)
  }

  const startCamera = async () => {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraOn(true)
    } catch (e) {
      setCameraError('카메라를 사용할 수 없어요. 브라우저 권한을 확인해 주세요.')
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    onChange({ ...value, photoDataUrl: canvas.toDataURL('image/png') })
    stopCamera()
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-sm font-semibold text-slate-800">체육</div>
      <div className="flex flex-wrap items-center gap-3">
        {!cameraOn ? (
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Camera className="h-4 w-4" />
            카메라 켜기
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={capturePhoto}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
            >
              촬영하기
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              취소
            </button>
          </>
        )}
      </div>
      {cameraOn && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="block h-52 w-full max-w-md rounded-lg border border-slate-200 bg-black object-cover"
        />
      )}
      {value.photoDataUrl && (
        <div className="space-y-2">
          <img src={value.photoDataUrl} alt="촬영 사진" className="h-52 w-full max-w-md rounded-lg border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={startCamera}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            다시 촬영
          </button>
        </div>
      )}
      {cameraError && <p className="text-xs text-rose-600">{cameraError}</p>}
      <textarea
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="'마왕'을 듣고 왜 이 동작이 떠올랐나요?"
        className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

// 과학: 자연현상 선택 + 텍스트
const PHENOMENA = [
  { value: '폭풍', emoji: '⛈️', tone: 'bg-violet-50' },
  { value: '번개', emoji: '⚡', tone: 'bg-amber-50' },
  { value: '비', emoji: '🌧️', tone: 'bg-sky-50' },
  { value: '눈', emoji: '❄️', tone: 'bg-blue-50' },
  { value: '바람', emoji: '🌬️', tone: 'bg-slate-50' },
  { value: '파도', emoji: '🌊', tone: 'bg-cyan-50' },
  { value: '불', emoji: '🔥', tone: 'bg-rose-50' },
  { value: '구름', emoji: '☁️', tone: 'bg-slate-100' },
  { value: '일몰', emoji: '🌇', tone: 'bg-orange-50' },
  { value: '달', emoji: '🌙', tone: 'bg-yellow-50' },
  { value: '별', emoji: '⭐', tone: 'bg-amber-50' },
  { value: '바다', emoji: '🌊', tone: 'bg-cyan-50' },
]
function Input과학({ value, onChange }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-sm font-semibold text-slate-800">과학</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PHENOMENA.map((item) => {
          const active = value.phenomenon === item.value
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange({ ...value, phenomenon: item.value })}
              className={[
                'rounded-xl border-2 p-3 text-center transition',
                item.tone,
                active ? 'border-slate-900 ring-2 ring-slate-300' : 'border-slate-200 hover:border-slate-400',
              ].join(' ')}
            >
              <div className="text-4xl leading-none">{item.emoji}</div>
              <div className="mt-2 text-sm font-semibold text-slate-800">{item.value}</div>
            </button>
          )
        })}
      </div>
      <textarea
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="'마왕'을 듣고 왜 이 자연현상이 떠올랐나요?"
        className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  )
}

function SocialMarkerPicker({ onPick }) {
  useMapEvents({
    click: (e) => {
      onPick(e.latlng)
    },
  })
  return null
}

// 사회: 지도 마커 + 주소 + 텍스트
function Input사회({ value, onChange }) {
  const [addressLoading, setAddressLoading] = useState(false)
  const [addressError, setAddressError] = useState('')
  const markerPos = value.lat && value.lng ? [value.lat, value.lng] : null

  const pickLocation = async (latlng) => {
    const lat = Number(latlng.lat.toFixed(6))
    const lng = Number(latlng.lng.toFixed(6))
    const fallbackAddress = `${lat}, ${lng}`
    onChange({ ...value, lat, lng, mapMark: fallbackAddress, address: fallbackAddress })
    setAddressLoading(true)
    setAddressError('')
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ko`
      const res = await fetch(url)
      if (!res.ok) throw new Error('역지오코딩 실패')
      const data = await res.json()
      const addr = data.display_name || fallbackAddress
      onChange({ ...value, lat, lng, mapMark: `${lat}, ${lng}`, address: addr })
    } catch (e) {
      setAddressError('주소를 불러오지 못해 좌표로 저장했어요.')
    } finally {
      setAddressLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="text-sm font-semibold text-slate-800">사회</div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-800">선택한 위치:</p>
        <p className="mt-1 text-sm text-slate-700">
          {value.address || '지도를 클릭해 마커를 찍어 주세요.'}
        </p>
        {addressLoading && <p className="mt-1 text-xs text-slate-500">주소 확인 중...</p>}
        {addressError && <p className="mt-1 text-xs text-rose-600">{addressError}</p>}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <MapContainer center={[37.5665, 126.978]} zoom={12} className="h-72 w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <SocialMarkerPicker onPick={pickLocation} />
            {markerPos && <Marker position={markerPos} />}
          </MapContainer>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
            <MapPin className="h-4 w-4 text-rose-500" />
            선택한 위치 상세보기
          </div>
          <div className="h-64">
            <MapContainer center={markerPos || [37.5665, 126.978]} zoom={15} className="h-full w-full" key={value.mapMark || 'default'}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markerPos && <Marker position={markerPos} />}
            </MapContainer>
          </div>
        </div>
      </div>
      <textarea
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder="'마왕'을 듣고 왜 이 장소가 떠올랐나요?"
        className="min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
              value={subjectInputs.사회 || { mapMark: '', address: '', lat: null, lng: null, text: '' }}
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
