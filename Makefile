COMPOSE = docker compose -f docker/compose.yml

up:
	test -f docker/.env || cp docker/.env.example docker/.env
	$(COMPOSE) up --build backend cache

down:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f --no-color > compose.log || true
	@echo "Logs guardados en compose.log"

ps:
	$(COMPOSE) ps

rebuild:
	$(COMPOSE) build --no-cache backend

smoke:
	@echo "Chequeando /health y /status..."
	@curl -fsS http://localhost:8080/health && echo " ✓ health OK"
	@curl -fsS http://localhost:8080/status && echo " ✓ status OK"