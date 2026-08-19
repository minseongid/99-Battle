import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Crown, Check, Gamepad2, Clock, Play, User, Users, Lock } from 'lucide-react'
import { apiGet, apiPatch } from '../lib/api'
import { getNickname, getPlayerId } from '../lib/session'
import {
  subscribeToRoom,
  subscribeToRoomMessages,
  sendReady,
  sendLeave,
  sendQuickMessage,
  sendStartGame,
  registerPresence,
} from '../lib/ws'
import { getPlayerColor, getPlayerTextColor } from '../lib/playerColors'
import { stopLobbyMusic } from '../lib/audio'
import PageShell from '../components/PageShell'
import type { RoomResponse } from '../types/room'
import penguinIcon from '../assets/penguin-icon.png'
import battleStart from '../assets/battle-start.png'

const ROOM_CAPACITY = 6
const BATTLE_START_DISPLAY_MS = 2000
const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6] as const
const EVENT_COUNT_OPTIONS = [2, 4, 6, 8] as const
const MAX_VISIBLE_TOASTS = 6
const TOAST_DURATION_MS = 1800
const QUICK_MESSAGE_BURST = 3
const QUICK_MESSAGE_WINDOW_MS = 4000
const QUICK_MESSAGES = [
  '반가워요~ 👋',
  '레디 눌러줘! ⚡',
  '잘 부탁해요! 😊',
  '화이팅! 🔥',
  '굿굿! 👍',
  '아깝다! 😅',
  '한 판 더! 🔁',
]

interface Toast {
  id: number
  playerId: string
  nickname: string
  message: string
}

