import React from 'react'
import { ArrowLeft, ArrowRight, Music2, RotateCcw } from 'lucide-react'
import { canProceed, STEPS, useAppState } from '../state/AppStateContext.jsx'

function ProgressDots({ activeIndex }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div
          key={s.id}
          className={[
            'h-2.5 w-2.5 rounded-full transition-all',
            i === activeIndex ? 'bg-slate-900' : 'bg-slate-300',
          ].join(' ')}
          aria-label={`${i + 1}단계: ${s.title}`}
          title={s.title}
        />
      ))}
    </div>
  )
}

export default function StepShell({ children }) {
  const { state, actions } = useAppState()
  const step = STEPS[state.stepIndex]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Music2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">슈베르트의 마왕 음악 감상 학습</div>
              <div className="text-xs text-slate-500">{step?.title ?? ''}</div>
            </div>
          </div>

          <div className="hidden sm:block">
            <ProgressDots activeIndex={state.stepIndex} />
          </div>

          <button
            type="button"
            onClick={actions.reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            초기화
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-4 sm:hidden">
          <ProgressDots activeIndex={state.stepIndex} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={actions.prevStep}
            disabled={state.stepIndex === 0}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold',
              state.stepIndex === 0
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            이전
          </button>

          <div className="text-xs text-slate-500">
            {state.stepIndex + 1} / {STEPS.length}
          </div>

          <button
            type="button"
            onClick={actions.nextStep}
            disabled={state.stepIndex >= STEPS.length - 1 || !canProceed(state, state.stepIndex)}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold',
              state.stepIndex >= STEPS.length - 1 || !canProceed(state, state.stepIndex)
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-slate-900 text-white hover:bg-slate-800',
            ].join(' ')}
          >
            다음
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  )
}

