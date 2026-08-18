import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RotateCcw, Home, Crown } from 'lucide-react'
import { apiGet } from '../lib/api'
import { getPlayerId } from '../lib/session'
import { subscribeToGame, subscribeToRoom, sendRematch, sendLeave, registerPresence } from '../lib/ws'
import { playLobbyMusic, stopBattleMusic } from '../lib/audio'
import { getPlayerColor, getPlayerTextColor } from '../lib/playerColors'
import PageShell from '../components/PageShell'
import penguinIcon from '../assets/penguin-icon.png'
import rankingImage from '../assets/ranking.png'
import type { GameMessage, PlayerRankingDto } from '../types/game'
import type { RoomResponse } from '../types/room'

const AUTO_REMATCH_SECONDS = 10

const TIER_BG: Record<number, string> = {
  1: 'bg-[#FFF6DD]',
  2: 'bg-[#F4F5F7]',
  3: 'bg-[#FBEEE3]',
}
// Gradient stops for a clean coin-style medal (no ribbon) — highlight, base, shade.
const MEDAL_COLORS: Record<number, [string, string, string]> = {
  1: ['#FFEBA6', '#FFD34E', '#F5A623'],
  2: ['#F2F4F6', '#E3E7ED', '#B0B8C4'],
  3: ['#F4CBA3', '#E8A768', '#C97A3E'],
}

function Medal({ rank, size }: { rank: number; size: number }) {
  const [hi, base, shade] = MEDAL_COLORS[rank]
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: `radial-gradient(circle at 35% 30%, ${hi}, ${base} 55%, ${shade} 100%)`,
      }}
    >
      {rank}
    </span>
  )
}

const CONFETTI: Array<{ top: string; left: string; rotate: number; color: string; size: number }> = [
  { top: '4%', left: '10%', rotate: -20, color: '#F5A623', size: 8 },
  { top: '12%', left: '86%', rotate: 15, color: '#0064fe', size: 7 },
  { top: '58%', left: '4%', rotate: 35, color: '#22c55e', size: 8 },
  { top: '72%', left: '92%', rotate: -25, color: '#F472B6', size: 7 },
  { top: '0%', left: '48%', rotate: 10, color: '#2f7bff', size: 6 },
  { top: '82%', left: '18%', rotate: -10, color: '#F5A623', size: 7 },
  { top: '8%', left: '68%', rotate: 25, color: '#22c55e', size: 6 },
  { top: '86%', left: '72%', rotate: 15, color: '#0064fe', size: 8 },
]

