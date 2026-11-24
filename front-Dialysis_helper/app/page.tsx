'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Activity, ArrowRight, BookOpen, Check, ChevronRight, CircleHelp, HeartPulse,
  LayoutDashboard, LoaderCircle, LogOut, PlugZap, RefreshCw, ShieldCheck,
  UserRound, Users, CalendarDays, X,
} from 'lucide-react'
import {
  API_BASE_URL, apiGet, apiRequest, getRoleLabel, getRoleNames, login,
  type AuthTokens, type UserProfile,
} from '@/lib/dialysis-api'

type NavSection = 'Resumen' | 'Pacientes' | 'Secciones' | 'Mi perfil'
type RoleResponse = unknown

const endpoints = [
  { method: 'GET', path: '/api/health/', title: 'Estado del servidor', auth: false },
  { method: 'POST', path: '/api/accounts/token/', title: 'Iniciar sesión', auth: false },
  { method: 'POST', path: '/api/accounts/token/refresh/', title: 'Renovar sesión', auth: true },
  { method: 'POST', path: '/api/accounts/logout/', title: 'Cerrar sesión', auth: true },
  { method: 'GET / PATCH', path: '/api/accounts/me/', title: 'Perfil de usuario', auth: true },
  { method: 'GET', path: '/api/accounts/roles/', title: 'Roles disponibles', auth: true },
]

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
}

