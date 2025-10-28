COMPOSE = docker compose -f docker/compose.yml
ENV_FILE = docker/.env
ENV_EXAMPLE = docker/.env.example
NETRC_DIR = docker/edl
NETRC_FILE = $(NETRC_DIR)/_netrc
NETRC_EXAMPLE = $(NETRC_DIR)/_netrc.example

.PHONY: init up down logs ps rebuild smoke

init:
	@echo "🔧 Preparando archivos de entorno..."
	@if [ ! -f $(ENV_EXAMPLE) ]; then \
	  echo "❌ Falta $(ENV_EXAMPLE). Crealo con las claves requeridas."; exit 1; \
	fi
	@mkdir -p $(NETRC_DIR)
	@if [ ! -f $(NETRC_EXAMPLE) ]; then \
	  echo "❌ Falta $(NETRC_EXAMPLE). Agrega un ejemplo con placeholders."; exit 1; \
	fi
	@test -f $(ENV_FILE) || (cp $(ENV_EXAMPLE) $(ENV_FILE) && echo "✅ Copiado $(ENV_EXAMPLE) → $(ENV_FILE)")
	@test -f $(NETRC_FILE) || (cp $(NETRC_EXAMPLE) $(NETRC_FILE) && echo "✅ Copiado $(NETRC_EXAMPLE) → $(NETRC_FILE)")
	@# Detectar placeholders
	@PLACEHOLDERS_ENV=$$(grep -E "<[^>]+>" -n $(ENV_FILE) || true); \
	PLACEHOLDERS_NETRC=$$(grep -E "<[^>]+>" -n $(NETRC_FILE) || true); \
	if [ -n "$$PLACEHOLDERS_ENV$$PLACEHOLDERS_NETRC" ]; then \
	  echo "⚠️  Detectados placeholders en archivos de entorno:"; \
	  if [ -n "$$PLACEHOLDERS_ENV" ]; then echo "  • $(ENV_FILE):"; echo "$$PLACEHOLDERS_ENV"; fi; \
	  if [ -n "$$PLACEHOLDERS_NETRC" ]; then echo "  • $(NETRC_FILE):"; echo "$$PLACEHOLDERS_NETRC"; fi; \
	  echo "👉 Edita esos valores con credenciales reales antes de ejecutar 'make up'."; \
	fi

up: init
	$(COMPOSE) up --build backend cache

down:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f --no-color | tee docker/compose.log

ps:
	$(COMPOSE) ps

rebuild:
	$(COMPOSE) build --no-cache backend

smoke:
	@echo "Chequeando /health y /status..."
	@curl -fsS http://localhost:8080/health && echo " ✓ health OK"
	@curl -fsS http://localhost:8080/status && echo " ✓ status OK"