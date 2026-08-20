import { useState, type ReactNode } from 'react'
import { Settings, X, Music, Volume2 } from 'lucide-react'
import { isLobbyMusicMuted, isBattleMusicMuted, setLobbyMusicMuted, setBattleMusicMuted } from '../lib/audio'

function ToggleRow({
  icon,
  label,
  description,
  on,
  onToggle,
}: {
  icon: ReactNode
  label: string
  description: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] bg-[var(--color-bg)] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[var(--color-ink)]">{label}</p>
        <p className="truncate text-xs text-[var(--color-muted)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={on}
        aria-label={label}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            on ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export default function SettingsButton() {
  const [open, setOpen] = useState(false)
  const [lobbyOn, setLobbyOn] = useState(!isLobbyMusicMuted())
  const [battleOn, setBattleOn] = useState(!isBattleMusicMuted())

  function toggleLobby() {
    const next = !lobbyOn
    setLobbyOn(next)
    setLobbyMusicMuted(!next)
  }

  function toggleBattle() {
    const next = !battleOn
    setBattleOn(next)
    setBattleMusicMuted(!next)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="설정"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm transition active:scale-[0.95]"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[320px] rounded-[var(--radius-card)] bg-[var(--color-surface)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--color-ink)]">설정</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-[var(--color-muted)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <ToggleRow
                icon={<Music size={18} />}
                label="배경음악"
                description="로비/대기방에서 나오는 음악"
                on={lobbyOn}
                onToggle={toggleLobby}
              />
              <ToggleRow
                icon={<Volume2 size={18} />}
                label="게임음악"
                description="게임 진행 중 나오는 음악"
                on={battleOn}
                onToggle={toggleBattle}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
