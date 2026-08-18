import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Users, User, ShieldCheck, Play } from 'lucide-react'
import penguinLanding from '../assets/penguin-landing2.png'
import brandLogo from '../assets/brand-logo.png'
import gamestart from '../assets/gamestart.png'
import PageShell from '../components/PageShell'
import { getNickname, setNickname } from '../lib/session'
import { apiGet } from '../lib/api'
import { hasStartedLobbyMusic, playLobbyMusic } from '../lib/audio'
import type { NicknameAvailabilityResponse } from '../types/room'

const NICKNAME_MAX_LENGTH = 10

export default function HomePage() {
  const navigate = useNavigate()
  const [nickname, setNicknameInput] = useState(getNickname())
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [entered, setEntered] = useState(hasStartedLobbyMusic())

  const trimmed = nickname.trim()
  const canStart = trimmed.length > 0

  function handleNicknameChange(value: string) {
    if (value.length > NICKNAME_MAX_LENGTH) return
    setNicknameInput(value)
    if (error) setError('')
  }

  async function commitNickname(): Promise<boolean> {
    if (!canStart) {
      setError('닉네임을 입력해주세요')
      return false
    }
    setChecking(true)
    try {
      const res = await apiGet<NicknameAvailabilityResponse>(
        `/api/rooms/nickname-availability?nickname=${encodeURIComponent(trimmed)}`
      )
      if (!res.available) {
        setError('이미 사용 중인 닉네임이에요')
        return false
      }
    } catch {
      // 확인 실패 시에는 입장 단계의 중복 체크에 맡기고 진행한다
    } finally {
      setChecking(false)
    }
    setNickname(trimmed)
    return true
  }

  async function handleQuickJoin() {
    if (!(await commitNickname())) return
    navigate('/lobby?mode=quick')
  }

  async function handlePublicRooms() {
    if (!(await commitNickname())) return
    navigate('/lobby?mode=public')
  }

  function handleEnter() {
    playLobbyMusic()
    setEntered(true)
  }

  if (!entered) {
    // Rendered as the only content in this state (not layered on top of the main
    // content via an absolute overlay) so the page's natural height is just the
    // gate's own short content — the full home layout below never enters the DOM
    // to inflate the page's scrollable height while the gate is showing.
    return (
      <PageShell>
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-6">
          <img
            src={gamestart}
            alt=""
            className="w-[78%] max-w-[320px] animate-[battle-pop_0.5s_ease-out]"
          />
          <button
            type="button"
            onClick={handleEnter}
            className="flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-primary)] px-8 py-4 text-base font-bold text-white shadow-[0_8px_20px_-8px_var(--color-primary)] transition active:scale-[0.98]"
          >
            <Play size={20} fill="currentColor" />
            게임 시작
          </button>
          <p className="text-sm font-semibold text-[var(--color-muted)]">탭해서 시작해요!</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      {/* h-svh (not dvh) gives this a real ceiling on mobile, where nothing else
          bounds height — without it, flex-1 on the mascot below has nothing to
          shrink against and just renders at its natural size instead of adapting
          to whatever room is actually left over. svh specifically (the SMALL
          viewport, chrome always accounted for) rather than dvh: this page never
          scrolls, so Safari's toolbar never auto-collapses — dvh was leaving a
          gap at the bottom by sizing against the larger toolbar-hidden reference
          it never actually reaches here. */}
      <div className="flex h-svh w-full flex-col px-6 pt-[var(--home-pt)] pb-6 sm:h-[calc(100vh-4rem)]">
        <header className="shrink-0 text-center">
          <img src={brandLogo} alt="99 Battle" className="mx-auto w-[92%] max-w-[380px]" />
          <p className="mt-1 text-base font-semibold text-[var(--color-muted)]">
            수학 연산 배틀로 두뇌력 업그레이드!
          </p>
        </header>

        {/* flex-1 + min-h-0 makes this take exactly whatever space is left over after
            the fixed-size header/input/buttons/footer below, and the image shrinks to
            fit it via object-contain — so the mascot is only ever as large as the
            screen actually allows, instead of a fixed per-breakpoint guess that either
            overflows on a shorter real device or looks tiny on a taller one. */}
        <div className="my-2 flex min-h-0 flex-1 items-center justify-center">
          <img
            src={penguinLanding}
            alt="99 Battle 마스코트"
            className="max-h-full max-w-[var(--home-mascot-size)] object-contain"
          />
        </div>

        <div className="shrink-0 flex flex-col gap-2">
          <div className="flex min-h-[18px] items-center">
            {error && <p className="text-xs font-medium text-[var(--color-error)]">{error}</p>}
          </div>
          <div
            className={`flex items-center gap-3 rounded-[var(--radius-card)] border bg-[var(--color-surface)] px-4 py-3.5 transition-colors ${
              error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
            }`}
          >
            <User
              size={20}
              className={`shrink-0 ${error ? 'text-[var(--color-error)]' : 'text-[var(--color-primary)]'}`}
            />
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="min-w-0 flex-1 bg-transparent pl-3 text-left text-base outline-none placeholder:text-[var(--color-muted)]"
            />
            <span className="shrink-0 text-xs text-[var(--color-muted)]">
              {nickname.length}/{NICKNAME_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="mt-6 flex shrink-0 flex-col gap-3">
          <button
            type="button"
            onClick={handleQuickJoin}
            disabled={checking}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-primary)] py-4 text-base font-bold text-white shadow-[0_8px_20px_-8px_var(--color-primary)] transition active:scale-[0.98] disabled:opacity-60"
          >
            <Zap size={20} fill="currentColor" />
            빠른 입장
          </button>
          <button
            type="button"
            onClick={handlePublicRooms}
            disabled={checking}
            className="flex items-center justify-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] py-4 text-base font-bold text-[var(--color-ink)] transition active:scale-[0.98] disabled:opacity-60"
          >
            <Users size={20} />
            공개방 입장
          </button>
        </div>

        <p className="mt-[var(--home-footer-mt)] flex shrink-0 items-center justify-center gap-1.5 text-center text-xs text-[var(--color-muted)]">
          <ShieldCheck size={14} />
          욕설 및 부정행위는 제재될 수 있습니다.
        </p>
      </div>
    </PageShell>
  )
}
