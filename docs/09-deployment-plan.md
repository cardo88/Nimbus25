

# 🚀 Plan de Despliegue – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🎯 Propósito del documento

Describir la estrategia de despliegue del prototipo **Nimbus25**, abarcando tanto el entorno local (para desarrollo y pruebas) como la proyección hacia un despliegue futuro en la nube.  
El objetivo es asegurar **reproducibilidad, portabilidad y facilidad de mantenimiento**.

---

## 🧩 Estrategia de despliegue actual (etapa local)

Durante la fase de desarrollo, el sistema se ejecutará completamente de manera **local**, utilizando **Docker Compose** para orquestar los servicios del backend, frontend y cache.

### 📦 Servicios involucrados
| Servicio | Descripción | Puerto local |
|-----------|--------------|---------------|
| `frontend` | Aplicación web (React o Flutter Web) | `5173` o `8080` |
| `backend` | API REST que procesa las consultas | `8080` |
| `cache` | Redis o SQLite como almacenamiento temporal | `6379` |
| `docs` | Carpeta de documentación (opcionalmente servida por VS Code o GitHub Pages) | — |

### 🧱 Ejemplo de `docker-compose.yml`
```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    container_name: nimbus-backend
    ports:
      - "8080:8080"
    env_file:
      - .env
    volumes:
      - ./data:/app/data
    depends_on:
      - cache

  frontend:
    build: ./frontend
    container_name: nimbus-frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  cache:
    image: redis:alpine
    container_name: nimbus-cache
    ports:
      - "6379:6379"
```

### 🧩 Ejecución local
```bash
docker compose up --build
```
El sistema quedará disponible en:
- Frontend → [http://localhost:5173](http://localhost:5173)
- Backend → [http://localhost:8080](http://localhost:8080)
- Redis (opcional) → `localhost:6379`

---

## ☁️ Estrategia de despliegue futura (nube)

En futuras etapas, Nimbus25 podrá desplegarse en una plataforma en la nube (AWS, Azure o la nube UCU).  
El despliegue deberá priorizar **costo cero**, **escalabilidad básica** y **facilidad de configuración**.

### 🔸 Opción 1: AWS (Free Tier)
| Servicio | Uso |
|-----------|-----|
| **AWS Elastic Beanstalk** | Despliegue del backend (Node.js o Python) |
| **AWS Amplify / S3** | Hosting estático del frontend |
| **AWS ElastiCache (Redis)** | Cache y almacenamiento temporal |
| **CloudWatch Logs** | Monitoreo básico |
| **Route53 (opcional)** | DNS personalizado |

### 🔸 Opción 2: Azure
| Servicio | Uso |
|-----------|-----|
| **Azure App Service** | Backend API |
| **Azure Static Web Apps** | Frontend |
| **Azure Cache for Redis** | Cache |
| **Application Insights** | Logs y métricas |

### 🔸 Opción 3: Nube UCU (infra local)
- Despliegue en **máquinas virtuales Ubuntu** o **Docker Swarm**.  
- Uso de **Minikube** para simular Kubernetes y probar balanceo de carga.  
- Configuración de **reverse proxy (NGINX)** para servir frontend + backend bajo un mismo dominio.

---

## ⚙️ CI/CD (Plan futuro)

Aunq ue el MVP no requiere integración continua completa, se proyecta una **pipeline simple**:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install --prefix backend
      - name: Run tests
        run: npm test --prefix backend
      - name: Build Docker images
        run: docker compose build
```

> *La idea es mantener una CI/CD mínima que compile, pruebe y construya imágenes automáticamente al hacer push en `main`.*

---

## 🔍 Monitoreo y logs

- **Logs estructurados (JSON)** → visibles en consola o enviados a servicios externos.  
- **Endpoint `/health`** → permite verificar el estado del backend.  
- **Endpoint `/status`** → informa sobre el estado de las fuentes NASA y la cache.  
- **Métricas simples** → `/metrics` (Prometheus compatible, en el futuro).

---

## 🧭 Recomendaciones de despliegue

1. Usar **variables de entorno** para todo dato sensible (API keys, URLs, etc.).  
2. Mantener **imágenes Docker pequeñas** (multi-stage builds).  
3. Documentar comandos reproducibles (`makefile` o scripts bash).  
4. Probar los `health checks` antes de cada demo o defensa.  
5. Centralizar logs y trazas con un `traceId` por petición.

---

## 🔒 Seguridad básica

- No exponer puertos innecesarios.  
- Limitar origen de peticiones (CORS).  
- No versionar archivos `.env`.  
- Revisar dependencias (`npm audit fix`).  
- Mantener HTTPS en despliegues productivos.

---

> *“Un buen despliegue no depende del tamaño del servidor, sino de lo claro que sea el proceso.”*  
> — Equipo Nimbus25