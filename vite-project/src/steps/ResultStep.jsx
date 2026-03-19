import React, { useEffect, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useAppState } from '../state/AppStateContext.jsx'
import { evaluateLearning } from '../lib/openai.js'

const DIMENSION_KEYS = ['이해력', '창의성', '분석력', '태도']

export default function ResultStep() {
  const { state, actions } = useAppState()
  const pdfRef = useRef(null)
  const { evaluation } = state
  const scores = evaluation?.scores
  const loading = evaluation?.loading
  const error = evaluation?.error

  const runEvaluation = async () => {
    actions.setEvaluationLoading(true)
    actions.setEvaluationError(null)
    try {
      const result = await evaluateLearning(state)
      actions.setEvaluationScores(result)
    } catch (e) {
      actions.setEvaluationError(e.message || '채점 중 오류가 났어요.')
    } finally {
      actions.setEvaluationLoading(false)
    }
  }

  useEffect(() => {
    if (!scores && !loading && !error) runEvaluation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const radarData = scores
    ? DIMENSION_KEYS.map((key) => ({ dimension: key, 점수: scores[key] ?? 0, fullMark: 5 }))
    : []

  const handleDownloadPDF = async () => {
    const el = pdfRef.current
    if (!el) return
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const w = pdf.internal.pageSize.getWidth()
      const h = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'PNG', 10, 10, w - 20, (canvas.height * (w - 20)) / canvas.width)
      pdf.save(`슈베르트_마왕_감상_${state.student?.id || 'result'}.pdf`)
    } catch (e) {
      console.error(e)
      alert('PDF 저장 중 오류가 났어요.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight sm:text-2xl">최종 결과 및 평가</h2>
        <p className="mt-2 text-sm text-slate-600">
          OpenAI로 이해력·창의성·분석력·태도를 5점 만점으로 채점했어요. 방사형 차트로 확인하고 PDF로 저장할 수 있어요.
        </p>
      </div>

      <div ref={pdfRef} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-800">학습자</div>
            <div className="mt-2 text-sm text-slate-700">
              <div>학번: <span className="font-mono">{state.student?.id || '-'}</span></div>
              <div>이름: {state.student?.name || '-'}</div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>채점 중…</span>
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            {error}
            <button
              type="button"
              onClick={runEvaluation}
              className="ml-3 underline font-medium"
            >
              다시 시도
            </button>
          </div>
        )}
        {scores && radarData.length > 0 && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar name="채점" dataKey="점수" stroke="#1e40af" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {scores && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {DIMENSION_KEYS.map((key) => (
              <div key={key} className="rounded-lg bg-slate-100 px-3 py-2">
                <span className="font-semibold text-slate-800">{key}</span>
                <span className="ml-2 text-slate-600">{scores[key] ?? 0} / 5</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          결과 PDF 다운로드
        </button>
        <span className="text-xs text-slate-500">위 결과 영역이 PDF로 저장돼요.</span>
      </div>
    </div>
  )
}
