export type RoomStatus = 'WAITING' | 'COUNTDOWN' | 'IN_PROGRESS' | 'FINISHED'

export interface PlayerDto {
  playerId: string
  nickname: string
  ready: boolean
  host: boolean
}

export interface RoomResponse {
  roomId: string
  roomName: string
  maxPlayers: number
  mathEventCount: number
  status: RoomStatus
  players: PlayerDto[]
}

export interface PublicRoomSummary {
  roomId: string
  roomName: string
  currentPlayers: number
  maxPlayers: number
  mathEventCount: number
}

export interface NicknameAvailabilityResponse {
  available: boolean
}
