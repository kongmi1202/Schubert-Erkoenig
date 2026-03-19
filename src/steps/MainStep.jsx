import React from 'react'
import { useAppState } from '../state/AppStateContext.jsx'

function Field({ label, value, onChange, placeholder, required }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none ring-slate-900/10 focus:ring-4"
      />
    </label>
  )
}

export default function MainStep() {
  const { state, actions } = useAppState()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">시작하기</h1>
        <p className="mt-2 text-sm text-slate-600">
          학번과 이름을 입력한 뒤 다음으로 진행하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="학번"
          value={state.student.id}
          onChange={(v) => actions.setField('student.id', v)}
          placeholder="예: 20261234"
          required
        />
        <Field
          label="이름"
          value={state.student.name}
          onChange={(v) => actions.setField('student.name', v)}
          placeholder="예: 홍길동"
          required
        />
      </div>
    </div>
  )
}
