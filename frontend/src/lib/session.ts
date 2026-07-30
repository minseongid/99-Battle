const PLAYER_ID_KEY = 'battle99_player_id'
const NICKNAME_KEY = 'battle99_nickname'

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

export function getNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) ?? ''
}

export function setNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_KEY, nickname)
}
