# DP-Hogar

Plataforma de monitoreo, seguimiento y apoyo al cuidado domiciliario de pacientes en diálisis peritoneal.
Proyecto de tesis, Instituto Dominicano Americano.

| Carpeta | Contenido | Responsable |
|---|---|---|
| `backend/` | API y base de datos (Python, Django) | Backend |
| `web/` | Panel de doctores y administración | Web |
| `mobile/` | App para pacientes y cuidadores (React Native) | Móvil |
| `docs/` | Documentación y contrato de la API (`openapi.yaml`) | Todos |

## Requisitos

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- `make` (en Windows: usar Git Bash o WSL; si no lo tienes, mira los comandos dentro del `Makefile`)

Para trabajar solo en `web/` o `mobile/` **no necesitas instalar Python**: el backend corre en Docker.

## Levantar el backend en 3 pasos

```bash
git clone <url-del-repositorio>
cd dp-hogar
make up
```

La primera vez tarda unos minutos mientras descarga las imágenes. `make up` crea `backend/.env` a partir de `backend/.env.example` si no existe, levanta PostgreSQL y el backend, y aplica las migraciones.

Cuando veas `Starting development server`, comprueba:

- Estado: http://localhost:8000/api/health/ debe responder `{"status":"ok"}`
- Documentación de la API: http://localhost:8000/api/docs/
- Administración de Django: http://localhost:8000/admin/ (crea un usuario con `make superuser`)

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `make up` | Levanta base de datos y backend |
| `make down` | Apaga todo (los datos se conservan) |
| `make logs` | Muestra los registros del backend |
| `make test` | Corre las pruebas |
| `make lint` / `make format` | Revisa / formatea el código |
| `make makemigrations` / `make migrate` | Crea / aplica migraciones |
| `make superuser` | Crea un administrador para `/admin` |
| `make openapi` | Regenera `docs/openapi.yaml` |

Para borrar también los datos de la base: `docker compose down -v`.

## Para quien hace web o móvil

- **Contrato de la API:** `docs/openapi.yaml` describe los endpoints. Úsalo para trabajar con datos simulados mientras el backend los termina.
- **Web:** el backend acepta peticiones desde `http://localhost:5173` y `http://localhost:3000`. Si tu servidor usa otro puerto, agrégalo en `CORS_ALLOWED_ORIGINS` de tu `backend/.env`.
- **Emulador de Android:** `localhost` es el propio emulador. Para llegar al backend usa `http://10.0.2.2:8000`.
- **Teléfono físico:** usa la IP de tu computadora en la red local (por ejemplo `http://192.168.1.20:8000`) y agrégala a `DJANGO_ALLOWED_HOSTS`.
- **Simulador de iOS:** `http://localhost:8000` funciona.

## Variables de entorno

Están descritas en `backend/.env.example`. El archivo `backend/.env` es personal y nunca se sube a Git.

| Variable | Para qué sirve |
|---|---|
| `DJANGO_SECRET_KEY` | Clave interna de Django |
| `DJANGO_DEBUG` | `True` solo en desarrollo |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos |
| `DATABASE_URL` | Conexión a la base de datos |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para la web |

## Cómo trabajamos

- `main` siempre está estable. Nadie sube directo: todo entra por pull request, con una aprobación de otro integrante y las pruebas en verde.
- Nombre de la rama: `feature/<requerimiento>-<tema>`, por ejemplo `feature/SIS-RF-014-roles`.
- Mensajes de commit en español, en presente: `Agrega control de acceso por roles`.
- Un pull request pequeño por tarjeta de Trello. Usa la plantilla y marca la definición de terminado.
- Si cambias la API, ejecuta `make openapi` y sube el archivo. La integración continua falla si está desactualizado.
- Si cambias un modelo, sube la migración. **Nunca edites una migración que ya se subió**: crea una nueva.

## Seguridad

- No subas claves, contraseñas ni archivos `.env`.
- Todos los datos del repositorio son de prueba. Nunca datos de pacientes reales.
- Si subes una clave por error, cámbiala de inmediato; borrarla del historial no basta.

## Problemas comunes

| Problema | Solución |
|---|---|
| `port is already allocated` (5432) | Tienes PostgreSQL instalado y corriendo. Páralo o cambia el puerto en `docker-compose.yml` |
| `make: command not found` | Usa Git Bash o WSL, o ejecuta a mano los comandos del `Makefile` |
| El backend no conecta con la base | Espera unos segundos y reinicia con `make down && make up` |
| Cambié las dependencias y no se ven | `docker compose build --no-cache backend` |
| Errores de finales de línea en Windows | Ya lo evita `.gitattributes`; si persiste, `git config core.autocrlf false` |
