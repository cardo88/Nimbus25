

# 🗃️ Modelo de Datos – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🎯 Propósito del documento

Definir cómo se estructuran, procesan y cachean los datos en el sistema Nimbus25.
Este documento detalla los **datasets satelitales utilizados**, las **variables atmosféricas manejadas** y las **claves de integración (merge)** aplicadas en el backend.

---

## 🛰️ Datasets seleccionados

| Fuente                        | Descripción                                                                                                   | Variables de interés          | Frecuencia   | Acceso          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------ | --------------- |
| **MERRA-2 (NASA GES DISC)**   | Reanálisis atmosférico global. Proporciona variables de temperatura, viento y humedad cerca de la superficie. | `T2M`, `U10M`, `V10M`, `QV2M` | 1 h / 3 h    | OPeNDAP / Hyrax |
| **GPM IMERG (NASA GES DISC)** | Estimaciones satelitales de precipitación con alta resolución espacial y temporal.                            | `precipitationCal`            | 30 min / 1 h | OPeNDAP / Hyrax |

> Nimbus25 consulta únicamente MERRA-2 e IMERG, accediendo vía OPeNDAP mediante el cliente implementado en services/weather/opendap-client.js.
> Los datos se normalizan localmente sin almacenamiento persistente.

---

## 🧩 Estructura de datos interna

Cada dataset se normaliza a un formato común antes de almacenarse o analizarse.

```json
{
  "source": "MERRA2",
  "lat": -34.9,
  "lon": -56.2,
  "datetime": "2025-10-25T12:00:00Z",
  "variables": {
    "T2M": 18.8,
    "RH": 63.9,
    "U10M": 3.1,
    "V10M": 1.2,
    "precipitationCal": 0.4
  },
  "units": {
    "T2M": "°C",
    "RH": "%",
    "U10M": "m/s",
    "V10M": "m/s",
    "precipitationCal": "mm/hr"
  },
  "fetched_at": "2025-10-25T12:10:05Z"
}
```

---

## 🔑 Claves de merge

Los datasets se integran utilizando las siguientes claves:

| Campo      | Tipo     | Descripción                    |
| ---------- | -------- | ------------------------------ |
| `lat`      | Float    | Latitud del punto consultado   |
| `lon`      | Float    | Longitud del punto consultado  |
| `datetime` | ISO 8601 | Fecha y hora UTC del registro  |
| `source`   | String   | Identifica el dataset original |

> El merge entre MERRA-2 e IMERG se hace por coincidencia espacial (nearest grid) y temporal (nearest timestamp).
> Si las resoluciones difieren, se interpola linealmente o se promedian los valores más cercanos.

---

## 📊 Variables normalizadas

| Variable                  | Unidad | Fuente original            | Descripción                                      | Tratamiento                               |
| ------------------------- | ------ | -------------------------- | ------------------------------------------------ | ----------------------------------------- |
| `T2M`                     | °C     | MERRA-2                    | Temperatura a 2 m sobre el suelo                 | Conversión de K → °C                      |
| `U10M` / `V10M`           | m/s    | MERRA-2                    | Componentes zonal y meridional del viento a 10 m | Cálculo de magnitud e intensidad          |
| `RH`                      | %      | Derivada de `T2M` y `QV2M` | Humedad relativa del aire                        | Cálculo según fórmula NOAA                |
| `precipitationCal`        | mm/hr  | GPM IMERG                  | Tasa de precipitación combinada                  | Promedio horario o acumulado              |
| `heat_index` *(derivada)* | °C     | MERRA-2 + fórmula NOAA     | Índice de incomodidad térmica                    | Cálculo local (ver documento de métricas) |

---

## 🧮 Cálculo de probabilidad

El sistema no usa percentiles históricos sino probabilidad instantánea de precipitación derivada de IMERG y métricas combinadas.

### Lógica simplificada:

1. Se obtiene precipitationCal de IMERG para la ventana solicitada (hours).
2. Se combinan variables de MERRA-2 (RH, T2M, U10M, V10M) para ajustar condiciones atmosféricas.
3. Se aplica un umbral empírico (ej. > 0.1 mm/hr → “lluvia”) y se calcula el porcentaje de instancias lluviosas en la ventana.

### Ejemplo de salida:

```json
{
  "probabilityRain": 0.68,
  "expectedIntensityMm": 3.2,
  "category": "moderate"
}
```
---

## 🧭 Consideraciones futuras

- Implementar compresión de datasets grandes.
- Implementar persistencia opcional (PostgreSQL o S3) para almacenamiento histórico.
- Incorporar nubosidad (CLDTOT) y presión superficial (PS) desde MERRA-2.
- Mejorar interpolación bilineal en grid.js para ubicaciones entre celdas.
- Agregar compresión transparente y métricas de cache hit ratio.
- Soporte para exportación CSV/JSON en endpoint /history.

---

> *“Los datos son el combustible del proyecto; mantenerlos limpios, coherentes y accesibles es clave para su éxito.”*  
> — Equipo Nimbus25
