import React, { createContext, useContext, useMemo, useReducer } from 'react'

export const STEPS = [
  { id: 'main', title: '메인 (학번/이름)' },
  { id: 'listen', title: '감상 (영상)' },
  { id: 'sensory', title: '1단계 (감각적)' },
  { id: 'analytic-overview', title: '2단계-1 (분석적: 개요)' },
  { id: 'analytic-timbre', title: '2단계-2 (분석적: 음색)' },
  { id: 'analytic-accompaniment', title: '2단계-3 (분석적: 반주)' },
  { id: 'analytic-context', title: '2단계-4 (분석적: 맥락)' },
  { id: 'aesthetic', title: '3단계 (심미적)' },
  { id: 'result', title: '최종 결과 및 평가' },
]

// 1단계 키워드
export const STAGE1_KEYWORDS = ['기쁨', '슬픔', '긴장', '평화', '쓸쓸함', '경쾌', '웅장', '역동적']

// 1단계 색상 팔레트 (2~4개 선택)
export const STAGE1_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#1f2937',
]

// 교과 통합 과목
export const STAGE1_SUBJECTS = ['체육', '과학', '사회', '수학']

// 2단계 등장인물 정답 (비교용)
export const STAGE2_CHARACTER_ANSWERS = {
  해설자: '해설자',
  아버지: '아버지',
  아들: '아들',
  마왕: '마왕',
}

// 2단계 음색 인물 목록
export const STAGE2_TIMBRE_CHARACTERS = ['해설자', '아버지', '아들', '마왕']

// 음색 차원 옵션 (라디오용)
export const STAGE2_TIMBRE_DIMENSIONS = [
  { id: 'pitch', label: '음높이', tooltip: '목소리가 높은지 낮은지에요. 높으면 긴장감, 낮으면 안정감을 줄 수 있어요.' },
  { id: 'scale', label: '음계', tooltip: '장조(밝은 느낌)인지 단조(어두운 느낌)인지에요.' },
  { id: 'rhythm', label: '리듬', tooltip: '박자가 빠른지 느린지, 규칙적인지 불규칙한지에요.' },
  { id: 'timbre', label: '음색', tooltip: '목소리나 악기 소리의 ‘느낌’이에요. 부드러운지 거친지 따뜻한지 차가운지요.' },
]

const initialState = {
  stepIndex: 0,
  student: { id: '', name: '' },
  listen: {},
  stage1: {
    keywords: [],
    colors: [],
    subjectChoices: [],
    subjectInputs: {
      체육: { photoDataUrl: '', text: '' },
      과학: { phenomenon: '', text: '' },
      사회: { mapMark: '', address: '', lat: null, lng: null, text: '' },
      수학: { shapeDataUrl: '', text: '' },
    },
  },
  stage2: {
    overview: {
      narrator: '',
      father: '',
      son: '',
      erlking: '',
      plot: '',
    },
    timbre: {
      character1: '',
      character2: '',
      c1Pitch: '',
      c1Scale: '',
      c1Rhythm: '',
      c1Timbre: '',
      c2Pitch: '',
      c2Scale: '',
      c2Rhythm: '',
      c2Timbre: '',
    },
    accompaniment: { canvasDataUrl: '' },
    contextViewed: false,
  },
  stage3: {
    summaryReason: '',
    aestheticText: '',
  },
  evaluation: {
    scores: null,
    loading: false,
    error: null,
    selfScore: 0,
    teacherComment: '',
  },
}

function setDeepValue(obj, path, value) {
  const keys = path.split('.')
  const next = structuredClone(obj)
  let cur = next
  for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]]
  cur[keys[keys.length - 1]] = value
  return next
}

export function canProceed(state, stepIndex) {
  const stepId = STEPS[stepIndex]?.id
  switch (stepId) {
    case 'main':
      return Boolean(state.student?.id?.trim() && state.student?.name?.trim())
    case 'listen':
      return true
    case 'sensory': {
      const s1 = state.stage1
      const keywordsOk = Array.isArray(s1?.keywords) && s1.keywords.length >= 1
      const colorsOk = Array.isArray(s1?.colors) && s1.colors.length >= 2 && s1.colors.length <= 4
      const subjectChoicesOk = Array.isArray(s1?.subjectChoices) && s1.subjectChoices.length === 2
      if (!keywordsOk || !colorsOk || !subjectChoicesOk) return false
      for (const sub of s1.subjectChoices) {
        const inp = s1.subjectInputs?.[sub]
        if (!inp) return false
        if (sub === '체육' && !inp.text?.trim()) return false
        if (sub === '과학' && (!inp.phenomenon?.trim() || !inp.text?.trim())) return false
        if (sub === '사회' && (!(inp.address?.trim() || inp.mapMark?.trim()) || !inp.text?.trim())) return false
        if (sub === '수학' && !inp.text?.trim()) return false
      }
      return true
    }
    case 'analytic-overview': {
      const o = state.stage2?.overview
      return Boolean(o?.narrator?.trim() && o?.father?.trim() && o?.son?.trim() && o?.erlking?.trim() && o?.plot?.trim())
    }
    case 'analytic-timbre': {
      const t = state.stage2?.timbre
      return Boolean(
        t?.character1 && t?.character2 &&
        t?.c1Pitch && t?.c1Scale && t?.c1Rhythm && t?.c1Timbre &&
        t?.c2Pitch && t?.c2Scale && t?.c2Rhythm && t?.c2Timbre,
      )
    }
    case 'analytic-accompaniment':
      return Boolean(state.stage2?.accompaniment?.canvasDataUrl)
    case 'analytic-context':
      return Boolean(state.stage2?.contextViewed)
    case 'aesthetic':
      return Boolean(state.stage3?.summaryReason && state.stage3?.aestheticText?.trim())
    case 'result':
      return true
    default:
      return false
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return setDeepValue(state, action.path, action.value)
    case 'NEXT_STEP':
      return { ...state, stepIndex: Math.min(state.stepIndex + 1, STEPS.length - 1) }
    case 'PREV_STEP':
      return { ...state, stepIndex: Math.max(state.stepIndex - 1, 0) }
    case 'GO_TO_STEP': {
      const idx = typeof action.stepIndex === 'number' ? action.stepIndex : 0
      return { ...state, stepIndex: Math.min(Math.max(idx, 0), STEPS.length - 1) }
    }
    case 'RESET':
      return structuredClone(initialState)
    case 'SET_EVALUATION_SCORES':
      return setDeepValue(state, 'evaluation.scores', action.payload)
    case 'SET_EVALUATION_LOADING':
      return setDeepValue(state, 'evaluation.loading', action.payload)
    case 'SET_EVALUATION_ERROR':
      return setDeepValue(state, 'evaluation.error', action.payload)
    default:
      return state
  }
}

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions = useMemo(
    () => ({
      setField: (path, value) => dispatch({ type: 'SET_FIELD', path, value }),
      nextStep: () => dispatch({ type: 'NEXT_STEP' }),
      prevStep: () => dispatch({ type: 'PREV_STEP' }),
      goToStep: (stepIndex) => dispatch({ type: 'GO_TO_STEP', stepIndex }),
      reset: () => dispatch({ type: 'RESET' }),
      setEvaluationScores: (payload) => dispatch({ type: 'SET_EVALUATION_SCORES', payload }),
      setEvaluationLoading: (v) => dispatch({ type: 'SET_EVALUATION_LOADING', payload: v }),
      setEvaluationError: (v) => dispatch({ type: 'SET_EVALUATION_ERROR', payload: v }),
    }),
    [],
  )

  const value = useMemo(() => ({ state, actions }), [state, actions])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
