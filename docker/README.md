## Requisitos

Requisitos: Docker + Docker Compose.

## Forma fácil (Makefile)

Esta es la forma recomendada para la mayoría de los usuarios. El Makefile disponible facilita la gestión de la infraestructura Docker con comandos simplificados. Las tareas principales son:

- `make up` → Levanta toda la infraestructura (crea `.env` desde `.env.example` si no existe).
- `make down` → Detiene y elimina los contenedores y volúmenes.
- `make logs` → Guarda los logs de docker compose en `compose.log`.
- `make ps` → Muestra el estado actual de los servicios.
- `make rebuild` → Rebuild limpio del backend (sin cache).
- `make smoke` → Corre las pruebas `/health` y `/status`.

Ejemplo de uso:

```bash
make up
# ... trabajar con los servicios ...
make down
```

> Nota: El Makefile simplifica los comandos largos de Docker Compose tanto en desarrollo local como en CI.

## Forma técnica (Docker Compose manual)

1. Copiar variables (sólo para entorno local):
    ```bash
    cd docker
    cp .env.example .env
    ```

2. Build & up:

   ```bash
   docker compose up --build
   ```

3. Verificar:

   * Backend:  [http://localhost:8080/health](http://localhost:${BACKEND_PORT:-8080}/health)
   * Status:   [http://localhost:8080/status](http://localhost:${BACKEND_PORT:-8080}/status)

4. Pruebas smoke:

   ```bash
   bash docker/test/smoke.sh
   ```

---

## Información adicional

### Endpoints principales

* `GET /health` — estado general del backend  
* `GET /status` — estado de proveedores y cache  
* `POST /probability` — { lat, lon, date, type } → { probability }  
* `GET /history?lat&lon&from&to` — series históricas  

> Fuentes de datos: NASA POWER, GES DISC / Earthdata; complementario Open-Meteo.  
> La app reporta **probabilidades** de condiciones extremas basadas en datos históricos.

---

## Integración con GitHub Actions (CI/CD)

En el pipeline de GitHub Actions, el archivo `.env` se genera automáticamente durante la etapa `Prepare env` utilizando los secretos configurados en el repositorio. Por esta razón, no se debe subir el archivo `.env` al repositorio para evitar exponer información sensible.

Además, los workflows ejecutan análisis de seguridad como Trivy, Gitleaks, entre otros, y pruebas de smoke automatizadas para garantizar la calidad y seguridad del código.
