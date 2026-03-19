import React from 'react'
import { AppStateProvider, STEPS, useAppState } from './state/AppStateContext.jsx'
import StepShell from './components/StepShell.jsx'
import MainStep from './steps/MainStep.jsx'
import ListenStep from './steps/ListenStep.jsx'
import Stage1SensoryStep from './steps/Stage1SensoryStep.jsx'
import Stage2AnalyticStep from './steps/Stage2AnalyticStep.jsx'
import Stage3AestheticStep from './steps/Stage3AestheticStep.jsx'
import ResultStep from './steps/ResultStep.jsx'

function StepRouter() {
  const { state } = useAppState()
  const stepId = STEPS[state.stepIndex]?.id

  switch (stepId) {
    case 'main':
      return <MainStep />
    case 'listen':
      return <ListenStep />
    case 'sensory':
      return <Stage1SensoryStep />
    case 'analytic-overview':
      return <Stage2AnalyticStep section="overview" />
    case 'analytic-timbre':
      return <Stage2AnalyticStep section="timbre" />
    case 'analytic-accompaniment':
      return <Stage2AnalyticStep section="accompaniment" />
    case 'analytic-context':
      return <Stage2AnalyticStep section="context" />
    case 'aesthetic':
      return <Stage3AestheticStep />
    case 'result':
      return <ResultStep />
    default:
      return <MainStep />
  }
}

export default function App() {
  return (
    <AppStateProvider>
      <StepShell>
        <StepRouter />
      </StepShell>
    </AppStateProvider>
  )
}