function getPraise(myRank: number | undefined): { title: string; subtitle: string } {
  if (myRank === 1) return { title: '우승했어요! 최고예요 🏆', subtitle: '압도적인 실력을 보여줬어요!' }
  if (myRank && myRank <= 3) return { title: '메달 획득! 정말 잘했어요 🎉', subtitle: '멋진 실력을 보여줬어요!' }
  return { title: '모두 수고했어요! 💪', subtitle: '다음엔 더 높은 순위에 도전해봐요!' }
}

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
    // Result screen is deliberately silent — battle music already stopped when
    // GamePage unmounted, this just covers any edge case where it didn't. Lobby
    // music resumes only once the player actually acts (rematch, leave, or the
    // auto-timeout standing in for a rematch click), not just from being here.
    stopBattleMusic()
  }, [])

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
      playLobbyMusic()
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
    playLobbyMusic()
    sendRematch(roomId, playerId, true)
  }

  function handleLeave() {
    if (!roomId) return
    votedRef.current = true
    playLobbyMusic()
    sendLeave(roomId, playerId)
    navigate('/lobby?mode=public')
  }

  if (!roomId) {
    navigate('/', { replace: true })
    return null
  }

  const myRank = ranking?.find((r) => r.playerId === playerId)?.rank
  const praise = getPraise(myRank)

  return (
    <PageShell>
      <div className="flex w-full flex-1 flex-col px-6 pt-[var(--result-outer-pad)] pb-[var(--result-outer-pad)]">
        {/* Grows to fill whatever's left over, floored by min-height so it doesn't
            collapse on mobile — but ALSO capped by max-height. Without that cap, a
            very tall screen would grow this box far past what a 300px-wide image
            can fill at its own aspect ratio; object-contain then has to satisfy an
            oversized height AND a capped width at once, and shrinks to whichever is
            smaller, leaving a dead gap around the (still small) image. Capping the
            box near the image's own proportions means there's no excess to leave
            empty in the first place. */}
        <div
          className="relative mx-auto flex min-h-0 w-full flex-1 items-center justify-center"
          style={{ minHeight: 'var(--result-hero-h)', maxHeight: 'var(--result-hero-max-h)' }}
        >
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="absolute rounded-[1px]"
              style={{
                top: c.top,
                left: c.left,
                width: c.size,
                height: c.size * 1.6,
                backgroundColor: c.color,
                transform: `rotate(${c.rotate}deg)`,
              }}
            />
          ))}
          <img src={rankingImage} alt="" className="relative z-10 h-full max-w-full object-contain" />
        </div>

        {!ranking ? (
          <div className="flex shrink-0 items-center justify-center py-6">
            <p className="text-[var(--color-muted)]">불러오는 중...</p>
          </div>
        ) : (
          <div className="flex shrink-0 flex-col gap-[var(--result-praise-mt)]">
            <div
              className="min-h-0 divide-y divide-[var(--color-border)] overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-surface)] shadow-sm"
              style={{ maxHeight: 'var(--result-list-max-h)' }}
            >
              {ranking.map((r) => {
                const isMe = r.playerId === playerId
                const isTop3 = r.rank <= 3
                const rowTint = isMe ? 'bg-[#eef4ff]' : isTop3 ? TIER_BG[r.rank] : ''
                return (
                  <div
                    key={r.playerId}
                    className={`flex items-center gap-2.5 px-3 py-[var(--result-row-pad)] ${rowTint} ${
                      r.forfeited ? 'opacity-50' : ''
                    }`}
                  >
                    {isTop3 ? (
                      <Medal rank={r.rank} size={34} />
                    ) : (
                      <span className="flex w-[34px] shrink-0 items-center justify-center text-base font-bold text-[var(--color-muted)]">
                        {r.rank}
                      </span>
                    )}
                    <div
                      className={`flex shrink-0 items-center justify-center rounded-full ${
                        isTop3 ? 'h-11 w-11' : 'h-9 w-9'
                      }`}
                      style={{ backgroundColor: getPlayerColor(r.colorIndex) }}
                    >
                      <img src={penguinIcon} alt="" className="h-full w-full object-contain" />
                    </div>
                    <span
                      className={`min-w-0 flex-1 truncate font-bold ${isTop3 ? 'text-base' : 'text-sm'}`}
                      style={{ color: getPlayerTextColor(r.colorIndex) }}
                    >
                      {r.nickname}
                      {isMe && <span className="ml-1 text-[var(--color-muted)]">(나)</span>}
                      {r.forfeited && <span className="ml-1 text-xs text-[var(--color-muted)]">(기권)</span>}
                    </span>
                    <span
                      className={`shrink-0 font-extrabold text-[var(--color-primary)] ${
                        isTop3 ? 'text-lg' : 'text-base'
                      }`}
                    >
                      {r.totalScore}점
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-[var(--radius-card)] bg-[#eef4ff] px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                <Crown size={18} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[var(--color-ink)]">{praise.title}</p>
                <p className="truncate text-xs text-[var(--color-muted)]">{praise.subtitle}</p>
              </div>
            </div>
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
              <Home size={16} />
              나가기
            </button>
            <button
              type="button"
              onClick={handleRematch}
              disabled={voted}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--color-primary)] py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_var(--color-primary)] transition active:scale-[0.98] disabled:opacity-60"
            >
              <RotateCcw size={16} />
              {voted ? '대기 중...' : '한번 더 하기'}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