export default function Page() {
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [active, setActive] = useState<NavSection>('Resumen')
  const [loginOpen, setLoginOpen] = useState(false)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  const health = useSWR('/api/health/', apiGet, { refreshInterval: 30000, revalidateOnFocus: true, shouldRetryOnError: false })
  const profile = useSWR<UserProfile>(tokens ? ['/api/accounts/me/', tokens.access] : null, ([path]) => apiRequest<UserProfile>(path, {}, tokens!, setTokens), {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
    onSuccess: (user) => {
      setProfileName(user.nombre || '')
      setProfilePhone(user.telefono || '')
    },
    onError: (error) => setNotice(`No fue posible cargar el perfil: ${getErrorMessage(error)}`),
  })
  const roles = useSWR<RoleResponse>(tokens ? ['/api/accounts/roles/', tokens.access] : null, ([path]) => apiRequest<RoleResponse>(path, {}, tokens!, setTokens), {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  })

  const apiConnected = health.data !== undefined && !health.error
  const user = profile.data
  const roleNames = getRoleNames(roles.data)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setFormError('')
    try {
      const result = await login(correo, password)
      setTokens(result)
      setLoginOpen(false)
      setPassword('')
      setNotice('Sesión iniciada. Cargando los datos de tu cuenta desde la API.')
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tokens) return
    setBusy(true)
    setNotice('')
    try {
      const updated = await apiRequest<UserProfile>('/api/accounts/me/', {
        method: 'PATCH',
        body: { nombre: profileName, telefono: profilePhone },
      }, tokens, setTokens)
      await profile.mutate(updated, { revalidate: false })
      setEditing(false)
      setNotice('Perfil actualizado correctamente desde la API.')
    } catch (error) {
      setNotice(`No se pudo actualizar el perfil: ${getErrorMessage(error)}`)
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    if (tokens) {
      try {
        await apiRequest('/api/accounts/logout/', { method: 'POST', body: { refresh: tokens.refresh } }, tokens, setTokens)
        setNotice('Sesión cerrada en el servidor.')
      } catch (error) {
        setNotice(`No se pudo confirmar el cierre en el servidor: ${getErrorMessage(error)}`)
      }
    }
    setTokens(null)
    setActive('Resumen')
    setEditing(false)
  }

  function navigate(section: NavSection) {
    setActive(section)
    setNotice('')
    if (section === 'Mi perfil' && !tokens) setLoginOpen(true)
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Dialysis_helper, inicio">
          <span className="brand-mark"><HeartPulse size={22} /></span>
          <span className="brand-name">Dialysis_helper<span>Gestión de diálisis</span></span>
        </a>
        <div className="workspace-label">PLATAFORMA CLÍNICA</div>
        <div className="api-mini-status"><span className={`status-indicator ${apiConnected ? 'connected' : health.isLoading ? 'checking' : 'disconnected'}`} /><span><strong>{health.isLoading ? 'Comprobando API' : apiConnected ? 'API conectada' : 'API sin conexión'}</strong><small>{API_BASE_URL}</small></span></div>
        <div className="nav-caption">MENÚ PRINCIPAL</div>
        <nav className="main-nav" aria-label="Navegación principal">
          <button className={`nav-item ${active === 'Resumen' ? 'nav-active' : ''}`} onClick={() => navigate('Resumen')}><LayoutDashboard size={18} /><span>Resumen</span></button>
          <button className={`nav-item ${active === 'Pacientes' ? 'nav-active' : ''}`} onClick={() => navigate('Pacientes')}><Users size={18} /><span>Pacientes</span></button>
          <button className={`nav-item ${active === 'Secciones' ? 'nav-active' : ''}`} onClick={() => navigate('Secciones')}><CalendarDays size={18} /><span>Secciones</span></button>
          <button className={`nav-item ${active === 'Mi perfil' ? 'nav-active' : ''}`} onClick={() => navigate('Mi perfil')}><UserRound size={18} /><span>Mi perfil</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><CircleHelp size={18} /></span><strong>Conexión segura</strong><p>Las solicitudes autenticadas usan tokens Bearer. Los tokens solo permanecen en memoria.</p><a href={`${API_BASE_URL}/api/docs/`} target="_blank" rel="noreferrer">Abrir documentación <ArrowRight size={14} /></a></div>
          {tokens ? <button className="nav-item settings-item" onClick={signOut}><LogOut size={18} /><span>Cerrar sesión</span></button> : <button className="nav-item settings-item" onClick={() => setLoginOpen(true)}><ShieldCheck size={18} /><span>Iniciar sesión</span></button>}
          <div className="sidebar-footer"><span className={`status-indicator ${apiConnected ? 'connected' : health.isLoading ? 'checking' : 'disconnected'}`} /> Estado del backend <ShieldCheck size={14} /></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Dialysis_helper <ChevronRight size={14} /><strong>{active}</strong></div>
          <div className="top-actions">
            <span className={`connection-pill ${apiConnected ? 'pill-connected' : health.isLoading ? 'pill-checking' : 'pill-disconnected'}`}><span className="status-indicator" />{health.isLoading ? 'Comprobando' : apiConnected ? 'API disponible' : 'API no disponible'}</span>
            {tokens ? <button className="account-button" onClick={() => navigate('Mi perfil')}><span className="avatar avatar-user">{user?.nombre?.slice(0, 2).toUpperCase() || 'U'}</span><span className="account-copy"><strong>{user?.nombre || 'Cuenta autenticada'}</strong><small>{getRoleLabel(user?.rol) || 'Usuario'}</small></span><ChevronRight size={14} /></button> : <button className="primary-button compact-button" onClick={() => setLoginOpen(true)}>Iniciar sesión <ArrowRight size={14} /></button>}
          </div>
        </header>

        <div className="content-wrap">
          {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Cerrar aviso" onClick={() => setNotice('')}><X size={15} /></button></div>}

          {active === 'Mi perfil' && tokens ? (
            <section className="profile-view">
              <div className="page-heading"><div><span className="eyebrow">CUENTA Y PREFERENCIAS</span><h1>Mi perfil</h1><p>La información se consulta y actualiza a través de <code>/api/accounts/me/</code>.</p></div></div>
              {profile.error ? <div className="connection-card error-card" role="alert"><strong>No se pudo cargar el perfil</strong><p>{getErrorMessage(profile.error)}</p><button className="secondary-button" onClick={() => profile.mutate()}><RefreshCw size={14} /> Reintentar</button></div> : (
                <div className="profile-card">
                  <div className="profile-header"><div className="avatar profile-avatar">{user?.nombre?.slice(0, 2).toUpperCase() || 'U'}</div><div><h2>{profile.isLoading ? 'Cargando perfil…' : user?.nombre || 'Usuario'}</h2><p>{user?.correo || '—'}</p></div><span className="verified-pill"><ShieldCheck size={14} /> Datos de la API</span></div>
                  {profile.isLoading ? <div className="profile-loading"><LoaderCircle className="spin" size={18} /> Consultando el servidor…</div> : editing ? (
                    <form className="profile-form" onSubmit={saveProfile}><label>Nombre completo<input value={profileName} onChange={(event) => setProfileName(event.target.value)} required autoComplete="name" /></label><label>Teléfono<input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} autoComplete="tel" /></label><div className="form-actions"><button className="secondary-button" type="button" onClick={() => setEditing(false)}>Cancelar</button><button className="primary-button" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'} <ArrowRight size={15} /></button></div></form>
                  ) : (
                    <div className="profile-details"><div><span>Correo electrónico</span><strong>{user?.correo || '—'}</strong></div><div><span>Teléfono</span><strong>{user?.telefono || 'No indicado'}</strong></div><div><span>Rol asignado</span><strong>{getRoleLabel(user?.rol) || 'No indicado'}</strong></div><div><span>Estado de cuenta</span><strong className="status-text"><i className={`status-indicator ${user?.activo === false ? 'disconnected' : 'connected'}`} />{user?.activo === false ? 'Inactiva' : 'Activa'}</strong></div><div><span>Roles disponibles</span><strong>{roles.isLoading ? 'Consultando…' : roles.error ? 'No fue posible consultar los roles' : roleNames.length ? roleNames.join(', ') : 'La API no devolvió roles'}</strong></div><button className="primary-button edit-button" onClick={() => setEditing(true)}>Editar perfil <ArrowRight size={15} /></button></div>
                  )}
                </div>
              )}
            </section>
          ) : active === 'Pacientes' || active === 'Secciones' ? (
            <section className="unavailable-view"><div className="page-heading"><div><span className="eyebrow">MÓDULO DE {active.toUpperCase()}</span><h1>{active}</h1><p>Esta pantalla no carga registros de demostración.</p></div></div><div className="connection-card"><span className="unavailable-icon"><Activity size={20} /></span><div><h2>Falta el endpoint de {active.toLowerCase()}</h2><p>El backend compartido no documenta una ruta para consultar {active.toLowerCase()}. Cuando exista ese endpoint, se puede conectar aquí sin inventar ni mostrar información clínica falsa.</p><span className="api-route-chip">Endpoint no incluido en el contrato actual</span></div></div></section>
          ) : (
            <>
              <div className="page-heading"><div><span className="eyebrow">ESTADO DE SERVICIOS</span><h1>Dialysis_helper<span className="heading-dot">.</span></h1><p>Frontend React conectado a los endpoints disponibles del backend.</p></div><button className="date-button" onClick={() => health.mutate()} disabled={health.isValidating}><RefreshCw className={health.isValidating ? 'spin' : ''} size={15} /> Comprobar API</button></div>
              <section className={`connection-card main-connection-card ${apiConnected ? 'connection-ok' : 'connection-error'}`} aria-live="polite">
                <span className="connection-icon"><PlugZap size={22} /></span>
                <div className="connection-copy"><span className="section-kicker">VERIFICACIÓN EN VIVO · GET /api/health/</span><h2>{health.isLoading ? 'Comprobando el backend…' : apiConnected ? 'El backend respondió correctamente' : 'No se pudo contactar el backend'}</h2><p>{health.isLoading ? 'Consultando el endpoint de salud.' : apiConnected ? 'El endpoint de salud está accesible desde este frontend.' : getErrorMessage(health.error)}</p><code>{API_BASE_URL}</code></div>
                <span className={`large-status ${apiConnected ? 'large-status-ok' : health.isLoading ? 'large-status-pending' : 'large-status-error'}`}><i />{health.isLoading ? 'Comprobando' : apiConnected ? 'En línea' : 'Sin conexión'}</span>
              </section>

              <section className="endpoints-section"><div className="section-heading endpoint-heading"><div><span className="section-kicker">INTEGRACIÓN REST</span><h2>Endpoints conectados</h2></div><span className="endpoint-count"><Check size={13} /> {endpoints.length} rutas implementadas</span></div><div className="endpoint-grid">{endpoints.map((endpoint) => <article className="endpoint-card" key={endpoint.path + endpoint.method}><div className="endpoint-card-top"><span className={`method-badge method-${endpoint.method.startsWith('GET') ? 'get' : endpoint.method === 'PATCH' ? 'patch' : 'post'}`}>{endpoint.method}</span><span className={endpoint.auth ? 'auth-label' : 'public-label'}>{endpoint.auth ? 'Con token' : 'Público'}</span></div><h3>{endpoint.title}</h3><code>{endpoint.path}</code></article>)}</div></section>

              <section className="lower-grid integration-notes"><article className="sessions-card api-details-card"><div className="section-heading"><div><span className="section-kicker">AUTENTICACIÓN</span><h2>Sesión protegida</h2></div><span className="metric-icon metric-blue"><ShieldCheck size={17} /></span></div><ul className="integration-list"><li><Check size={15} /> Login con correo y contraseña</li><li><Check size={15} /> Renovación del access token al recibir HTTP 401</li><li><Check size={15} /> Perfil: lectura y actualización con PATCH</li><li><Check size={15} /> Tokens guardados solo en memoria del navegador</li></ul>{tokens ? <button className="secondary-button api-action" onClick={signOut}><LogOut size={14} /> Cerrar sesión en la API</button> : <button className="primary-button api-action" onClick={() => setLoginOpen(true)}>Probar inicio de sesión <ArrowRight size={14} /></button>}</article><article className="team-card docs-card"><div className="section-heading team-heading"><div><span className="section-kicker">REFERENCIA API</span><h2>Documentación</h2></div><BookOpen size={17} /></div><p>Consulta los esquemas y respuestas reales que expone el backend.</p><a className="docs-link" href={`${API_BASE_URL}/api/docs/`} target="_blank" rel="noreferrer">Abrir /api/docs/ <ArrowRight size={14} /></a><div className="cors-note"><strong>Si la API está en otro origen</strong><span>Permite el dominio de este frontend en la configuración CORS del backend.</span></div></article></section>
              <footer className="page-footer"><span>Dialysis_helper · Integración REST · No se muestran datos clínicos simulados.</span><span><ShieldCheck size={13} /> Tokens no persistidos en el navegador</span></footer>
            </>
          )}
        </div>
      </section>

      {loginOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoginOpen(false) }}><section className="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><button className="modal-close" aria-label="Cerrar inicio de sesión" onClick={() => setLoginOpen(false)}><X size={18} /></button><div className="login-brand"><span className="brand-mark"><HeartPulse size={22} /></span><span className="brand-name">Dialysis_helper<span>Gestión de diálisis</span></span></div><span className="eyebrow">ACCESO A LA API</span><h2 id="login-title">Iniciar sesión</h2><p>La autenticación se valida en el backend.</p><form className="login-form" onSubmit={handleLogin}><label htmlFor="correo">Correo electrónico</label><input id="correo" type="email" autoComplete="username" placeholder="nombre@centro.com" value={correo} onChange={(event) => setCorreo(event.target.value)} required /><label htmlFor="password">Contraseña</label><input id="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required />{formError && <p className="form-error" role="alert">{formError}</p>}<button className="primary-button login-submit" disabled={busy}>{busy ? 'Conectando…' : 'Iniciar sesión'} <ArrowRight size={15} /></button></form><div className="login-security"><ShieldCheck size={15} /> POST /api/accounts/token/</div><p className="login-note">El token se mantiene en memoria y se elimina al cerrar sesión o recargar la página.</p></section></div>}
    </main>
  )
}
