import React from 'react'
import { useAppState } from '../state/AppStateContext.jsx'
import { STAGE2_CHARACTER_ANSWERS } from '../state/AppStateContext.jsx'

const SUMMARY_REASON_OPTIONS = [
  { value: '음색', label: '음색' },
  { value: '반주', label: '반주' },
  { value: '맥락', label: '맥락' },
]

const PHENOMENON_EMOJI = {
  폭풍: '⛈️',
  번개: '⚡',
  비: '🌧️',
  눈: '❄️',
  바람: '🌬️',
  파도: '🌊',
  불: '🔥',
  구름: '☁️',
  일몰: '🌇',
  달: '🌙',
  별: '⭐',
  바다: '🌊',
}

const SCHUBERT_TIMBRE_TABLE = {
  해설자: { pitch: '낮음', scale: '단조', rhythm: '보통', timbre: '중간' },
  아버지: { pitch: '낮음', scale: '단조', rhythm: '보통', timbre: '두꺼움' },
  아들: { pitch: '높음', scale: '단조', rhythm: '짧음', timbre: '얇음' },
  마왕: { pitch: '중간', scale: '장조', rhythm: '긺', timbre: '중간' },
}

const SCORE_REF_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Franz_Schubert_-_Erlk%C3%B6nig_-_op._1%2C_D._328_%281815%29_-_first_page.jpg/440px-Franz_Schubert_-_Erlk%C3%B6nig_-_op._1%2C_D._328_%281815%29_-_first_page.jpg'

function ReadonlyField({ label, value, placeholder = '-' }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
        {value || placeholder}
      </div>
    </div>
  )
}

function CompareField({ label, mine, answer }) {
  const ok = mine && answer && mine === answer
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2">
      <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
      <p className="text-sm text-slate-800">내 답: {mine || '-'}</p>
      <p className="text-sm text-slate-600">정답: {answer || '-'}</p>
      <p className={`mt-1 text-xs font-semibold ${ok ? 'text-green-700' : 'text-amber-700'}`}>
        {ok ? '일치' : '비교 필요'}
      </p>
    </div>
  )
}

