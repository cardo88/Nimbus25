# 🧩 Arquitectura General – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🌐 Visión general

La arquitectura de Nimbus25 se basa en una **estructura modular y portable**, diseñada para correr localmente durante el desarrollo y escalar fácilmente a entornos en la nube (AWS, Azure o infraestructura UCU) cuando sea necesario.

El sistema está compuesto por tres capas principales:

1. **Frontend (Interfaz de Usuario)**  
   Aplicación móvil desarrollada en React.  
   Proporciona la interfaz interactiva donde el usuario puede:
   - Seleccionar ubicación y fecha  
   - Visualizar resultados en un mapa  
   - Consultar el estado del sistema y las fuentes NASA
   - Revisar historial de consultas  

2. **Backend (API y lógica de negocio)**  
   Servicio central que conecta el frontend con las fuentes de datos externas.  
   Se encarga de:
   - Consultar las APIs de la NASA y otros servicios climáticos  
   - Procesar, normalizar y combinar los datasets  
   - Calcular probabilidades o métricas estadísticas
   - Exponer endpoints REST:  
     `/probability`, `/status`, `/health`, `/history`

3. **Infraestructura y DevOps**  
   Entorno de ejecución local (Docker Compose) con posibilidad de migrar a nube.  
   Incluye:
   - Contenedores para backend y cache  
   - Monitoreo mediante health checks y logs estructurados

---

## ⚙️ Diagrama de arquitectura general

```plantuml
@startuml
title Vista de la Arquitectura - Nimbus25

skinparam packageStyle rectangle
skinparam componentStyle rectangle
skinparam shadowing false

actor "Usuario" as user

package "Capa Específica" {
  [Frontend]
  [Backend]
}

package "Capa General" {
  [Cache]
  [APIs NASA]
  [Logger]
  [Métricas]
}

user --> [Frontend] : Interacción vía UI
[Frontend] --> [Backend] : REST / HTTPS
[Backend] --> [Cache] : Redis
[Backend] --> [APIs NASA] : APIs HTTP
[Backend] --> [Logger]
[Backend] --> [Métricas]

note right of [Backend]
- Procesa datos y calcula probabilidades  
- Expone /probability, /status, /health, /history  
- Gestiona cache y resiliencia
end note

@enduml
````

```plantuml
@startuml
title Arquitectura General - Nimbus25

actor Usuario

Usuario --> [Frontend] : Interacción vía UI
[Frontend] --> [Backend] : Peticiones REST (HTTP/JSON)
[Backend] --> [Cache] : Lectura/Escritura de datos
[Backend] --> [APIs NASA] : Consultas de datasets
[Backend] --> [Logger] : Registros estructurados
[Backend] --> [Métricas] : Exposición /metrics

note right of [Backend]
Endpoints:
- /probability
- /status
- /health
- /history
end note

@enduml
````

---

## 🧱 Componentes principales

| Componente                       | Descripción                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Frontend**                     | Interfaz de usuario (React/Expo). Permite búsquedas, visualización de mapas y resultados.     |
| **API Gateway / Backend**        | Lógica principal. Gestiona solicitudes, conecta con fuentes NASA y aplica cálculos estadísticos. |
| **NASA Data Clients**            | Módulos de conexión con distintas APIs (MERRA, IMERG).                            |
| **Cache / Almacenamiento local** | Base de datos ligera (Redis) que almacena respuestas recientes o datasets preprocesados.  |
| **Logger & Métricas**            | Registro estructurado en consola o archivo. Exposición de métricas y health checks.              |
| **Scheduler (opcional)**         | Tareas periódicas para actualizar datasets y limpiar cache.                                      |

---

## 🧠 Decisiones de diseño

1. **Arquitectura modular (Clean / Hexagonal)**

   * Permite aislar la lógica del dominio de los detalles de infraestructura.
   * Facilita reemplazar adaptadores (por ejemplo, cambiar Redis por SQLite).

2. **Enfoque “local-first”**

   * Se prioriza la ejecución en laptops del equipo sin depender de servicios externos.
   * Posterior migración a nube será sencilla gracias a contenedores Docker.

3. **Escalabilidad futura**

   * Monolito modular hoy, con posibilidad de dividir en microservicios (API / Worker / UI) en futuras etapas.

---

## 🧰 Tecnologías por capa

| Capa               | Tecnologías sugeridas                    |
| ------------------ | ---------------------------------------- |
| Frontend           | React Native + Expo                      |
| Backend            | Node.js (Express) y Python (FastAPI)     |
| Cache/DB           | Redis                                    |
| Contenedores       | Docker + Docker Compose                  |
| Diagramas          | PlantUML                                 |
| Monitoreo          | Health checks.                           |
| Control de versión | Git + GitHub                             |
| Apis externas      | NASA Open APIs                           |
| Métricas y salud   | Endpoints /health, /status               |
| Control de versión | Git + GitHub / GitLab                    |
| CI/CD              | GitHub Actions / Docker Hub              |

---

## 🧭 Comunicación entre componentes

* **Frontend ↔ Backend:**
  HTTP/REST con respuestas JSON.

* **Backend ↔ APIs NASA:**
  Peticiones HTTP y transformación de datos a un formato canónico.

* **Backend ↔ Cache/DB:**
  Acceso síncrono a datos locales.

---

## 🧩 Evolución esperada

| Etapa       | Objetivo                                           | Resultado           |
| ----------- | -------------------------------------------------- | ------------------- |
| **Etapa 1** | Prototipo local con Docker Compose                 | MVP funcional       |
| **Etapa 2** | Integración de APIs adicionales y mejoras visuales | Versión extendida   |
| **Etapa 3** | Despliegue en nube (UCU / AWS / Azure)             | Demo online         |
| **Etapa 4** | Escalamiento modular y CI/CD                       | Proyecto productivo |

---

> *La arquitectura de Nimbus25 busca equilibrio entre claridad conceptual, facilidad de implementación y potencial de crecimiento futuro.*
