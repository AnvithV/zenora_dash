import type { QueryParams } from '@/types/api'

export async function fetchApi(url: string) {
  const res = await fetch(url)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

export async function mutateApi(url: string, method: string, body?: Record<string, unknown>) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  const res = await fetch(url, options)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data
}

export function buildUrl(base: string, params: QueryParams) {
  const url = new URL(base, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  return url.toString()
}
