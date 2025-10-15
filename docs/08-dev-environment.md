

# 🧰 Entorno de Desarrollo – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🎯 Propósito del documento

Este documento explica cómo **configurar, ejecutar y probar el entorno local** del proyecto Nimbus25.  
El objetivo es garantizar que todos los integrantes del equipo puedan trabajar de forma uniforme, sin depender de servicios en la nube.

---

## 🧩 Requisitos previos

| Herramienta | Versión recomendada | Descripción |
|--------------|--------------------|--------------|
| **Git** | ≥ 2.40 | Control de versiones |
| **Node.js** | ≥ 20.x | Para ejecutar el backend (Express) |
| **Python (alternativo)** | ≥ 3.10 | Opción alternativa si se usa FastAPI |
| **Docker Desktop / CLI** | ≥ 4.x | Contenedores y orquestación local |
| **PlantUML** | ≥ 1.2023 | Generación de diagramas |
| **VS Code** | Última | Editor de código recomendado |
| **Postman / cURL** | — | Pruebas de endpoints REST |

---

## 🗂️ Estructura del proyecto

```bash
Nimbus25/
├── frontend/               # Interfaz web o móvil (según tecnología elegida)
├── backend/                # Lógica del servidor y API REST
│   ├── api/                # Endpoints y middlewares
│   ├── domain/             # Lógica de negocio y cálculos
│   ├── adapters/           # Clientes NASA, cache, métricas, logger
│   └── scheduler/          # Tareas automáticas (opcional)
├── docker/                 # Archivos de despliegue local
├── docs/                   # Documentación técnica
└── .env.example            # Variables de entorno base
```

---

## ⚙️ Configuración inicial

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Nimbus25/nimbus25.git
   cd nimbus25
   ```

2. **Crear el archivo `.env`**
   Copiar desde el ejemplo:
   ```bash
   cp .env.example .env
   ```

3. **Instalar dependencias del backend**
   ```bash
   cd backend
   npm install
   ```

4. **Configurar variables de entorno básicas**

   | Variable | Descripción | Ejemplo |
   |-----------|--------------|----------|
   | `PORT` | Puerto del backend | `8080` |
   | `CACHE_ENABLED` | Activa cache local | `true` |
   | `NASA_API_BASEURL` | Endpoint base NASA POWER | `https://power.larc.nasa.gov/api/` |
   | `LOG_LEVEL` | Nivel de logs (`info`, `debug`, `error`) | `info` |

5. **Iniciar el backend**
   ```bash
   npm run dev
   ```
   El servidor se ejecutará en: [http://localhost:8080](http://localhost:8080)

---

## 🐳 Ejecución con Docker Compose

1. **Construir y ejecutar contenedores**
   ```bash
   docker compose up --build
   ```

2. **Verificar contenedores activos**
   ```bash
   docker ps
   ```

3. **Acceder a la API**
   ```
   http://localhost:8080/health
   ```

4. **Detener servicios**
   ```bash
   docker compose down
   ```

---

## 🧪 Pruebas locales

### Verificar endpoints principales
```bash
curl http://localhost:8080/health
curl http://localhost:8080/status
curl "http://localhost:8080/probability?lat=-34.9&lon=-56.2&date=2025-10-10&condition=rain"
```

### Pruebas automáticas (si se incluyen)
```bash
npm test
```

---

## 🌐 Configuración del frontend (según elección del equipo)

### Si se usa **React**
```bash
cd frontend
npm install
npm run dev
```
Acceso en [http://localhost:5173](http://localhost:5173)

### Si se usa **Flutter**
```bash
cd frontend
flutter pub get
flutter run -d chrome
```
Acceso en [http://localhost:8080](http://localhost:8080)

---

## 🧭 Buenas prácticas locales

- Mantener `.env` fuera del control de versiones (`.gitignore`)  
- Usar ramas por feature (`feat/`, `fix/`, `refactor/`)  
- Hacer `pull` frecuente desde `main` para evitar conflictos  
- Nombrar commits descriptivamente (en inglés o español uniforme)  
- Validar endpoints antes de mergear cambios  
- Actualizar documentación si se agregan endpoints o variables  

---

> *“Un entorno reproducible es la base de un equipo eficiente.”*  
> — Equipo Nimbus25