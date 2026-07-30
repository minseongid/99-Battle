import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Gamepad2 } from 'lucide-react'
import { apiPost } from '../lib/api'
import { getNickname, getPlayerId } from '../lib/session'
import PageShell from '../components/PageShell'
import type { RoomResponse } from '../types/room'

const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6] as const
const EVENT_COUNT_OPTIONS = [2, 4, 6, 8] as const
const ROOM_NAME_MAX_LENGTH = 20

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const nickname = getNickname()
  const defaultRoomName = `${nickname}님의 방`

  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState<number>(6)
  const [mathEventCount, setMathEventCount] = useState<number>(4)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleCreate() {
    setSubmitting(true)
    setError('')
    apiPost<RoomResponse>('/api/rooms', {
      hostPlayerId: getPlayerId(),
      hostNickname: nickname,
      roomName: roomName.trim(),
      maxPlayers,
      mathEventCount,
    })
      .then((room) => navigate(`/room/${room.roomId}`, { replace: true }))
      .catch(() => {
        setError('방을 만들지 못했어요. 다시 시도해주세요.')
        setSubmitting(false)
      })
  }

  return (
    <PageShell>
      <div className="flex w-full flex-col px-5 pt-6 pb-8">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-[var(--color-ink)]">방 만들기</h1>
        </header>

        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="roomName" className="text-sm font-semibold text-[var(--color-ink)]">
            방 이름
          </label>
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5">
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value.slice(0, ROOM_NAME_MAX_LENGTH))}
              placeholder={defaultRoomName}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--color-muted)]"
            />
            <span className="shrink-0 text-xs text-[var(--color-muted)]">
              {roomName.length}/{ROOM_NAME_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[var(--color-primary)]" />
            <span className="font-bold text-[var(--color-ink)]">최대 인원</span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {MAX_PLAYERS_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setMaxPlayers(count)}
                className={`rounded-[var(--radius-card)] border-2 py-2.5 text-sm font-bold transition ${
                  maxPlayers === count
                    ? 'border-[var(--color-primary)] bg-[#eef4ff] text-[var(--color-primary)]'
                    : 'border-transparent bg-[var(--color-bg)] text-[var(--color-ink)]'
                }`}
              >
                {count}명
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Gamepad2 size={18} className="text-[var(--color-primary)]" />
            <span className="font-bold text-[var(--color-ink)]">스테이지 개수</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {EVENT_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setMathEventCount(count)}
                className={`rounded-[var(--radius-card)] border-2 py-2.5 text-sm font-bold transition ${
                  mathEventCount === count
                    ? 'border-[var(--color-primary)] bg-[#eef4ff] text-[var(--color-primary)]'
                    : 'border-transparent bg-[var(--color-bg)] text-[var(--color-ink)]'
                }`}
              >
                {count + 1}개
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            선택한 스테이지 개수로 연산 배틀이 진행돼요!
          </p>
        </div>

        {error && <p className="mt-4 text-sm font-medium text-[var(--color-error)]">{error}</p>}

        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-primary)] py-4 text-base font-bold text-white shadow-[0_8px_20px_-8px_var(--color-primary)] transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? '만드는 중...' : '방 만들기'}
        </button>
      </div>
    </PageShell>
  )
}
