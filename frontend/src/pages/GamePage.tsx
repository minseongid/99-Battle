import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Triangle, TrendingUp, Dices, ChevronsUp, Radical, Divide, Equal, Hash, Asterisk } from 'lucide-react'
import { apiGet } from '../lib/api'
import { getPlayerId } from '../lib/session'
import { subscribeToGame, sendAnswer, registerPresence } from '../lib/ws'
import { playBattleMusic, stopBattleMusic } from '../lib/audio'
import { getPlayerTextColor } from '../lib/playerColors'
import PageShell from '../components/PageShell'
import CustomKeypad from '../components/CustomKeypad'
import type { GameMessage, MathCategory } from '../types/game'

const MAX_INPUT_LENGTH = 6

const CATEGORY_ICON: Record<MathCategory, typeof Triangle> = {
  TRIGONOMETRY: Triangle,
  SEQUENCE: TrendingUp,
  PROBABILITY: Dices,
  POWERS: ChevronsUp,
  ROOTS: Radical,
  FRACTION: Divide,
  EQUATION: Equal,
  DIVISOR: Hash,
  MULTIPLE: Asterisk,
}

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const playerId = getPlayerId()

  const [message, setMessage] = useState<GameMessage | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [now, setNow] = useState(Date.now())
  const questionKeyRef = useRef<string>('')
  const timerKeyRef = useRef<string>('')
  // The progress bar's own local anchor for "when this question started," set once
  // per question the instant the client receives it — deliberately NOT the same
  // clock reference as message.questionStartAtEpochMs. Comparing that server epoch
  // against the client's Date.now() desyncs the bar whenever the two clocks drift
  // (common on real devices without tight NTP sync), and at FAST_TEST_MODE's 1s
  // limits even a few hundred ms of skew is a highly visible chunk of the bar.
  // Anchoring both sides of the subtraction to the client's own clock keeps the
  // animation self-consistent; the only remaining offset is network/render
  // latency (tens of ms), not clock skew (which can be seconds).
  const localQuestionStartRef = useRef<number>(Date.now())

  useEffect(() => {
    playBattleMusic()
    return () => stopBattleMusic()
  }, [])

  useEffect(() => {
    if (!roomId) return
    let cancelled = false

    apiGet<GameMessage | null>(`/api/rooms/${roomId}/game-state`)
      .then((snapshot) => {
        if (!cancelled && snapshot) setMessage(snapshot)
      })
      .catch(() => {})

    const unsub = subscribeToGame(roomId, (body) => {
      const msg = JSON.parse(body) as GameMessage
      setMessage(msg)
    })
    const unsubPresence = registerPresence(roomId, playerId)

    return () => {
      cancelled = true
      unsub()
      unsubPresence()
    }
  }, [roomId, playerId])

  useEffect(() => {
    if (!message) return
    const key = `${message.phase}-${message.segmentIndex}-${message.questionIndex}`
    if (message.phase === 'QUESTION' && key !== questionKeyRef.current) {
      questionKeyRef.current = key
      setInputValue('')
      setSubmitted(false)
    }
    if (message.phase === 'GAME_END' && roomId) {
      navigate(`/result/${roomId}`, { replace: true })
    }
  }, [message, roomId, navigate])

  useEffect(() => {
    if (message?.phase !== 'QUESTION') return
    const interval = setInterval(() => setNow(Date.now()), 50)
    return () => clearInterval(interval)
  }, [message?.phase])

  if (!roomId) {
    navigate('/', { replace: true })
    return null
  }

  if (!message) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[var(--color-muted)]">불러오는 중...</p>
        </div>
      </PageShell>
    )
  }

  function handleInput(char: string) {
    setInputValue((prev) => {
      const negative = prev.startsWith('-')
      const body = negative ? prev.slice(1) : prev
      if (body.length >= MAX_INPUT_LENGTH) return prev
      if (char === '/' && body.includes('/')) return prev
      return (negative ? '-' : '') + body + char
    })
  }

  function handleBackspace() {
    setInputValue((prev) => prev.slice(0, -1))
  }

  function handleToggleSign() {
    setInputValue((prev) => (prev.startsWith('-') ? prev.slice(1) : prev.length > 0 ? '-' + prev : prev))
  }

  function handleSubmit() {
    if (!inputValue || submitted || !roomId) return
    sendAnswer(roomId, playerId, inputValue)
    setSubmitted(true)
  }

  if (message.phase === 'EVENT_INTRO') {
    const category = message.eventCategory
    const Icon = category ? CATEGORY_ICON[category] : Triangle
    return (
      <PageShell>
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef4ff] text-[var(--color-primary)]">
            <Icon size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--color-ink)]">{message.segmentLabel}</h2>
          <p className="text-sm font-semibold text-[var(--color-muted)]">{message.segmentDescription}</p>
        </div>
      </PageShell>
    )
  }

  if (message.phase === 'RESULT') {
    const results = message.results ?? []
    const mine = results.find((r) => r.playerId === playerId)
    return (
      <PageShell>
        {/* Extra bottom padding covers env(safe-area-inset-bottom) so the keypad's
            confirm button never ends up under iOS Safari's floating bottom bar on a
            real notched iPhone — invisible in desktop devtools emulation, which
            doesn't simulate the inset. */}
        <div
          className="flex w-full flex-1 flex-col px-5 pt-[var(--game-outer-pad)]"
          style={{ paddingBottom: 'calc(var(--game-outer-pad) + env(safe-area-inset-bottom))' }}
        >
          <div className="flex shrink-0 flex-col items-center gap-1 text-center">
            <p className="text-sm font-semibold text-[var(--color-muted)]">정답</p>
            <p className="text-4xl font-extrabold text-[var(--color-ink)]">{message.correctAnswerDisplay}</p>
            {mine && (
              <p
                className={`mt-1 text-base font-extrabold ${
                  mine.correct ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                }`}
              >
                {mine.timedOut ? '시간 초과!' : mine.correct ? '정답이에요!' : '틀렸어요!'}
                <span className="ml-2 text-sm">
                  {mine.pointsDelta >= 0 ? '+' : ''}
                  {mine.pointsDelta}
                </span>
              </p>
            )}
          </div>

          {/* Styled to match the final Result screen's ranking rows (same row
              padding, font sizes, "나" badge) minus the medal icon and gold/
              silver/bronze tint — ranks here are still provisional mid-game,
              so looking "final" would be misleading. */}
          <div className="mt-4 min-h-0 flex-1 divide-y divide-[var(--color-border)] overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-surface)] shadow-sm">
            {results.map((r) => {
              const isMe = r.playerId === playerId
              return (
                <div key={r.playerId} className="flex items-center gap-2.5 px-3 py-[var(--result-row-pad)]">
                  <span className="flex w-[34px] shrink-0 items-center justify-center text-base font-bold text-[var(--color-muted)]">
                    {r.rank}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-sm font-bold"
                    style={{ color: getPlayerTextColor(r.colorIndex) }}
                  >
                    {r.nickname}
                    {isMe && (
                      <span className="ml-1.5 rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">
                        나
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-base font-extrabold text-[var(--color-primary)]">
                    {r.totalScore}점
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </PageShell>
    )
  }

  // QUESTION phase
  // Setting the ref here — during render, not inside a useEffect — is deliberate:
  // an effect only runs AFTER this component has already painted once with the
  // new question's data but the OLD ref value, so the bar would flash to ~0%
  // (computed against the previous question's stale start time) for one frame
  // before the effect corrects it on the next tick — exactly the "snaps back to
  // full very fast" glitch this was built to fix. Updating the ref inline means
  // the very first render of a new question already uses the correct start time.
  const timerKey = `${message.segmentIndex}-${message.questionIndex}`
  if (timerKey !== timerKeyRef.current) {
    timerKeyRef.current = timerKey
    localQuestionStartRef.current = Date.now()
  }
  const timeLimitMs = (message.timeLimitSeconds ?? 5) * 1000
  const remainingMs = Math.max(0, timeLimitMs - (now - localQuestionStartRef.current))
  const remainingPct = Math.max(0, Math.min(100, (remainingMs / timeLimitMs) * 100))
  const isUrgent = remainingPct < 30

  return (
    <PageShell>
      <div className="flex w-full flex-1 flex-col px-5 pt-[var(--game-outer-pad)] pb-[var(--game-outer-pad)]">
        <div className="flex shrink-0 items-center justify-between text-xs font-semibold text-[var(--color-muted)]">
          <span>{message.segmentLabel}</span>
          <span>
            {(message.questionIndex ?? 0) + 1} / {message.questionsInSegment}
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full shrink-0 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className={`h-full rounded-full transition-[width] duration-75 ease-linear ${
              isUrgent ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'
            }`}
            style={{ width: `${remainingPct}%` }}
          />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-[var(--game-question-my)]">
          <p
            className="whitespace-pre-line text-center font-extrabold text-[var(--color-ink)]"
            style={{ fontSize: 'var(--game-question-text)' }}
          >
            {message.questionText}
          </p>
          <div className="flex h-12 min-w-[8rem] items-center justify-center rounded-[var(--radius-card)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-5">
            <span className="text-2xl font-bold tracking-wide text-[var(--color-primary)]">
              {inputValue || ' '}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <CustomKeypad
            variant={message.answerType ?? 'NUMBER'}
            value={inputValue}
            onInput={handleInput}
            onBackspace={handleBackspace}
            onToggleSign={handleToggleSign}
            onSubmit={handleSubmit}
            disabled={submitted}
          />
        </div>
      </div>
    </PageShell>
  )
}
