const API_BASE = 'https://api.openai.com/v1'

export async function chatCompletion(messages, { apiKey = import.meta.env.VITE_OPENAI_API_KEY } = {}) {
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.')
  }
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `API error ${res.status}`)
  }
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  return text || ''
}

/** 줄거리 서술 도우미: 사용자 초안을 받아 보완 문장 제안 */
export async function getPlotHelperSuggestion(userDraft) {
  const text = await chatCompletion([
    {
      role: 'system',
      content: '당신은 초등학생이 쓴 "슈베르트의 마왕" 줄거리 초안을 읽고, 같은 말을 더 잘 다듬어 주는 친절한 선생님입니다. 2~3문장으로만 보완된 예시를 제시하세요. 다른 내용을 덧붙이지 말고, 학생의 의도를 유지한 채 문장만 다듬어 주세요.',
    },
    { role: 'user', content: userDraft || '(아직 적지 않았어요)' },
  ])
  return text
}

/** 줄거리 정답 비교: 학생 답과 핵심 정답을 비교해 코멘트 제공 */
export async function getPlotComparisonComment(userPlot) {
  const canonicalAnswer = [
    '밤중에 아버지가 아픈 아들을 데리고 말을 타고 달린다.',
    '아들은 마왕이 자신을 유혹하고 위협한다고 말하지만, 아버지는 안개나 바람 같은 자연현상으로 설명한다.',
    '끝내 목적지에 도착했을 때 아들은 이미 죽어 있다.',
  ].join(' ')

  const text = await chatCompletion([
    {
      role: 'system',
      content:
        '당신은 초등 음악 수업 교사입니다. 학생 줄거리와 정답 핵심을 비교해 피드백을 작성하세요. 출력 형식은 반드시 3줄: 1) 일치한 내용 2) 빠진 핵심 3) 한 줄 조언. 각 줄은 30자 내외의 짧은 한국어 문장으로 작성하세요.',
    },
    {
      role: 'user',
      content: `정답 핵심: ${canonicalAnswer}\n학생 답: ${userPlot || '(미입력)'}`,
    },
  ])
  return text
}

/** 4항목 평가: 이해력, 창의성, 분석력, 태도 각 5점 만점 */
export async function evaluateLearning(state) {
  const summary = [
    '1단계(감각):',
    `키워드: ${(state.stage1?.keywords || []).join(', ')}`,
    `색상 수: ${(state.stage1?.colors || []).length}개`,
    `교과: ${(state.stage1?.subjectChoices || []).join(', ')}`,
    '2단계(분석):',
    `등장인물: ${JSON.stringify(state.stage2?.overview || {})}`,
    `줄거리: ${(state.stage2?.overview?.plot || '').slice(0, 300)}`,
    `음색 선택: ${JSON.stringify(state.stage2?.timbre || {})}`,
    '3단계(심미):',
    `이유: ${state.stage3?.summaryReason}, 내용: ${(state.stage3?.aestheticText || '').slice(0, 200)}`,
  ].join('\n')

  const text = await chatCompletion([
    {
      role: 'system',
      content: `당신은 음악 감상 학습을 평가하는 선생님입니다. 아래 학습자의 응답 요약을 보고, 다음 4가지 항목을 각각 1~5점으로 채점한 뒤, 반드시 아래 JSON 형식만 출력하세요. 다른 설명은 하지 마세요.
{"이해력": 숫자, "창의성": 숫자, "분석력": 숫자, "태도": 숫자}
각 항목: 이해력(내용 이해도), 창의성(자유연상·연결), 분석력(구조·요소 파악), 태도(성실성·참여).`,
    },
    { role: 'user', content: summary },
  ])

  try {
    const parsed = JSON.parse(text.replace(/```json?\s*|\s*```/g, '').trim())
    return {
      이해력: clamp(parsed.이해력, 1, 5),
      창의성: clamp(parsed.창의성, 1, 5),
      분석력: clamp(parsed.분석력, 1, 5),
      태도: clamp(parsed.태도, 1, 5),
    }
  } catch {
    return { 이해력: 3, 창의성: 3, 분석력: 3, 태도: 3 }
  }
}

function clamp(n, min, max) {
  const v = Number(n)
  if (!Number.isFinite(v)) return min
  return Math.min(max, Math.max(min, Math.round(v)))
}
