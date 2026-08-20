import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RotateCcw, Home, Trophy, Medal as MedalIcon, Flame } from 'lucide-react'
import { apiGet } from '../lib/api'
import { getPlayerId } from '../lib/session'
import { subscribeToGame, subscribeToRoom, sendRematch, sendLeave, registerPresence } from '../lib/ws'
import { playLobbyMusic, stopBattleMusic } from '../lib/audio'
import { getPlayerTextColor } from '../lib/playerColors'
import PageShell from '../components/PageShell'
import rankingImage from '../assets/ranking.png'
import type { GameMessage, PlayerRankingDto } from '../types/game'
import type { RoomResponse } from '../types/room'

const AUTO_REMATCH_SECONDS = 10
const MAX_SLOTS = 6

const TIER_BG: Record<number, string> = {
  1: 'bg-[#FFF6DD]',
  2: 'bg-[#F4F5F7]',
  3: 'bg-[#FBEEE3]',
}
// Ribbon-medal emoji — reverted from the coin-badge redesign, per explicit user
// decision that the emoji reads as a "real medal" and the coin badge didn't.
const MEDALS = ['🥇', '🥈', '🥉']

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

function getPraise(
  myRank: number | undefined
): { title: string; subtitle: string; icon: typeof Trophy } {
  if (myRank === 1) return { title: '우승했어요! 최고예요 🏆', subtitle: '압도적인 실력을 보여줬어요!', icon: Trophy }
  if (myRank && myRank <= 3)
    return { title: '메달 획득! 정말 잘했어요 🎉', subtitle: '멋진 실력을 보여줬어요!', icon: MedalIcon }
  return {
    title: '좋은 승부였어요! 🔥',
    subtitle: '다음 배틀에서는 더 높은 순위를 노려봐요!',
    icon: Flame,
  }
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
  const listRef = useRef<HTMLDivElement>(null)
  const [listNaturalHeight, setListNaturalHeight] = useState<number>()

  // The list's own scrollHeight is its true content height (all 6 rows) regardless
  // of how much space the flex layout actually renders it at — capping maxHeight to
  // that value stops it from stretching taller than 6 rows on spacious desktop
  // screens (which left dead white space inside the card), while still letting it
  // shrink below that via overflow-y-auto on short screens.
  useEffect(() => {
    function measure() {
      if (listRef.current) setListNaturalHeight(listRef.current.scrollHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ranking])

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
      {/* h-svh / sm:h-[calc(100vh-4rem)] gives this a real ceiling on mobile, where
          nothing else bounds height — without it, the ranking list's flex-1 below
          has nothing to shrink against on a short screen, so instead of scrolling
          internally the WHOLE PAGE just grows past the viewport. Same lesson as
          Home's mascot and Lobby's room list.

          The bottom padding adds env(safe-area-inset-bottom) on top of the usual
          spacing — iOS Safari's floating bottom bar (and the home-indicator gesture
          area under it) sits in that safe-area strip regardless of svh, so without
          this the rematch/leave buttons render right at the edge of it and end up
          visually clipped by the bar on a real notched iPhone even though nothing
          looks wrong in desktop devtools emulation (which doesn't simulate the
          safe-area inset at all). */}
      <div
        className="flex h-svh w-full flex-col px-6 pt-[var(--result-outer-pad)] sm:h-[calc(100vh-4rem)]"
        style={{ paddingBottom: 'calc(var(--result-outer-pad) + env(safe-area-inset-bottom))' }}
      >
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
              className="absolute z-20 rounded-[1px]"
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
          // justify-center + the list's own measured maxHeight (see listNaturalHeight
          // above): the list is capped to exactly what 6 rows need, so on a spacious
          // desktop screen it no longer stretches into a card with dead white space
          // below row 6 — any true leftover space instead becomes breathing room
          // above the list and below the praise banner. On a short screen the list
          // still has nothing to center around (it already fills the flex-1 area)
          // and falls back to its own overflow-y-auto internal scroll.
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-[var(--result-praise-mt)]">
            <div
              className="min-h-0 flex-1 overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-surface)] shadow-sm"
              style={{ maxHeight: listNaturalHeight }}
            >
            <div ref={listRef} className="divide-y divide-[var(--color-border)]">
              {Array.from({ length: MAX_SLOTS }, (_, i) => {
                const r = ranking[i]
                if (!r) {
                  // Reserved empty slot — keeps the card the same shape regardless of
                  // how many players actually joined (1-6), by explicit request.
                  return (
                    <div key={`empty-${i}`} className="flex items-center gap-2.5 px-3 py-[var(--result-row-pad)] opacity-40">
                      <span className="flex w-[34px] shrink-0 items-center justify-center text-base font-bold text-[var(--color-muted)]">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-[var(--color-muted)]">-</span>
                      <span className="shrink-0 text-base text-[var(--color-muted)]">-</span>
                    </div>
                  )
                }
                const isMe = r.playerId === playerId
                const isTop3 = r.rank <= 3
                const rowTint = isTop3 ? TIER_BG[r.rank] : ''
                return (
                  <div
                    key={r.playerId}
                    className={`flex items-center gap-2.5 px-3 py-[var(--result-row-pad)] ${rowTint} ${
                      r.forfeited ? 'opacity-50' : ''
                    }`}
                  >
                    {isTop3 ? (
                      <span className="flex w-[34px] shrink-0 items-center justify-center text-[28px] leading-none">
                        {MEDALS[r.rank - 1]}
                      </span>
                    ) : (
                      <span className="flex w-[34px] shrink-0 items-center justify-center text-base font-bold text-[var(--color-muted)]">
                        {r.rank}
                      </span>
                    )}
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
                      {r.forfeited && <span className="ml-1 text-xs text-[var(--color-muted)]">(기권)</span>}
                    </span>
                    <span className="shrink-0 text-base font-extrabold text-[var(--color-primary)]">
                      {r.totalScore}점
                    </span>
                  </div>
                )
              })}
            </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-[var(--radius-card)] bg-[#eef4ff] px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                <praise.icon size={18} fill="currentColor" />
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
