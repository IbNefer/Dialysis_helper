export type AuthTokens = { access: string; refresh: string }

export type ApiRole = {
  id?: number | string
  codigo?: string
  nombre?: string
  descripcion?: string
  activo?: boolean
}

export type UserProfile = {
  id?: number | string
  correo?: string
  nombre?: string
  telefono?: string
  rol?: string | ApiRole | null
  activo?: boolean
  mfa_activo?: boolean
  perfil_doctor?: unknown
  perfil_paciente?: unknown
}

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
}

function parsePayload(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function errorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>
    for (const key of ['detail', 'error', 'message']) {
      if (typeof body[key] === 'string') return body[key] as string
    }
  }
  return `La API respondió con el estado HTTP ${status}.`
}

async function request(path: string, options: ApiOptions, access?: string): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    cache: 'no-store',
  })
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await request(path, {})
  } catch {
    throw new Error(`No se puede conectar con ${API_BASE_URL}. Comprueba que el backend esté activo y que CORS permita este frontend.`)
  }
  const payload = parsePayload(await response.text())
  if (!response.ok) throw new Error(errorMessage(payload, response.status))
  return payload as T
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions,
  tokens: AuthTokens,
  onTokensRefreshed: (tokens: AuthTokens | null) => void,
): Promise<T> {
  let response: Response
  try {
    response = await request(path, options, tokens.access)
  } catch {
    throw new Error(`No se puede conectar con ${API_BASE_URL}. Comprueba que el backend esté activo y que CORS permita este frontend.`)
  }

  if (response.status === 401 && path !== '/api/accounts/token/refresh/') {
    let refreshed: Response
    try {
      refreshed = await request('/api/accounts/token/refresh/', { method: 'POST', body: { refresh: tokens.refresh } })
    } catch {
      throw new Error('No se pudo renovar la sesión. Inicia sesión nuevamente.')
    }
    const refreshedPayload = parsePayload(await refreshed.text()) as Partial<AuthTokens> | null
    if (!refreshed.ok || !refreshedPayload?.access) {
      onTokensRefreshed(null)
      throw new Error('La sesión expiró. Inicia sesión nuevamente.')
    }
    const nextTokens = {
      access: refreshedPayload.access,
      refresh: refreshedPayload.refresh || tokens.refresh,
    }
    onTokensRefreshed(nextTokens)
    const retryOptions = path === '/api/accounts/logout/' ? { ...options, body: { refresh: nextTokens.refresh } } : options
    try {
      response = await request(path, retryOptions, nextTokens.access)
    } catch {
      throw new Error(`No se puede conectar con ${API_BASE_URL}. Comprueba que el backend esté activo y que CORS permita este frontend.`)
    }
  }

  const payload = parsePayload(await response.text())
  if (!response.ok) throw new Error(errorMessage(payload, response.status))
  return payload as T
}

export async function login(correo: string, password: string): Promise<AuthTokens> {
  let response: Response
  try {
    response = await request('/api/accounts/token/', { method: 'POST', body: { correo, password } })
  } catch {
    throw new Error(`No se puede conectar con ${API_BASE_URL}. Comprueba que el backend esté activo y que CORS permita este frontend.`)
  }
  const payload = parsePayload(await response.text()) as Partial<AuthTokens> | null
  if (!response.ok) throw new Error(errorMessage(payload, response.status))
  if (!payload?.access || !payload.refresh) throw new Error('La API no devolvió los tokens de sesión esperados.')
  return { access: payload.access, refresh: payload.refresh }
}

export function getRoleLabel(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return null
  const role = value as { nombre?: unknown; codigo?: unknown; nombre_rol?: unknown; rol?: unknown; name?: unknown }
  const label = role.nombre ?? role.codigo ?? role.nombre_rol ?? role.rol ?? role.name
  return typeof label === 'string' ? label : null
}

export function getRoleNames(data: unknown): string[] {
  const payload = data && typeof data === 'object' ? data as { results?: unknown; roles?: unknown } : null
  const candidates = Array.isArray(data)
    ? data
    : payload?.results ?? payload?.roles ?? (data == null ? [] : [data])
  const values = Array.isArray(candidates) ? candidates : [candidates]
  return values.flatMap((value) => {
    const label = getRoleLabel(value)
    return label ? [label] : []
  })
}
