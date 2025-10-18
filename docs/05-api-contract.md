# 🔌 Contrato de API – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🎯 Propósito del documento

Definir los **endpoints REST** del prototipo Nimbus25, junto con sus parámetros, respuestas esperadas y manejo de errores.  
El objetivo es estandarizar la comunicación entre **frontend y backend**, garantizando claridad y trazabilidad.

---

## 🌐 Base URL

Durante el desarrollo local:

[http://localhost:8080](http://localhost:8080)

Cuando se despliegue en la nube, la base URL podrá cambiar (por ejemplo: `https://api.nimbus25.app`).

---

## 📍 Endpoints principales

### 1️⃣ `GET /health`

Verifica el estado general del servicio backend.

| Propósito | Comprobar si el backend está operativo. |
|------------|------------------------------------------|
| Método | `GET` |
| Autenticación | No requiere |

#### ✅ Respuesta 200 OK
```json
{
  "status": "UP",
  "version": "0.1.0",
  "uptime_seconds": 3600
}
````

---

### 2️⃣ `GET /status`

Devuelve el estado actual de las **fuentes de datos** (APIs NASA) y de la **cache local**.

| Propósito | Monitorear la salud de las dependencias. |
| --------- | ---------------------------------------- |
| Método    | `GET`                                    |

#### ✅ Respuesta 200 OK

```json
{
  "sources": [
    { "name": "NASA POWER", "status": "UP", "lastSync": "2025-10-10T18:00:00Z" },
    { "name": "Open-METEO", "status": "DEGRADED", "lastSync": "2025-10-10T17:45:00Z" }
  ],
  "cache": {
    "hitRatio": 0.82,
    "itemsStored": 1250
  }
}
```

#### ⚠️ Respuesta 503 (alguna fuente caída)

```json
{
  "sources": [
    { "name": "NASA POWER", "status": "DOWN" }
  ],
  "cache": { "hitRatio": 0.75 },
  "message": "Una o más fuentes de datos no responden."
}
```

---

### 3️⃣ `GET /probability`

Devuelve la probabilidad estimada de que ocurra una **condición extrema** (lluvia, calor, viento, etc.) en una ubicación y fecha determinadas.

| Propósito     | Obtener probabilidad y estado de datos para un punto geográfico. |
| ------------- | ---------------------------------------------------------------- |
| Método        | `GET`                                                            |
| Autenticación | No requerida en MVP                                              |
| Parámetros    |                                                                  |
| `lat`         | (float) Latitud en grados decimales                              |
| `lon`         | (float) Longitud en grados decimales                             |
| `date`        | (string, formato `YYYY-MM-DD`) Fecha de consulta                 |

#### ✅ Respuesta 200 OK

```json
{
  "probability": 0.73,
  "condition": "rain",
  "method": "percentile_p90",
  "data_source_status": "FRESH",
  "traceId": "abc123ef45",
  "timestamp": "2025-10-10T22:30:00Z"
}
```

#### ⚠️ Respuesta 200 (modo degradado)

```json
{
  "probability": 0.65,
  "condition": "rain",
  "method": "cached_estimation",
  "data_source_status": "DEGRADED",
  "traceId": "cdef4567",
  "timestamp": "2025-10-10T22:30:00Z"
}
```

#### ❌ Respuesta 503 (no hay datos disponibles)

```json
{
  "code": "DATA_UNAVAILABLE",
  "message": "No hay información para la fecha y ubicación solicitadas.",
  "traceId": "xyz789",
  "status": 503
}
```

---

### 4️⃣ `GET /history`

Devuelve el historial de consultas recientes realizadas desde el mismo dispositivo o usuario (si se implementa autenticación).

| Propósito | Permitir al usuario revisar consultas previas. |
| --------- | ---------------------------------------------- |
| Método    | `GET`                                          |

#### ✅ Respuesta 200 OK

```json
{
  "history": [
    {
      "lat": -34.9,
      "lon": -56.2,
      "date": "2025-10-10",
      "condition": "rain",
      "probability": 0.72,
      "createdAt": "2025-10-10T20:15:00Z"
    },
    {
      "lat": -33.5,
      "lon": -57.1,
      "date": "2025-10-09",
      "condition": "wind",
      "probability": 0.41,
      "createdAt": "2025-10-09T19:00:00Z"
    }
  ]
}
```

---

## 🧱 Estructura general de errores

Todos los errores comparten el mismo formato de respuesta JSON:

```json
{
  "code": "ERROR_TYPE",
  "message": "Descripción legible para humanos",
  "traceId": "uuid-o-id-de-petición"
}
```

| Código             | Descripción                                     |
| ------------------ | ----------------------------------------------- |
| `DATA_UNAVAILABLE` | No hay datos válidos para la fecha o ubicación. |
| `API_TIMEOUT`      | Alguna fuente NASA no respondió a tiempo.       |
| `INVALID_PARAMS`   | Parámetros ausentes o incorrectos.              |
| `INTERNAL_ERROR`   | Error inesperado del servidor.                  |

---

## 🧠 Convenciones adicionales

* **Respuestas siempre JSON**
  Todos los endpoints responden en formato `application/json`.

* **Trazabilidad (`traceId`)**
  Cada petición recibe un identificador único para correlacionar logs.

* **Versionado**
  El MVP no versiona endpoints aún, pero se prevé prefijo `/api/v1/` en etapas futuras.

---

## 🧩 Ejemplo de flujo completo (curl)

```bash
curl -X GET "http://localhost:8080/probability?lat=-34.9&lon=-56.2&date=2025-10-10&condition=rain"
```

**Respuesta esperada:**

```json
{
  "probability": 0.73,
  "condition": "rain",
  "data_source_status": "FRESH",
  "method": "percentile_p90"
}
```

---

> *“Endpoints simples, respuestas consistentes y manejo de errores predecible: la clave de una buena API.”*
> — Equipo Nimbus25
