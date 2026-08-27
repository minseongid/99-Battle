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

/** Deterministic string hash (djb2-ish) so every client picks the identical
 * track index from the same seed, with no server coordination needed. */
function hashSeed(seed: string): number {
  let hash = 5381
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Picks a track from BATTLE_MUSIC_SRCS and loops it for this game. Pass a
 * `seed` (e.g. roomId + the first question's server-broadcast timestamp) so
 * every player in the same game session lands on the same index — without a
 * seed it falls back to a per-client random pick (unsynced across players). */
export function playBattleMusic(seed?: string) {
  stopLobbyMusic()
  if (battleAudioEl) {
    battleAudioEl.pause()
  }
  if (isBattleMusicMuted()) return
  const index =
    seed !== undefined ? hashSeed(seed) % BATTLE_MUSIC_SRCS.length : Math.floor(Math.random() * BATTLE_MUSIC_SRCS.length)
  const src = BATTLE_MUSIC_SRCS[index]
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
