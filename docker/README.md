## Arranque rápido

Requisitos: Docker + Docker Compose.

1. Copiar variables:
    ```bash
    cp .env.example .env
    ````

2. Build & up:

   ```bash
   cd docker
   docker compose up --build
   ```
3. Verificar:

   * Frontend: [http://localhost:${FRONTEND_PORT:-8081}](http://localhost:${FRONTEND_PORT:-8081})
   * Backend:  [http://localhost:${BACKEND_PORT:-8080}/health](http://localhost:${BACKEND_PORT:-8080}/health)
   * Status:   [http://localhost:${BACKEND_PORT:-8080}/status](http://localhost:${BACKEND_PORT:-8080}/status)
4. Pruebas smoke:

   ```bash
   bash docker/test/smoke.sh
   ```

### Endpoints principales

* `GET /health` — estado general del backend
* `GET /status` — estado de proveedores y cache
* `POST /probability` — { lat, lon, date, type } → { probability }
* `GET /history?lat&lon&from&to` — series históricas

> Fuentes de datos: NASA POWER, GES DISC / Earthdata; complementario Open-Meteo.
> La app reporta **probabilidades** de condiciones extremas basadas en datos históricos.
