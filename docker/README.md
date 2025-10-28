# Requisitos previos

Para trabajar con esta infraestructura es necesario contar con:

- **Docker** y **Docker Compose** instalados.
- **Make** para facilitar la gestión de comandos.

---

# Configuración inicial (primer uso)

Antes de levantar los servicios por primera vez, es necesario inicializar los archivos de configuración:

```bash
make init
```

Este comando crea los archivos `.env` y `_netrc` a partir de sus plantillas `.env.example` y `_netrc.example`. 

> **Importante:** Edita ambos archivos para reemplazar los valores de los placeholders con tus credenciales y configuraciones específicas.

---

# Levantamiento de la infraestructura

Una vez finalizada la configuracion inicial, levantar la infraestructura con:

```bash
make up
```

---

# Información útil

## Levantar infrastructura de forma fácil (Makefile)

El Makefile simplifica la gestión de la infraestructura Docker con comandos claros:

- `make up`  
  Levanta todos los servicios. Si `.env` no existe, lo crea desde `.env.example`.

- `make down`  
  Detiene y elimina contenedores y volúmenes asociados.

- `make logs`  
  Guarda los logs de Docker Compose en el archivo `compose.log`.

- `make ps`  
  Muestra el estado actual de los servicios en ejecución.

- `make rebuild`  
  Reconstruye el backend sin usar cache para un build limpio.

- `make smoke`  
  Ejecuta pruebas básicas de salud (`/health` y `/status`) para verificar que los servicios funcionan correctamente.

---

## Levantar infrastructura de forma técnica (manual)

Para quienes prefieran usar Docker Compose directamente, los pasos son:

1. Copiar variables de entorno (solo para entorno local):

   ```bash
   cd docker
   cp .env.example .env
   cp docker/edl/_netrc.example docker/edl/_netrc
   ```

2. Construir y levantar los servicios:

   ```bash
   docker compose up --build
   ```

3. Verificar el estado accediendo a:

   - Backend health: [http://localhost:8080/health](http://localhost:8080/health)  
   - Status: [http://localhost:8080/status](http://localhost:8080/status)

4. Ejecutar pruebas smoke manualmente:

   ```bash
   bash docker/test/smoke.sh
   ```

---

## Endpoints principales

- `GET /health`  
  Estado general del backend.

- `GET /status`  
  Estado de proveedores y cache.

- `POST /probability`  
  Parámetros: `{ lat, lon, date }`  
  Respuesta: `{ probability }`

- `GET /history?lat&lon&from&to`  
  Series históricas de datos meteorológicos.

---

# Integración con GitHub Actions

En el pipeline de GitHub Actions, los archivos `.env` y `_netrc` se generan automáticamente durante la etapa `Prepare env` utilizando los secretos configurados en el repositorio.

Por seguridad, **no se deben subir estos archivos al repositorio** para evitar exponer información sensible.

Además, el pipeline ejecuta análisis de seguridad como Trivy y Gitleaks, junto con pruebas smoke automatizadas, para garantizar la calidad y seguridad del código.
