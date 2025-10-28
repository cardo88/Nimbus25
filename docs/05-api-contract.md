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
    "version": "0.0.1",
    "providers": {
        "dataIntegration": {
            "ok": false,
            "error": "Error",
            "latency_ms": 13
        }
    }
}
```

---

### 3️⃣ `POST /probability`

Devuelve la probabilidad estimada de que ocurra una **condición extrema** (lluvia, calor, viento, etc.) en una ubicación y fecha determinadas.

| Propósito     | Obtener probabilidad y estado de datos para un punto geográfico. |
| ------------- | ---------------------------------------------------------------- |
| Método        | `POST`                                                            |
| Autenticación | No requerida en MVP                                              |
| Parámetros    |                                                                  |
| `lat`         | (float) Latitud en grados decimales                              |
| `lon`         | (float) Longitud en grados decimales                             |
| `date`        | (string, formato `YYYY-MM-DD`) Fecha de consulta                 |

#### ✅ Respuesta 200 OK

```json
{
  "probability": 0.19,
  "condition": "sunny",
  "temperature_max": 27.5,
  "temperature_min": 17.9,
  "inputs": {
    "lat": -34.9,
    "lon": -56.2,
    "date": "2025-10-20"
  },
  "source": "integrationServiceMock",
  "timestamp": "2025-10-18T18:23:16.611Z"
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
  "user": "service-account-nimbus25-backend",
  "count": 1,
  "history": [
    {
      "probability": 0.7,
      "condition": "cloudy",
      "temperature_max": 28.6,
      "temperature_min": 18.8,
      "inputs": {
        "lat": -34.9,
        "lon": -56.16,
        "date": "2025-10-21"
      },
      "source": "integrationServiceMock",
      "timestamp": "2025-10-21T02:31:36.183Z"
    }
  ]
}
```

---

> *“Endpoints simples, respuestas consistentes y manejo de errores predecible: la clave de una buena API.”*
> — Equipo Nimbus25
