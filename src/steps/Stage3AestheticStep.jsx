import React from 'react'
import { useAppState } from '../state/AppStateContext.jsx'

const SUMMARY_REASON_OPTIONS = [
  { value: '음색', label: '음색' },
  { value: '반주', label: '반주' },
  { value: '맥락', label: '맥락' },
]

export default function Stage3AestheticStep() {
  const { state, actions } = useAppState()
  const s1 = state.stage1 || {}
  const s3 = state.stage3 || {}

  const keywords = (s1.keywords || []).join(', ')
  const colorsCount = (s1.colors || []).length
  const subjects = (s1.subjectChoices || []).join(', ')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">3단계 (심미적)</h2>
        <p className="mt-2 text-sm text-slate-600">
          이전 단계를 요약한 뒤, 문장을 완성해 보세요.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-2">이전 단계 요약</h3>
        <ul className="text-sm text-slate-700 space-y-1">
          <li><strong>1단계 키워드:</strong> {keywords || '(없음)'}</li>
          <li><strong>선택한 색상:</strong> {colorsCount}개</li>
          <li><strong>교과 통합:</strong> {subjects || '(없음)'}</li>
        </ul>
      </section>

      <section>
        <p className="text-sm font-semibold text-slate-800 mb-2">문장 완성</p>
        <p className="text-slate-700 mb-3">
          처음엔 <span className="font-medium text-slate-900">({keywords || '1단계에서 느낀 점'})</span> 느꼈는데,
          분석 후엔{' '}
          <select
            value={s3.summaryReason || ''}
            onChange={(e) => actions.setField('stage3.summaryReason', e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900"
          >
            <option value="">선택</option>
            {SUMMARY_REASON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {' '}때문에{' '}
          <input
            type="text"
            value={s3.aestheticText || ''}
            onChange={(e) => actions.setField('stage3.aestheticText', e.target.value)}
            placeholder="____라고 느꼈다 (여기를 채우세요)"
            className="inline-block min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          라고 느꼈다.
        </p>
      </section>
    </div>
  )
}