export default function Stage3AestheticStep() {
  const { state, actions } = useAppState()
  const s1 = state.stage1 || {}
  const s2 = state.stage2 || {}
  const s3 = state.stage3 || {}

  const keywords = (s1.keywords || []).join(', ')
  const subjectInputs = s1.subjectInputs || {}
  const overview = s2.overview || {}
  const timbre = s2.timbre || {}
  const accompaniment = s2.accompaniment || {}
  const selectedSubjects = s1.subjectChoices || []

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
        <div className="space-y-6 text-sm text-slate-700">
          <div>
            <p className="font-semibold text-slate-800 mb-2">1단계 (감각적)</p>
            <div className="space-y-3">
              <ReadonlyField label="키워드" value={keywords} placeholder="(없음)" />

              <div>
                <p className="mb-1 text-xs font-semibold text-slate-600">선택한 색상</p>
                {(s1.colors || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3">
                    {(s1.colors || []).map((c) => (
                      <div key={c} className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1">
                        <span className="h-5 w-5 rounded-full border border-slate-300" style={{ backgroundColor: c }} />
                        <span className="font-mono text-xs text-slate-600">{c}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">(없음)</div>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold text-slate-600">교과 통합</p>
                {selectedSubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map((subject) => (
                      <span key={subject} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{subject}</span>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">(없음)</div>
                )}
              </div>

              {selectedSubjects.includes('체육') && (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">체육</p>
                  {subjectInputs.체육?.photoDataUrl ? (
                    <img src={subjectInputs.체육.photoDataUrl} alt="체육 입력 사진" className="mb-2 h-40 w-full max-w-md rounded-lg border border-slate-200 object-cover" />
                  ) : (
                    <div className="mb-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">촬영한 사진 없음</div>
                  )}
                  <ReadonlyField label="설명" value={subjectInputs.체육?.text?.trim()} placeholder="(미입력)" />
                </div>
              )}

              {selectedSubjects.includes('과학') && (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">과학</p>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                    <span className="text-2xl">{PHENOMENON_EMOJI[subjectInputs.과학?.phenomenon] || '❔'}</span>
                    <span className="text-sm font-medium text-slate-800">{subjectInputs.과학?.phenomenon || '선택 없음'}</span>
                  </div>
                  <ReadonlyField label="설명" value={subjectInputs.과학?.text?.trim()} placeholder="(미입력)" />
                </div>
              )}

              {selectedSubjects.includes('사회') && (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">사회</p>
                  <ReadonlyField
                    label="선택한 위치"
                    value={subjectInputs.사회?.address?.trim() || subjectInputs.사회?.mapMark?.trim()}
                    placeholder="(미입력)"
                  />
                  <div className="mt-2">
                    <ReadonlyField label="설명" value={subjectInputs.사회?.text?.trim()} placeholder="(미입력)" />
                  </div>
                </div>
              )}

              {selectedSubjects.includes('수학') && (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">수학</p>
                  {subjectInputs.수학?.shapeDataUrl ? (
                    <img src={subjectInputs.수학.shapeDataUrl} alt="수학 도형 그리기" className="mb-2 h-40 w-full max-w-md rounded-lg border border-slate-200 object-contain bg-white" />
                  ) : (
                    <div className="mb-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">그린 도형 없음</div>
                  )}
                  <ReadonlyField label="설명" value={subjectInputs.수학?.text?.trim()} placeholder="(미입력)" />
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-800 mb-2">2단계 (분석적)</p>
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <CompareField label="해설자" mine={overview.narrator?.trim()} answer={STAGE2_CHARACTER_ANSWERS.해설자} />
                <CompareField label="아버지" mine={overview.father?.trim()} answer={STAGE2_CHARACTER_ANSWERS.아버지} />
                <CompareField label="아들" mine={overview.son?.trim()} answer={STAGE2_CHARACTER_ANSWERS.아들} />
                <CompareField label="마왕" mine={overview.erlking?.trim()} answer={STAGE2_CHARACTER_ANSWERS.마왕} />
              </div>
              <ReadonlyField label="줄거리" value={overview.plot?.trim()} placeholder="(미입력)" />

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">2-2 음색 인물 1</p>
                  <ReadonlyField label="인물" value={timbre.character1} placeholder="선택 안 함" />
                  <div className="mt-2 grid gap-2 grid-cols-2">
                    <CompareField label="음높이" mine={timbre.c1Pitch} answer={SCHUBERT_TIMBRE_TABLE[timbre.character1]?.pitch} />
                    <CompareField label="음계" mine={timbre.c1Scale} answer={SCHUBERT_TIMBRE_TABLE[timbre.character1]?.scale} />
                    <CompareField label="리듬꼴" mine={timbre.c1Rhythm} answer={SCHUBERT_TIMBRE_TABLE[timbre.character1]?.rhythm} />
                    <CompareField label="음색" mine={timbre.c1Timbre} answer={SCHUBERT_TIMBRE_TABLE[timbre.character1]?.timbre} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">2-2 음색 인물 2</p>
                  <ReadonlyField label="인물" value={timbre.character2} placeholder="선택 안 함" />
                  <div className="mt-2 grid gap-2 grid-cols-2">
                    <CompareField label="음높이" mine={timbre.c2Pitch} answer={SCHUBERT_TIMBRE_TABLE[timbre.character2]?.pitch} />
                    <CompareField label="음계" mine={timbre.c2Scale} answer={SCHUBERT_TIMBRE_TABLE[timbre.character2]?.scale} />
                    <CompareField label="리듬꼴" mine={timbre.c2Rhythm} answer={SCHUBERT_TIMBRE_TABLE[timbre.character2]?.rhythm} />
                    <CompareField label="음색" mine={timbre.c2Timbre} answer={SCHUBERT_TIMBRE_TABLE[timbre.character2]?.timbre} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">오른손 가락선</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-slate-600">내 답</p>
                      {accompaniment.rightCanvasDataUrl ? (
                        <img src={accompaniment.rightCanvasDataUrl} alt="오른손 가락선" className="h-40 w-full rounded-lg border border-slate-200 bg-white object-contain" />
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">작성한 가락선 없음</div>
                      )}
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-slate-600">정답(기준 악보)</p>
                      <img src={SCORE_REF_IMAGE} alt="오른손 기준 악보" className="h-40 w-full rounded-lg border border-slate-200 bg-white object-contain" />
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">왼손 가락선</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-slate-600">내 답</p>
                      {accompaniment.leftCanvasDataUrl ? (
                        <img src={accompaniment.leftCanvasDataUrl} alt="왼손 가락선" className="h-40 w-full rounded-lg border border-slate-200 bg-white object-contain" />
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">작성한 가락선 없음</div>
                      )}
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-slate-600">정답(기준 악보)</p>
                      <img src={SCORE_REF_IMAGE} alt="왼손 기준 악보" className="h-40 w-full rounded-lg border border-slate-200 bg-white object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="font-semibold text-slate-700">2-4 맥락 카드 확인:</span>{' '}
                <span className={s2.contextViewed ? 'text-green-700' : 'text-slate-500'}>
                  {s2.contextViewed ? '완료' : '미완료'}
                </span>
              </div>
            </div>
          </div>
        </div>
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
