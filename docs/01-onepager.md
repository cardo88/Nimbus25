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
- Gráficos explicativos  
- Estado en tiempo real de las APIs NASA utilizadas  

---

## 🧩 Alcance del prototipo

El **prototipo (MVP)** que presentaremos en esta instancia del reto incluye:

- Backend local con endpoints `/probability`, `/status`, `/health`, `/history`
- Merge y procesamiento básico de datasets NASA seleccionados  
- Cálculo simple de probabilidades basado en percentiles históricos  
- Cache local para evitar dependencias externas durante la demo  
- Frontend móvil/web con diseño basado en Figma del equipo de UI  
- Dark/Light mode y página de estado del sistema  
- Documentación técnica completa y reproducible  

---

## 🛰️ Fuentes de datos principales

- **NASA POWER API** – datos de radiación, temperatura, viento  
- **Open-METEO** – series temporales meteorológicas de libre acceso  
- **GES DISC (NASA)** – datasets de precipitación global (opcional para ampliación)

---

## ⚙️ Tecnologías clave

| Capa | Tecnología sugerida |
|------|----------------------|
| Frontend | React / Flutter (según decisión del equipo UI) |
| Backend | Node.js (Express) o Python (FastAPI) |
| Cache/DB | SQLite o Redis local |
| Contenedores | Docker + Docker Compose |
| Documentación | Markdown + OpenAPI + PlantUML |

---

## 🧠 Valor diferencial

- Integración efectiva de datos abiertos de la NASA  
- Prototipo reproducible y portable (local-first)  
- Resiliencia ante fallos de APIs (modo degradado)  
- Diseño modular listo para escalar a nube o microservicios  
- Experiencia de usuario centrada en visualización y claridad  

---

## 🚀 Próximos pasos

1. Completar los diagramas y contratos de API  
2. Implementar backend base con endpoints y manejo de cache  
3. Conectar frontend al backend y mostrar resultados en mapa  
4. Agregar monitoreo de salud de fuentes y métricas básicas  
5. Preparar despliegue local y documentación final

---

> *“Queremos que los datos de la NASA sean tan accesibles como mirar el pronóstico del tiempo, pero con el poder de la ciencia detrás.”*  
> — Equipo **Nimbus25**