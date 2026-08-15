const LOBBY_MUSIC_SRC = '/bgm/puffle-parade.mp3'
const BATTLE_MUSIC_SRC = '/bgm/puffle-countdown-clash.mp3'
const VOLUME = 0.35

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

function getBattleAudio(): HTMLAudioElement {
  if (!battleAudioEl) {
    battleAudioEl = new Audio(BATTLE_MUSIC_SRC)
    battleAudioEl.loop = true
    battleAudioEl.volume = VOLUME
  }
  return battleAudioEl
}

export function hasStartedLobbyMusic(): boolean {
  return started
}

export function playLobbyMusic() {
  stopBattleMusic()
  const audio = getLobbyAudio()
  started = true
  if (audio.paused) {
    audio.play().catch(() => {})
  }
}

export function stopLobbyMusic() {
  if (lobbyAudioEl && !lobbyAudioEl.paused) {
    lobbyAudioEl.pause()
  }
}

export function playBattleMusic() {
  stopLobbyMusic()
  const audio = getBattleAudio()
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function stopBattleMusic() {
  if (battleAudioEl && !battleAudioEl.paused) {
    battleAudioEl.pause()
  }
}
