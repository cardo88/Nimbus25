

# 🗃️ Modelo de Datos – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🎯 Propósito del documento

Definir cómo se estructuran, almacenan y procesan los datos en el sistema Nimbus25.  
Este documento detalla los **datasets seleccionados**, las **variables utilizadas**, las **claves de integración (merge)** y la **estrategia de almacenamiento y cache** empleada durante el desarrollo del prototipo.

---

## 🛰️ Datasets seleccionados

| Fuente | Descripción | Variables de interés | Frecuencia | Acceso |
|--------|--------------|----------------------|-------------|--------|
| **NASA POWER API** | Datos meteorológicos derivados de observaciones satelitales y modelos globales. | Temperatura máxima, radiación solar, velocidad del viento, precipitación diaria. | Diaria | API REST JSON |
| **Open-METEO** | Servicio libre para pronóstico y series históricas climáticas. | Temperatura, viento, lluvia, nubosidad. | Horaria / Diaria | API REST JSON |
| **GES DISC (NASA)** | Dataset de precipitación global (opcional para ampliación futura). | Precipitación acumulada, humedad, nubosidad. | Diaria / Semanal | API REST o descarga netCDF |

> Durante el MVP se prioriza el uso de **NASA POWER API** y **Open-METEO**, por su accesibilidad y simplicidad.

---

## 🧩 Estructura de datos interna

Cada dataset se normaliza a un formato común antes de almacenarse o analizarse.

```json
{
  "source": "NASA_POWER",
  "lat": -34.9,
  "lon": -56.2,
  "date": "2025-10-10",
  "variables": {
    "temperature_max": 30.5,
    "wind_speed": 12.8,
    "precipitation": 2.1,
    "radiation": 235.4
  },
  "fetched_at": "2025-10-10T22:10:00Z"
}
```

---

## 🔑 Claves de merge

Los datasets se integran utilizando las siguientes claves:

| Campo | Tipo | Descripción |
|--------|------|--------------|
| `lat` | Float | Latitud geográfica en grados decimales |
| `lon` | Float | Longitud geográfica en grados decimales |
| `date` | String (YYYY-MM-DD) | Fecha de observación o registro |

> En caso de múltiples observaciones por día, se promedian los valores o se toma el máximo/mínimo según la variable.

---

## 📊 Variables normalizadas

| Variable | Unidad | Fuente original | Descripción | Tratamiento |
|-----------|---------|----------------|--------------|--------------|
| `temperature_max` | °C | NASA POWER / Open-METEO | Temperatura máxima diaria | Conversión a °C si es necesario |
| `wind_speed` | m/s | NASA POWER | Velocidad promedio diaria del viento | Redondeo a un decimal |
| `precipitation` | mm | NASA POWER / GES DISC | Precipitación acumulada | Máximo diario |
| `radiation` | W/m² | NASA POWER | Radiación solar global | Promedio diario |

---

## 🧮 Cálculo de probabilidad

El cálculo de probabilidad para una condición extrema se basa en **percentiles históricos**:

| Condición | Variable usada | Umbral | Método estadístico |
|------------|----------------|---------|---------------------|
| `rain` | Precipitación | > percentil 90 | Cálculo de frecuencia de días lluviosos extremos |
| `heat` | Temperatura máxima | > percentil 90 | Días con calor extremo |
| `wind` | Velocidad del viento | > percentil 90 | Días con viento fuerte |

**Ejemplo:**
> Si en los últimos 10 años el 10% de los días superó los 30°C, entonces para la fecha seleccionada la probabilidad de “calor extremo” es 10%.

---

## 🧠 Estrategia de cache y almacenamiento

| Nivel | Tecnología | Propósito |
|--------|-------------|------------|
| **Memoria (RAM)** | Cache interna (in-memory) | Respuestas rápidas a consultas recientes |
| **Persistente local** | SQLite / Redis (Docker) | Guardar datasets normalizados |
| **Archivo temporal** | JSON / CSV en carpeta `/data/` | Copia de respaldo durante pruebas |
| **Logs / Métricas** | Archivo plano o consola | Auditoría y monitoreo del uso |

### Política de cache-aside
1. Al consultar `/probability`, el backend primero busca en cache.  
2. Si no hay datos, consulta la API NASA.  
3. Normaliza y guarda en cache para futuras consultas.  
4. Si la API falla, intenta usar el último dataset disponible (modo degradado).

---

## 📦 Ejemplo de almacenamiento local (SQLite)

```sql
CREATE TABLE weather_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    lat REAL NOT NULL,
    lon REAL NOT NULL,
    date TEXT NOT NULL,
    temperature_max REAL,
    wind_speed REAL,
    precipitation REAL,
    radiation REAL,
    fetched_at TEXT
);
```

---

## 🧭 Consideraciones futuras

- Implementar compresión de datasets grandes.  
- Incluir variables de nubosidad y humedad relativa.  
- Permitir exportación en formato CSV o netCDF.  
- Explorar almacenamiento en nube (S3, Azure Blob o similar).  

---

> *“Los datos son el combustible del proyecto; mantenerlos limpios, coherentes y accesibles es clave para su éxito.”*  
> — Equipo Nimbus25