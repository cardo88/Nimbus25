# 🌦️ Nimbus25

### 2025 NASA Space Apps Challenge  
**Desafío:** *Will It Rain On My Parade?*  
**Equipo:** Nimbus25  

---

## 🚀 Descripción del Proyecto

Nimbus25 busca predecir la probabilidad de condiciones meteorológicas extremas en un lugar y fecha seleccionados, utilizando datos abiertos de la NASA y otras fuentes climáticas públicas.  
El objetivo es ofrecer una herramienta visual y accesible que ayude a planificar actividades al aire libre basadas en patrones históricos de clima, priorizando **integración tecnológica, usabilidad y resiliencia**.

---

## 🎯 Objetivo del Prototipo

Desarrollar un **MVP funcional** que permita:
- Consultar la probabilidad de condiciones extremas (lluvia, calor, viento, etc.)  
- Visualizar resultados en un mapa interactivo  
- Mostrar el estado de las APIs utilizadas (health checks)  
- Guardar el historial de consultas del usuario  
- Ejecutarse de forma local y portable (sin dependencia inicial de una nube específica)

---

## 🧩 Arquitectura General

El sistema se compone de tres capas principales:

1. **Frontend**  
   - Interfaz móvil/web basada en el diseño del equipo de UI (Figma)  
   - Dark/Light mode, múltiples pantallas (consulta, estado, configuración, historial)

2. **Backend**  
   - API REST con endpoints `/probability`, `/status`, `/health`, `/history`  
   - Módulos internos: API, Dominio, Adaptadores (NASA, Cache/DB, Logs, Métricas)  
   - Estrategia *Cache-Aside* y manejo de errores ante caídas de las APIs NASA  

3. **Infraestructura y DevOps**  
   - Entorno local con Docker Compose  
   - Preparado para futura ejecución en nube (AWS, Azure o infraestructura UCU)  
   - Observabilidad básica: logs estructurados y health checks

---

## 🧱 Estructura del Repositorio

```

Nimbus25/
├── frontend/                # Interfaz web o móvil
├── backend/                 # API principal y lógica de dominio
├── docker/                  # Archivos Docker y Compose
├── docs/                    # Documentación técnica
│   ├── 01-onepager.md
│   ├── 02-architecture-overview.md
│   ├── 03-components.md
│   ├── 04-sequence-flows.md
│   ├── 05-api-contract.md
│   ├── 06-data-model.md
│   ├── 07-patterns-and-principles.md
│   ├── 08-dev-environment.md
│   ├── 09-deployment-plan.md
│   ├── 10-quality-and-resilience.md
│   ├── 11-next-steps.md
│   └── TEAM.md
└── README.md

```

---

## 📄 Documentación

| Archivo | Descripción |
|----------|--------------|
| [01-onepager.md](docs/01-onepager.md) | Visión general del proyecto |
| [02-architecture-overview.md](docs/02-architecture-overview.md) | Arquitectura general y tecnologías |
| [03-components.md](docs/03-components.md) | Componentes internos del backend |
| [04-sequence-flows.md](docs/04-sequence-flows.md) | Diagramas de flujo de uso |
| [05-api-contract.md](docs/05-api-contract.md) | Contrato de API REST (endpoints y ejemplos) |
| [06-data-model.md](docs/06-data-model.md) | Modelos de datos y datasets NASA |
| [07-patterns-and-principles.md](docs/07-patterns-and-principles.md) | Patrones de diseño y arquitectura aplicados |
| [08-dev-environment.md](docs/08-dev-environment.md) | Instrucciones para entorno local |
| [09-deployment-plan.md](docs/09-deployment-plan.md) | Estrategia de despliegue local/nube |
| [10-quality-and-resilience.md](docs/10-quality-and-resilience.md) | Estrategias de robustez y testing |
| [11-next-steps.md](docs/11-next-steps.md) | Mejoras futuras y evolución |
| [TEAM.md](docs/TEAM.md) | Integrantes y roles del equipo |

---

## 🧠 Tecnologías propuestas

| Área | Tecnología sugerida |
|------|----------------------|
| Frontend | React / Flutter (a elección del equipo de UI) |
| Backend | Node.js (Express) o Python (FastAPI) |
| Base de datos / cache | SQLite o Redis local |
| Contenedores | Docker + Docker Compose |
| Diagramas | PlantUML / Draw.io |
| APIs NASA | Open-METEO, POWER API, GES DISC |
| Control de versión | Git + GitHub |
| Documentación | Markdown + OpenAPI |

---

## 💡 Principios guía

- Simplicidad y modularidad ante todo  
- Diseñar pensando en escalabilidad futura  
- Fallback a datos cacheados cuando las APIs fallen  
- Transparencia y reproducibilidad (todo documentado)  
- Entregable funcional aunque limitado en alcance  

---

## 👥 Equipo Nimbus25

| Nombre | Rol | Área |
|--------|-----|------|
| *(agregar integrantes)* | | |
| *(agregar integrantes)* | | |
| *(agregar integrantes)* | | |

---

## 📅 Estado actual

- ✅ Etapa de diseño conceptual  
- 🔄 Documentación técnica en progreso  
- ⏳ Implementación del prototipo (backend + front)  
- 🧭 Próximo paso: definir endpoints mínimos y flujos de datos

---

## 🧹 Limpiar artefactos generados (nota para repo)

Este repositorio mantiene sólo el código fuente y documentación. Algunos archivos y carpetas se generan localmente por herramientas de construcción (CocoaPods, Gradle, Expo) y no deberían estar versionados. Si quieres reducir el tamaño del repo o preparar una copia limpia, puedes eliminar los artefactos generados y regenerarlos localmente:

1. Eliminar artefactos (seguro):

```bash
# desde la raíz del repo
rm -rf Nimbus25App/node_modules Nimbus25App/.expo Nimbus25App/android/app/build Nimbus25App/ios/Pods Nimbus25App/ios/build Nimbus25App/ios/*.xcworkspace
```

1. Regenerar localmente:

```bash
cd Nimbus25App
npm install
# iOS: desde Mac con CocoaPods instalado
cd ios && pod install
# Volver y ejecutar
cd ..
expo start
```

Si no tienes un entorno nativo (Xcode/Android Studio) puedes seguir usando Expo Go para desarrollo sin ejecutar los pasos nativos.


## 🛰️ Inspiración

> “Explorar el clima, entender los patrones, y usar los datos de la NASA para ayudar a la gente a planificar su día con confianza.”  
> — Equipo Nimbus25

---
