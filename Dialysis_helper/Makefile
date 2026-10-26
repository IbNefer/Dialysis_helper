.PHONY: setup up down logs test lint format migrate makemigrations shell superuser openapi

setup: ## Crea backend/.env a partir del ejemplo si no existe
	@test -f backend/.env || cp backend/.env.example backend/.env

up: setup ## Levanta base de datos y backend
	docker compose up --build

down: ## Apaga todo (los datos se conservan)
	docker compose down

logs: ## Ver registros del backend
	docker compose logs -f backend

test: setup ## Corre las pruebas
	docker compose run --rm backend pytest

lint: setup ## Revisa el estilo del codigo
	docker compose run --rm backend sh -c "ruff check . && ruff format --check ."

format: setup ## Formatea el codigo
	docker compose run --rm backend sh -c "ruff check --fix . && ruff format ."

migrate: setup ## Aplica migraciones
	docker compose run --rm backend python manage.py migrate

makemigrations: setup ## Crea migraciones nuevas
	docker compose run --rm backend python manage.py makemigrations

shell: setup ## Consola de Django
	docker compose run --rm backend python manage.py shell

superuser: setup ## Crea un administrador para /admin
	docker compose run --rm backend python manage.py createsuperuser

openapi: setup ## Regenera docs/openapi.yaml (hazlo antes de subir cambios en la API)
	docker compose run --rm backend python manage.py spectacular --file /app/openapi.yaml
	cp backend/openapi.yaml docs/openapi.yaml && rm backend/openapi.yaml
