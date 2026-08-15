import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RotateCcw, LogOut } from 'lucide-react'
import { apiGet } from '../lib/api'
import { getPlayerId } from '../lib/session'
import { subscribeToGame, subscribeToRoom, sendRematch, sendLeave, registerPresence } from '../lib/ws'
import { getPlayerColor, getPlayerTextColor } from '../lib/playerColors'
import PageShell from '../components/PageShell'
import penguinIcon from '../assets/penguin-icon.png'
import type { GameMessage, PlayerRankingDto } from '../types/game'
import type { RoomResponse } from '../types/room'

const AUTO_REMATCH_SECONDS = 5
const MEDALS = ['🥇', '🥈', '🥉']

export default function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const playerId = getPlayerId()

  const [ranking, setRanking] = useState<PlayerRankingDto[] | null>(null)
  const [countdown, setCountdown] = useState(AUTO_REMATCH_SECONDS)
  const [voted, setVoted] = useState(false)
  const navigatedRef = useRef(false)
  const votedRef = useRef(false)

  useEffect(() => {
    if (!roomId) return
    let cancelled = false

    apiGet<GameMessage | null>(`/api/rooms/${roomId}/game-state`)
      .then((snapshot) => {
        if (!cancelled && snapshot?.finalRanking) setRanking(snapshot.finalRanking)
      })
      .catch(() => {})

    const unsubGame = subscribeToGame(roomId, (body) => {
      const msg = JSON.parse(body) as GameMessage
      if (msg.phase === 'GAME_END' && msg.finalRanking) setRanking(msg.finalRanking)
    })

    const unsubRoom = subscribeToRoom(roomId, (body) => {
      const room = JSON.parse(body) as RoomResponse
      if (room.status !== 'IN_PROGRESS' && !navigatedRef.current) {
        navigatedRef.current = true
        navigate(`/room/${roomId}`, { replace: true })
      }
    })

    const unsubPresence = registerPresence(roomId, playerId)

    return () => {
      cancelled = true
      unsubGame()
      unsubRoom()
      unsubPresence()
    }
  }, [roomId, navigate, playerId])

  useEffect(() => {
    if (!roomId || votedRef.current) return
    if (countdown <= 0) {
      votedRef.current = true
      setVoted(true)
      sendRematch(roomId, playerId, true)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, roomId, playerId])

  function handleRematch() {
    if (!roomId || votedRef.current) return
    votedRef.current = true
    setVoted(true)
    sendRematch(roomId, playerId, true)
  }

  function handleLeave() {
    if (!roomId) return
    votedRef.current = true
    sendLeave(roomId, playerId)
    navigate('/lobby?mode=public')
  }

  if (!roomId) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <PageShell>
      <div className="flex w-full flex-1 flex-col px-6 pt-[var(--result-outer-pad)] pb-[var(--result-outer-pad)]">
        <header className="shrink-0 text-center">
          <h2 className="text-xl font-extrabold text-[var(--color-ink)]">게임 종료!</h2>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">최종 순위를 확인해보세요</p>
        </header>

        {!ranking ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[var(--color-muted)]">불러오는 중...</p>
          </div>
        ) : (
          <div className="mt-[var(--result-list-mt)] flex flex-1 flex-col justify-center gap-1.5 overflow-y-auto">
            {ranking.map((r) => {
              const isMe = r.playerId === playerId
              const medal = r.rank <= 3 ? MEDALS[r.rank - 1] : null
              return (
                <div
                  key={r.playerId}
                  className={`flex items-center gap-2.5 rounded-[var(--radius-card)] px-3 py-[var(--result-row-pad)] ${
                    isMe ? 'bg-[#eef4ff] ring-2 ring-[var(--color-primary)]' : 'bg-[var(--color-surface)] shadow-sm'
                  } ${r.forfeited ? 'opacity-50' : ''}`}
                >
                  <span className="flex w-7 shrink-0 items-center justify-center text-lg font-extrabold text-[var(--color-muted)]">
                    {medal ?? r.rank}
                  </span>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: getPlayerColor(r.colorIndex) }}
                  >
                    <img src={penguinIcon} alt="" className="h-full w-full object-contain" />
                  </div>
                  <span
                    className="min-w-0 flex-1 truncate text-sm font-bold"
                    style={{ color: getPlayerTextColor(r.colorIndex) }}
                  >
                    {r.nickname}
                    {isMe && <span className="ml-1 text-[var(--color-muted)]">(나)</span>}
                    {r.forfeited && <span className="ml-1 text-xs text-[var(--color-muted)]">(기권)</span>}
                  </span>
                  <span className="shrink-0 text-base font-extrabold text-[var(--color-ink)]">{r.totalScore}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-3 shrink-0">
          <p className="mb-2 text-center text-xs text-[var(--color-muted)]">
            {voted
              ? '다른 플레이어를 기다리는 중이에요...'
              : `${countdown}초 후 자동으로 다시 하기가 선택돼요`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleLeave}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 text-sm font-bold text-[var(--color-ink)] transition active:scale-[0.98]"
            >
              <LogOut size={16} />
              방 나가기
            </button>
            <button
              type="button"
              onClick={handleRematch}
              disabled={voted}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--color-primary)] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_var(--color-primary)] transition active:scale-[0.98] disabled:opacity-60"
            >
              <RotateCcw size={16} />
              {voted ? '대기 중...' : '다시 하기'}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
