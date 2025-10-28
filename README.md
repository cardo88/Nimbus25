# Nimbus25

### 2025 NASA Space Apps Challenge  
**Desafío:** *Will It Rain On My Parade?*  
**Equipo:** Nimbus25  

---

## Descripción del Proyecto

Nimbus25 busca predecir la probabilidad de condiciones meteorológicas extremas en un lugar y fecha seleccionados, utilizando datos abiertos de la NASA y otras fuentes climáticas públicas.  
El objetivo es ofrecer una herramienta visual y accesible que ayude a planificar actividades al aire libre basadas en patrones históricos de clima, priorizando **integración tecnológica, usabilidad y resiliencia**.

---

## Objetivo del Prototipo

Desarrollar un **MVP funcional** que permita:
- Consultar la probabilidad de condiciones climaticas. 
- Visualizar resultados en un mapa interactivo  
- Mostrar el estado de las APIs utilizadas (health checks)  
- Guardar el historial de consultas del usuario

---

## Arquitectura General

El sistema se compone de tres capas principales:

1. **Frontend**  
   - Interfaz móvil.
   - Múltiples pantallas (consulta, estado, configuración, historial)

2. **Backend**  
   - API REST con endpoints `/probability`, `/status`, `/health`, `/history`  
   - Módulos internos: Controllers, Routes, Services.

3. **Infraestructura y DevOps**  
   - Entorno local con Docker Compose
   - Observabilidad básica: logs estructurados y health checks

---

## Estructura del Repositorio

```
Nimbus25/
├── frontend/                # Interfaz web o móvil
├── backend/                 # API principal y lógica de servicio.
├── docker/                  # Archivos Docker y Compose
└── docs/                    # Documentación técnica
```

---

## Tecnologías propuestas

| Área | Tecnología sugerida |
|------|----------------------|
| Frontend | React + Expo |
| Backend | Node.js (Express) |
| Base de datos / cache | Redis local |
| Contenedores | Docker + Docker Compose |
| Diagramas | PlantUML |
| APIs NASA | OPeNDAP (MERRA-2/GPM IMERG) |
| Control de versión | Git + GitHub |
| Documentación | Markdown |

---

## Principios guía

- Simplicidad y modularidad ante todo  
- Diseñar pensando en escalabilidad futura
- Transparencia y reproducibilidad (todo documentado)  
- Entregable funcional aunque limitado en alcance  

---

## Equipo Nimbus25

| Nombre | Rol |
|--------|-----|
| *Ana Belén Bulla* | Backend |
| *Giuliana Bordón* | Frontend |
| *Ricardo Castro* | Backend / DevOps |
| *Leonardo Conde* | Backend |
| *Juan Gambetta* | Frontend |

---

## Estado actual

- ✅ Etapa de diseño conceptual  
- ✅ Documentación técnica en progreso  
- ✅ Implementación del prototipo (backend + front)
- ✅ Endpoints y flujos de datos definidos
- ✅ Adelanto del informe presentado
- ✅ Integración Front/Back concluída y testeada
- ✅ Repositorio pronto para entregar

---