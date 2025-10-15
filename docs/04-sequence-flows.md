

# 🔄 Flujos de Secuencia – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🧩 Propósito del documento

Este documento describe los **flujos principales de interacción** dentro del sistema Nimbus25.  
Su objetivo es representar gráficamente cómo se comunican los distintos componentes (Frontend, Backend, Adapters y APIs NASA) durante los procesos clave.

---

## ☁️ Flujo 1: Consulta de probabilidad climática

Este flujo representa la operación más importante del sistema:  
**el usuario consulta la probabilidad de una condición extrema (lluvia, calor, viento, etc.) para una ubicación y fecha dadas.**

```plantuml
@startuml
title Flujo - Consulta de Probabilidad Climática

actor Usuario
Usuario -> Frontend: Ingreso de ubicación y fecha
Frontend -> Backend: GET /probability?lat=&lon=&date=&condition=
Backend -> Cache: Buscar datos normalizados
alt Datos en cache
  Cache --> Backend: Retorna datos
else Cache vacío
  Backend -> NASA_Adapter: Solicitar datos (API NASA)
  NASA_Adapter -> API_NASA: GET /climate-data
  API_NASA --> NASA_Adapter: Respuesta con dataset
  NASA_Adapter --> Backend: Datos normalizados
  Backend -> Cache: Guardar datos
end
Backend -> Domain: Calcular probabilidad
Domain --> Backend: Resultado (probabilidad + método + estado)
Backend --> Frontend: JSON { probability, method, status }
Frontend --> Usuario: Visualiza resultado y gráfico
@enduml
```

---

## 🔁 Flujo 2: Actualización periódica de datasets (opcional)

Representa una tarea automática (scheduler) que actualiza los datos disponibles para mejorar la precisión de futuras consultas.

```plantuml
@startuml
title Flujo - Actualización Periódica de Datasets

actor Scheduler
Scheduler -> Backend: Ejecutar tarea programada
Backend -> NASA_Adapter: Obtener datasets actualizados
NASA_Adapter -> API_NASA: GET /new-data
API_NASA --> NASA_Adapter: Devuelve datos recientes
NASA_Adapter --> Backend: Datos normalizados
Backend -> Cache_DB: Reemplaza datos anteriores
Backend -> Logger: Registrar actualización
Backend -> Métricas: Actualizar contador de sincronizaciones
@enduml
```

---

## 🚨 Flujo 3: Manejo de errores y modo degradado

Este flujo muestra cómo el sistema responde cuando las APIs de la NASA no están disponibles o devuelven errores.

```plantuml
@startuml
title Flujo - Modo Degradado y Manejo de Errores

actor Usuario
Usuario -> Frontend: Realiza consulta
Frontend -> Backend: GET /probability
Backend -> NASA_Adapter: Solicitud a API NASA
NASA_Adapter -> API_NASA: GET /climate-data
API_NASA --> NASA_Adapter: Error 503 o Timeout
NASA_Adapter --> Backend: Excepción (Timeout/Error)
Backend -> Cache: Buscar datos más recientes
alt Datos disponibles en cache
    Cache --> Backend: Dataset anterior
    Backend --> Frontend: Respuesta con data_source_status = "DEGRADED"
else Cache vacío
    Backend --> Frontend: Error 503 JSON {"code": "DATA_UNAVAILABLE"}
end
Frontend --> Usuario: Mensaje informativo sobre indisponibilidad
@enduml
```

---

## 🧠 Resumen

| Flujo | Descripción | Resultado esperado |
|--------|--------------|--------------------|
| **1. Consulta de probabilidad** | Usuario obtiene la probabilidad de una condición extrema. | Respuesta rápida y visual. |
| **2. Actualización periódica** | Scheduler actualiza datasets y limpia cache. | Datos actualizados y precisos. |
| **3. Modo degradado** | APIs NASA caídas o lentas. Se usa cache o se notifica error. | Sistema resiliente y transparente. |

---

> *“Incluso cuando las APIs fallan, la predicción sigue disponible gracias al modo degradado.”*  
> — Equipo Nimbus25