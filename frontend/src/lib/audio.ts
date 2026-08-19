const LOBBY_MUSIC_SRC = '/bgm/puffle-parade.mp3'

// Picked at random each time a game starts, and looped for that game's
// duration. Add more tracks here as they're made — no other code needs to
// change.
const BATTLE_MUSIC_SRCS = [
  '/bgm/puffle-countdown-clash.mp3',
  '/bgm/puffle-victory-fanfare.mp3',
  '/bgm/puffle-quickstep.mp3',
  '/bgm/puffle-showdown.mp3',
]

const VOLUME = 0.35
const LOBBY_MUTE_KEY = 'battle99_lobby_muted'
const BATTLE_MUTE_KEY = 'battle99_battle_muted'

let lobbyAudioEl: HTMLAudioElement | null = null
let battleAudioEl: HTMLAudioElement | null = null
let started = false

function getLobbyAudio(): HTMLAudioElement {
  if (!lobbyAudioEl) {
    lobbyAudioEl = new Audio(LOBBY_MUSIC_SRC)
    lobbyAudioEl.loop = true
    lobbyAudioEl.volume = VOLUME
  }
  return lobbyAudioEl
}

export function hasStartedLobbyMusic(): boolean {
  return started
}

export function isLobbyMusicMuted(): boolean {
  return localStorage.getItem(LOBBY_MUTE_KEY) === '1'
}

export function isBattleMusicMuted(): boolean {
  return localStorage.getItem(BATTLE_MUTE_KEY) === '1'
}

export function playLobbyMusic() {
  stopBattleMusic()
  started = true
  if (isLobbyMusicMuted()) return
  const audio = getLobbyAudio()
  if (audio.paused) {
    audio.play().catch(() => {})
  }
}

export function stopLobbyMusic() {
  if (lobbyAudioEl && !lobbyAudioEl.paused) {
    lobbyAudioEl.pause()
  }
}

/** Picks a random track from BATTLE_MUSIC_SRCS and loops it for this game. */
export function playBattleMusic() {
  stopLobbyMusic()
  if (battleAudioEl) {
    battleAudioEl.pause()
  }
  if (isBattleMusicMuted()) return
  const src = BATTLE_MUSIC_SRCS[Math.floor(Math.random() * BATTLE_MUSIC_SRCS.length)]
  battleAudioEl = new Audio(src)
  battleAudioEl.loop = true
  battleAudioEl.volume = VOLUME
  battleAudioEl.play().catch(() => {})
}

export function stopBattleMusic() {
  if (battleAudioEl && !battleAudioEl.paused) {
    battleAudioEl.pause()
  }
}

/** Toggled from the settings popup. Applies immediately if lobby music is meant to be playing. */
export function setLobbyMusicMuted(muted: boolean) {
  localStorage.setItem(LOBBY_MUTE_KEY, muted ? '1' : '0')
  if (muted) {
    stopLobbyMusic()
  } else if (started) {
    playLobbyMusic()
  }
}

/** Toggled from the settings popup. Only affects the currently-playing track, if any —
 * the next game start will already respect the flag via playBattleMusic(). */
export function setBattleMusicMuted(muted: boolean) {
  localStorage.setItem(BATTLE_MUTE_KEY, muted ? '1' : '0')
  if (muted) {
    stopBattleMusic()
  }
}
