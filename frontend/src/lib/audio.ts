const LOBBY_MUSIC_SRC = '/bgm/puffle-parade.mp3'
const VOLUME = 0.35

let audioEl: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio(LOBBY_MUSIC_SRC)
    audioEl.loop = true
    audioEl.volume = VOLUME
  }
  return audioEl
}

export function playLobbyMusic() {
  const audio = getAudio()
  if (audio.paused) {
    audio.play().catch(() => {})
  }
}
