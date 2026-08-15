import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { WS_URL } from './api'

let client: Client | null = null
const connectListeners: Array<() => void> = []

function getClient(): Client {
  if (client) return client
  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 3000,
    onConnect: () => {
      connectListeners.forEach((listener) => listener())
    },
  })
  client.activate()
  return client
}

function onConnected(callback: () => void) {
  const c = getClient()
  if (c.connected) {
    callback()
  } else {
    connectListeners.push(callback)
  }
}

/**
 * Subscribes once the STOMP client is connected and returns an unsubscribe
 * function immediately (synchronously). If the returned function is called
 * before the connection completes, the subscription is skipped entirely —
 * this avoids orphaned subscriptions from React StrictMode's mount/cleanup/
 * remount cycle in development.
 */
function subscribe(destination: string, onMessage: (body: string) => void): () => void {
  let cancelled = false
  let sub: StompSubscription | null = null

  onConnected(() => {
    if (cancelled) return
    sub = getClient().subscribe(destination, (message) => {
      onMessage(message.body)
    })
  })

  return () => {
    cancelled = true
    sub?.unsubscribe()
  }
}

export function subscribeToRoom(roomId: string, onMessage: (body: string) => void): () => void {
  return subscribe(`/topic/room/${roomId}`, onMessage)
}

export function subscribeToRoomMessages(roomId: string, onMessage: (body: string) => void): () => void {
  return subscribe(`/topic/room/${roomId}/messages`, onMessage)
}

export function subscribeToPublicRooms(onMessage: (body: string) => void): () => void {
  return subscribe('/topic/rooms/public', onMessage)
}

export function subscribeToGame(roomId: string, onMessage: (body: string) => void): () => void {
  return subscribe(`/topic/room/${roomId}/game`, onMessage)
}

export function sendReady(roomId: string, playerId: string, ready: boolean) {
  getClient().publish({
    destination: `/app/room/${roomId}/ready`,
    body: JSON.stringify({ playerId, ready }),
  })
}

export function sendLeave(roomId: string, playerId: string) {
  getClient().publish({
    destination: `/app/room/${roomId}/leave`,
    body: JSON.stringify({ playerId }),
  })
}

export function sendQuickMessage(roomId: string, playerId: string, nickname: string, message: string) {
  getClient().publish({
    destination: `/app/room/${roomId}/message`,
    body: JSON.stringify({ playerId, nickname, message }),
  })
}

export function sendStartGame(roomId: string, playerId: string) {
  getClient().publish({
    destination: `/app/room/${roomId}/start`,
    body: JSON.stringify({ playerId }),
  })
}

export function sendAnswer(roomId: string, playerId: string, answer: string) {
  getClient().publish({
    destination: `/app/room/${roomId}/answer`,
    body: JSON.stringify({ playerId, answer }),
  })
}

export function sendRematch(roomId: string, playerId: string, wantRematch: boolean) {
  getClient().publish({
    destination: `/app/room/${roomId}/rematch`,
    body: JSON.stringify({ playerId, wantRematch }),
  })
}

/** Registers presence once connected, and again on every reconnect, so the
 * server can tell a brief network drop apart from an actual leave. */
export function registerPresence(roomId: string, playerId: string): () => void {
  let cancelled = false

  onConnected(function sendOnce() {
    if (cancelled) return
    getClient().publish({
      destination: `/app/room/${roomId}/presence`,
      body: JSON.stringify({ playerId }),
    })
  })

  return () => {
    cancelled = true
  }
}
