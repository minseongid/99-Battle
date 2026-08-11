import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Users, RefreshCw, Plus, Lightbulb, DoorOpen } from 'lucide-react'
import { apiGet, apiPost } from '../lib/api'
import { getNickname, getPlayerId } from '../lib/session'
import { subscribeToPublicRooms } from '../lib/ws'
import PageShell from '../components/PageShell'
import type { PublicRoomSummary, RoomResponse } from '../types/room'

export default function LobbyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const mode = params.get('mode') === 'public' ? 'public' : 'quick'
  const nickname = getNickname()

  const [rooms, setRooms] = useState<PublicRoomSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!nickname) {
      navigate('/', { replace: true })
      return
    }
    if (mode === 'quick') {
      apiPost<RoomResponse>('/api/rooms/quick-match', { playerId: getPlayerId(), nickname })
        .then((room) => navigate(`/room/${room.roomId}`, { replace: true }))
        .catch((err: Error) => setError(err.message))
    } else {
      loadPublicRooms()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  useEffect(() => {
    if (mode !== 'public') return
    return subscribeToPublicRooms((body) => {
      setRooms(JSON.parse(body) as PublicRoomSummary[])
    })
  }, [mode])

  function loadPublicRooms() {
    setLoading(true)
    setError('')
    apiGet<PublicRoomSummary[]>('/api/rooms/public')
      .then(setRooms)
      .catch(() => setError('공개방 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }

  function joinRoom(roomId: string) {
    setError('')
    apiPost<RoomResponse>(`/api/rooms/${roomId}/join`, { playerId: getPlayerId(), nickname })
      .then((room) => navigate(`/room/${room.roomId}`))
      .catch((err: Error) => setError(err.message))
  }

  if (mode === 'quick') {
    if (error) {
      return (
        <PageShell>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
              <DoorOpen size={28} className="text-[var(--color-muted)]" />
            </div>
            <p className="text-base font-semibold text-[var(--color-ink)]">{error}</p>
            <div className="mt-2 flex w-full max-w-[280px] flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/lobby?mode=public')}
                className="rounded-[var(--radius-card)] bg-[var(--color-primary)] py-3.5 text-sm font-bold text-white active:scale-[0.98]"
              >
                공개방 목록 보기
              </button>
              <button
                type="button"
                onClick={() => navigate('/lobby/create')}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 text-sm font-bold text-[var(--color-ink)] active:scale-[0.98]"
              >
                방 만들기
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-1 py-2 text-sm font-semibold text-[var(--color-muted)]"
              >
                홈으로
              </button>
            </div>
          </div>
        </PageShell>
      )
    }
    return (
      <PageShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <RefreshCw size={28} className="animate-spin text-[var(--color-primary)]" />
          <p className="text-base font-semibold">빠르게 입장할 방을 찾는 중이에요...</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="relative flex h-dvh w-full flex-col overflow-hidden px-5 pt-6 pb-6">
        <header className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-[var(--color-ink)]">공개방</h1>
        </header>

        {error && <p className="mt-4 shrink-0 text-sm font-medium text-[var(--color-error)]">{error}</p>}

        <div className="mt-5 flex flex-1 flex-col gap-3 overflow-y-auto">
          {loading && <p className="text-sm text-[var(--color-muted)]">불러오는 중...</p>}
          {!loading && rooms.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]">
                <DoorOpen size={28} className="text-[var(--color-muted)]" />
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                현재 참가 가능한 공개방이 없어요.
                <br />
                방을 직접 만들어보세요!
              </p>
              <button
                type="button"
                onClick={() => navigate('/lobby/create')}
                className="flex items-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-8px_var(--color-primary)] active:scale-[0.98]"
              >
                <Plus size={16} />방 만들기
              </button>
            </div>
          )}
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="flex shrink-0 items-center justify-between rounded-[var(--radius-card)] bg-[var(--color-surface)] px-5 py-4 shadow-sm"
            >
              <div>
                <p className="font-bold text-[var(--color-ink)]">{room.roomName}</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
                  <Users size={15} />
                  {room.currentPlayers} / {room.maxPlayers}
                </p>
              </div>
              <button
                type="button"
                onClick={() => joinRoom(room.roomId)}
                className="shrink-0 rounded-[var(--radius-card)] bg-[#eef4ff] px-4 py-2.5 text-sm font-bold text-[var(--color-primary)] active:scale-[0.98]"
              >
                입장하기
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 flex shrink-0 items-center justify-center gap-1.5 text-center text-xs text-[var(--color-muted)]">
          <Lightbulb size={14} />
          방 인원은 최대 6명까지예요!
        </p>

        {rooms.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/lobby/create')}
            className="absolute bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_10px_24px_-6px_var(--color-primary)] active:scale-[0.96]"
            aria-label="방 만들기"
          >
            <Plus size={26} />
          </button>
        )}
      </div>
    </PageShell>
  )
}
