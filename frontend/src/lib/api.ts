export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:8080/ws'

async function throwApiError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null)
  throw new Error((body && body.message) || `요청이 실패했습니다. (${res.status})`)
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) return throwApiError(res)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) return throwApiError(res)
  return res.json() as Promise<T>
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) return throwApiError(res)
  return res.json() as Promise<T>
}

export async function apiDelete(path: string): Promise<void> {
  await fetch(`${API_URL}${path}`, { method: 'DELETE' })
}