function PlayerAvatar({ colorIndex, className }: { colorIndex: number; className: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{ backgroundColor: getPlayerColor(colorIndex) }}
    >
      <img src={penguinIcon} alt="" className="h-full w-full object-contain" />
    </div>
  )
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const playerId = getPlayerId()
  const nickname = getNickname()

  const [room, setRoom] = useState<RoomResponse | null>(null)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [messageLimited, setMessageLimited] = useState(false)
  const [showSoloConfirm, setShowSoloConfirm] = useState(false)
  const [showBattleStart, setShowBattleStart] = useState(false)
  const toastIdRef = useRef(0)
  const sendTimestampsRef = useRef<number[]>([])

  useEffect(() => {
    if (!roomId || !nickname) {
      navigate('/', { replace: true })
      return
    }

    let cancelled = false

    apiGet<RoomResponse>(`/api/rooms/${roomId}`)
      .then((r) => {
        if (!cancelled) setRoom(r)
      })
      .catch(() => {
        if (!cancelled) setError('방을 찾을 수 없습니다.')
      })

    const unsubRoom = subscribeToRoom(roomId, (body) => {
      setRoom(JSON.parse(body) as RoomResponse)
    })

    const unsubMsg = subscribeToRoomMessages(roomId, (body) => {
      const evt = JSON.parse(body) as { playerId: string; nickname: string; message: string }
      const id = ++toastIdRef.current
      setToasts((prev) =>
        [...prev, { id, playerId: evt.playerId, nickname: evt.nickname, message: evt.message }].slice(
          -MAX_VISIBLE_TOASTS
        )
      )
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_DURATION_MS)
    })

    const unsubPresence = registerPresence(roomId, playerId)

    return () => {
      cancelled = true
      unsubRoom()
      unsubMsg()
      unsubPresence()
    }
  }, [roomId, nickname, navigate, playerId])

  useEffect(() => {
    if (!room?.status) return
    if (room.status === 'COUNTDOWN') {
      // Music must cut out the instant the splash appears, not 2s later when
      // GamePage happens to mount — waiting for that made it sound like the
      // lobby track kept playing straight through the battle-start moment.
      stopLobbyMusic()
      setShowBattleStart(true)
      const timer = setTimeout(() => navigate(`/game/${roomId}`, { replace: true }), BATTLE_START_DISPLAY_MS)
      return () => clearTimeout(timer)
    }
    if (room.status === 'IN_PROGRESS') {
      // Covers two cases: (a) landed here directly, e.g. a page refresh mid-game,
      // with no COUNTDOWN transition to react to, and (b) the backend's own
      // COUNTDOWN -> IN_PROGRESS flip (timed to land ~2s after COUNTDOWN, the same
      // delay as the splash timer above) arrives before that local timer fires —
      // its cleanup cancels the pending timer, so this branch must independently
      // navigate rather than relying on a "some effect run already handled it" flag,
      // which would otherwise block IN_PROGRESS from ever firing once COUNTDOWN's
      // branch had already run once.
      navigate(`/game/${roomId}`, { replace: true })
    }
    // Depend only on the status value, not the whole `room` object — a new room
    // broadcast with the SAME status must not re-run this effect and cancel the
    // pending splash timer for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.status, roomId, navigate])

  function handleLeave() {
    if (roomId) sendLeave(roomId, playerId)
    navigate('/lobby?mode=public')
  }

  function handleToggleReady() {
    if (!roomId || !room) return
    const me = room.players.find((p) => p.playerId === playerId)
    sendReady(roomId, playerId, !(me?.ready ?? false))
  }

  function handleSettingsChange(nextMaxPlayers: number, nextMathEventCount: number) {
    if (!roomId || !room) return
    apiPatch(`/api/rooms/${roomId}/settings`, {
      playerId,
      maxPlayers: nextMaxPlayers,
      mathEventCount: nextMathEventCount,
    }).catch(() => {})
  }

  function handleStartClick() {
    if (!roomId || !room) return
    if (room.players.length === 1) {
      setShowSoloConfirm(true)
      return
    }
    sendStartGame(roomId, playerId)
  }

  function confirmSoloStart() {
    if (!roomId) return
    sendStartGame(roomId, playerId)
    setShowSoloConfirm(false)
  }

  function handleQuickMessage(message: string) {
    if (!roomId) return
    const nowTs = Date.now()
    const recent = sendTimestampsRef.current.filter((t) => nowTs - t < QUICK_MESSAGE_WINDOW_MS)
    if (recent.length >= QUICK_MESSAGE_BURST) return

    sendQuickMessage(roomId, playerId, nickname, message)
    recent.push(nowTs)
    sendTimestampsRef.current = recent

    if (recent.length >= QUICK_MESSAGE_BURST) {
      setMessageLimited(true)
      setTimeout(() => {
        sendTimestampsRef.current = sendTimestampsRef.current.filter((t) => Date.now() - t < QUICK_MESSAGE_WINDOW_MS)
        setMessageLimited(sendTimestampsRef.current.length >= QUICK_MESSAGE_BURST)
      }, QUICK_MESSAGE_WINDOW_MS)
    }
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-base font-semibold text-[var(--color-error)]">{error}</p>
          <button type="button" onClick={() => navigate('/')} className="font-semibold text-[var(--color-primary)]">
            홈으로
          </button>
        </div>
      </PageShell>
    )
  }

  if (!room) {
    return (
      <PageShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[var(--color-muted)]">불러오는 중...</p>
        </div>
      </PageShell>
    )
  }

  const me = room.players.find((p) => p.playerId === playerId)
  const isHost = me?.host ?? false
  const isReady = me?.ready ?? false
  const nonHostPlayers = room.players.filter((p) => !p.host)
  const allNonHostReady = nonHostPlayers.length > 0 && nonHostPlayers.every((p) => p.ready)
  const isSolo = room.players.length === 1
  const canStart = isSolo || allNonHostReady

  return (
    <PageShell>
      <div className="relative flex w-full flex-1 flex-col px-5 pt-[var(--room-outer-pad)] pb-[var(--room-outer-pad)]">
        {showBattleStart && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 pb-[22%] backdrop-blur-sm">
            <img
              src={battleStart}
              alt="배틀 시작"
              className="w-[88%] max-w-[380px] animate-[battle-pop_0.5s_ease-out] drop-shadow-2xl"
            />
          </div>
        )}

        <div className="pointer-events-none absolute left-1/2 top-16 z-10 flex w-full -translate-x-1/2 flex-col items-center gap-2 px-5">
          {toasts.map((t) => {
            const senderIndex = room.players.findIndex((p) => p.playerId === t.playerId)
            const color = getPlayerTextColor(senderIndex === -1 ? 0 : senderIndex)
            return (
              <div key={t.id} className="rounded-full bg-[var(--color-ink)] px-4 py-2 shadow-lg">
                <p className="text-sm text-white">
                  <span className="font-bold" style={{ color }}>
                    {t.nickname}
                  </span>
                  <span className="mx-1.5 opacity-50">|</span>
                  {t.message}
                </p>
              </div>
            )
          })}
        </div>

        {showSoloConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-[300px] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-5 shadow-xl">
              <p className="font-bold text-[var(--color-ink)]">혼자 게임을 시작할까요?</p>
              <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                친구가 없어도 바로 게임을 시작할 수 있어요!
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSoloConfirm(false)}
                  className="flex-1 rounded-[var(--radius-card)] bg-[var(--color-bg)] py-2.5 text-sm font-bold text-[var(--color-ink)]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={confirmSoloStart}
                  className="flex-1 rounded-[var(--radius-card)] bg-[var(--color-primary)] py-2.5 text-sm font-bold text-white"
                >
                  게임 시작
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="flex items-end gap-3 pr-1">
          <button
            type="button"
            onClick={handleLeave}
            className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full bg-[var(--color-surface)] shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="min-w-0 flex-1 truncate text-lg font-extrabold text-[var(--color-ink)]">
            {room.roomName}
          </h2>
          <p className="mr-1 flex shrink-0 items-center gap-1 text-xs text-[var(--color-muted)]">
            <Users size={12} />
            {room.players.length} / {room.maxPlayers}
          </p>
        </header>

        <div className="mt-[var(--room-section-gap)] grid grid-cols-3 gap-[var(--room-gap)]">
          {Array.from({ length: ROOM_CAPACITY }).map((_, i) => {
            const p = room.players[i]
            if (p) {
              const isMe = p.playerId === playerId
              return (
                <div key={p.playerId} className="flex flex-col items-center gap-1.5">
                  <div className="relative">
                    <PlayerAvatar
                      colorIndex={i}
                      className={`h-[var(--room-avatar)] w-[var(--room-avatar)] ${
                        isMe ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg)]' : ''
                      }`}
                    />
                    {p.host && (
                      <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-[#F5A623] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Crown size={10} />
                      </span>
                    )}
                    {p.ready && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[var(--color-success)] text-white shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <span className="max-w-full truncate text-xs font-semibold text-[var(--color-ink)]">
                    {p.nickname}
                  </span>
                  {isMe && <span className="text-[10px] font-semibold text-[var(--color-primary)]">나</span>}
                </div>
              )
            }
            const isOpenSlot = i < room.maxPlayers
            return (
              <div key={`slot-${i}`} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-[var(--room-avatar)] w-[var(--room-avatar)] items-center justify-center rounded-full bg-[var(--color-border)] ${
                    isOpenSlot ? '' : 'opacity-40'
                  }`}
                >
                  {isOpenSlot ? (
                    <User size={18} className="text-[var(--color-muted)]" />
                  ) : (
                    <Lock size={16} className="text-[var(--color-muted)]" />
                  )}
                </div>
                <span className="text-xs text-[var(--color-muted)]">{isOpenSlot ? '대기 중' : '잠김'}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-[var(--room-section-gap)] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-[var(--room-pad)] shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[var(--color-primary)]" />
            <span className="text-sm font-bold text-[var(--color-ink)]">최대 인원</span>
            {!isHost && <span className="ml-auto text-[11px] text-[var(--color-muted)]">방장만 변경 가능</span>}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {MAX_PLAYERS_OPTIONS.map((count) => {
              const selected = room.maxPlayers === count
              const tooLowForHost = isHost && count < room.players.length
              const disabled = !isHost || tooLowForHost
              return (
                <button
                  key={count}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSettingsChange(count, room.mathEventCount)}
                  className={`rounded-[var(--radius-card)] border-2 py-[var(--room-btn-sm)] text-sm font-bold transition ${
                    selected
                      ? 'border-[var(--color-primary)] bg-[#eef4ff] text-[var(--color-primary)]'
                      : 'border-transparent bg-[var(--color-bg)] text-[var(--color-ink)]'
                  } ${!isHost ? 'opacity-70' : ''} ${tooLowForHost ? 'opacity-40' : ''}`}
                >
                  {count}명
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-[var(--room-section-gap)] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-[var(--room-pad)] shadow-sm">
          <div className="flex items-center gap-2">
            <Gamepad2 size={16} className="text-[var(--color-primary)]" />
            <span className="text-sm font-bold text-[var(--color-ink)]">스테이지 개수</span>
            {!isHost && <span className="ml-auto text-[11px] text-[var(--color-muted)]">방장만 변경 가능</span>}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {EVENT_COUNT_OPTIONS.map((count) => {
              const selected = room.mathEventCount === count
              return (
                <button
                  key={count}
                  type="button"
                  disabled={!isHost}
                  onClick={() => handleSettingsChange(room.maxPlayers, count)}
                  className={`rounded-[var(--radius-card)] border-2 py-[var(--room-btn-sm)] text-sm font-bold transition ${
                    selected
                      ? 'border-[var(--color-primary)] bg-[#eef4ff] text-[var(--color-primary)]'
                      : 'border-transparent bg-[var(--color-bg)] text-[var(--color-ink)]'
                  } ${!isHost ? 'opacity-70' : ''}`}
                >
                  {count + 1}개
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">선택한 스테이지 개수로 연산 배틀이 진행돼요!</p>
        </div>

        {isHost ? (
          <div className="mt-[var(--room-section-gap)] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-[var(--room-pad)] shadow-sm">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-[#F5A623]" />
              <span className="font-bold text-[var(--color-ink)]">방장</span>
            </div>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              {isSolo
                ? '지금은 혼자예요. 그대로 시작하거나 친구를 기다려보세요!'
                : canStart
                  ? '모두 레디를 완료했어요. 게임을 시작해보세요!'
                  : '모든 팀원이 레디를 완료하면 시작할 수 있어요.'}
            </p>
            <button
              type="button"
              onClick={handleStartClick}
              disabled={!canStart}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--color-primary)] py-[var(--room-btn-lg)] font-bold text-white transition active:scale-[0.98] disabled:bg-[var(--color-bg)] disabled:text-[var(--color-muted)]"
            >
              <Play size={18} />
              게임 시작
            </button>
          </div>
        ) : (
          <div className="mt-[var(--room-section-gap)] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-[var(--room-pad)] shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[var(--color-primary)]" />
              <span className="font-bold text-[var(--color-ink)]">레디</span>
            </div>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              모두 레디하면 방장이 게임을 시작할 수 있어요!
            </p>
            <button
              type="button"
              onClick={handleToggleReady}
              className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-card)] py-[var(--room-btn-lg)] font-bold transition active:scale-[0.98] ${
                isReady
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg)] text-[var(--color-ink)]'
              }`}
            >
              {isReady && <Check size={18} />}
              {isReady ? '레디 완료' : '레디'}
            </button>
          </div>
        )}

        <div className="mt-[var(--room-section-gap)]">
          <h3 className="text-sm font-semibold text-[var(--color-muted)]">빠른 메시지</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_MESSAGES.map((msg) => (
              <button
                key={msg}
                type="button"
                onClick={() => handleQuickMessage(msg)}
                disabled={messageLimited}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-[var(--room-chip-pad)] text-xs font-semibold text-[var(--color-ink)] transition active:scale-[0.98] disabled:opacity-40"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
