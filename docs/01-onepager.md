# 🌦️ One-Pager – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?*  
### NASA Space Apps Challenge 2025

---

## 🎯 Problema

Las actividades al aire libre, eventos y viajes suelen verse afectadas por condiciones climáticas extremas que, aunque previsibles, no siempre están disponibles de forma clara o accesible para el público.  
Los datos satelitales y climatológicos de la NASA ofrecen información valiosa, pero requieren conocimientos técnicos y procesamiento avanzado para ser utilizados eficazmente.

---

## 💡 Solución propuesta

**Nimbus25** transforma los datos abiertos de la NASA en una herramienta visual e intuitiva que permite al usuario consultar, en cualquier momento y lugar, la **probabilidad de condiciones climáticas extremas** (lluvia intensa, calor extremo, viento fuerte, etc.) para una ubicación y fecha específicas.  

El sistema integra varias fuentes de datos, aplica análisis estadístico sobre registros históricos y presenta los resultados en una interfaz amigable que incluye:
- Mapa interactivo  
- Indicadores de probabilidad y riesgo  
- Estado en tiempo real de las APIs NASA utilizadas  

---

## 🧩 Alcance del prototipo

El **prototipo (MVP)** que presentaremos en esta instancia del reto incluye:

- Backend local con endpoints `/probability`, `/status`, `/health`, `/history`
- Merge y procesamiento básico de datasets NASA seleccionados  
- Cálculo simple de probabilidades basado en percentiles históricos  
- Cache local para almacenar las busquedas recientes
- Frontend móvil con diseño basado en Figma del equipo de UI  
- Documentación técnica completa y reproducible  

---

## 🛰️ Fuentes de datos principales

- **NASA MERRA** (Modern-Era Retrospective Analysis for Research and Applications, Version 2) - provee datos atmosféricos horarios (temperatura, humedad, viento, presión).
- **NASS IMERG** (Global Precipitation Measurement - Integrated Multi-satellite Retrievals) - provee datos de precipitación diaria (en fase de integración).

---

## ⚙️ Tecnologías clave

| Capa | Tecnología sugerida |
|------|----------------------|
| Frontend | React Native + Expo con orientación a iOS. |
| Backend | Node.js (Express) y Python (FastAPI) |
| Cache/DB | Redis local |
| Contenedores | Docker + Docker Compose + Github Actions |
| Documentación | Markdown + PlantUML |

---

## 🧠 Valor diferencial

- Integración efectiva de datos abiertos de la NASA  
- Prototipo reproducible y portable (local-first)  
- Diseño modular listo para escalar a nube o microservicios  
- Experiencia de usuario centrada en visualización y claridad  

---

## 🚀 Próximos pasos

1. Finalización de la autenticación con Keycloak
2. Implementación de CI/CD en GitHub Actions (on going) 
3. Despliegue en nube  
4. Ampliación de datasets
5. Expansión multiplataforma
6. Mejoras adicionales

---

> *“Queremos que los datos de la NASA sean tan accesibles como mirar el pronóstico del tiempo, pero con el poder de la ciencia detrás.”*  
> — Equipo **Nimbus25**