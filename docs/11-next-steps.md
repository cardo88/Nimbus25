

# 🧭 Próximos Pasos – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🎯 Propósito del documento

Definir las **líneas de evolución y mejora** del proyecto Nimbus25 luego de la entrega del prototipo (MVP).  
Este documento sirve como guía para planificar las siguientes iteraciones, escalabilidad técnica y posibles oportunidades de colaboración con otras instituciones o equipos.

---

## 🚀 Mejoras técnicas planificadas

| Área | Mejora propuesta | Descripción |
|------|------------------|--------------|
| **Backend** | Separación en microservicios | Dividir la API de consultas y el módulo de ingesta/estadística. |
| **Frontend** | Implementar app móvil nativa (Flutter) | Llevar la interfaz web a una versión optimizada para smartphones. |
| **Datos** | Integrar nuevas fuentes (NASA GES DISC, NOAA, Copernicus) | Aumentar la precisión y cobertura geográfica. |
| **Base de datos** | Migrar a PostgreSQL / Redis persistente | Mejorar rendimiento y consultas históricas. |
| **DevOps** | Despliegue en nube (AWS, Azure o UCU Cloud) | Implementar CI/CD y monitoreo centralizado. |
| **Seguridad** | Autenticación de usuarios y API Keys | Permitir historial personalizado y control de acceso. |
| **Análisis** | Modelos de predicción con Machine Learning | Incorporar aprendizaje automático a partir de datos históricos. |

---

## 🌐 Integraciones futuras

- **API pública** para que otras apps o instituciones consulten datos procesados.  
- **Panel de administración** para visualizar métricas de uso, errores y estado del sistema.  
- **Integración educativa** con universidades para uso en clases de meteorología o ciencia de datos.  
- **Soporte multilingüe** (español, inglés, portugués) para ampliar alcance.

---

## 📈 Plan de roadmap tentativo

| Fase | Periodo | Objetivo principal |
|------|----------|-------------------|
| **Fase 1 (Q4 2025)** | Oct–Dic 2025 | Finalizar MVP funcional con APIs NASA y documentación completa. |
| **Fase 2 (Q1 2026)** | Ene–Mar 2026 | Migración a nube + mejora de resiliencia y monitoreo. |
| **Fase 3 (Q2 2026)** | Abr–Jun 2026 | Incorporar autenticación, panel de control y métricas avanzadas. |
| **Fase 4 (Q3 2026)** | Jul–Sep 2026 | Integrar machine learning y optimizar experiencia de usuario móvil. |

---

## 💡 Ideas de innovación futura

1. **Predicción por eventos específicos**: permitir que el usuario ingrese “concierto”, “maratón”, “vuelo”, y obtener condiciones esperadas para ese tipo de evento.  
2. **Visualización 3D** de nubes, lluvia y viento sobre el mapa usando WebGL.  
3. **Modo educativo** para simular escenarios climáticos.  
4. **Alertas personalizadas** vía correo o app (si se detecta riesgo climático).  
5. **Gamificación**: permitir que los usuarios comparen predicciones con resultados reales.  

---

## 🧩 Colaboraciones potenciales

- **NASA Earth Science Data Systems (ESDS)** – acceso extendido a datasets satelitales.  
- **Open-METEO y NOAA** – interoperabilidad entre servicios meteorológicos abiertos.  
- **Universidades locales (UCU, UDELAR, ORT)** – proyectos académicos o de investigación aplicada.  
- **Comunidad Space Apps** – compartir código y resultados en repositorios abiertos.

---

## 📚 Próximas tareas para el equipo

- [ ] Completar integración con al menos una segunda API NASA.  
- [ ] Implementar almacenamiento persistente en base de datos.  
- [ ] Diseñar prototipo de aplicación móvil.  
- [ ] Configurar monitoreo básico (logs y métricas).  
- [ ] Preparar presentación final y video demo.  
- [ ] Publicar repositorio en GitHub con licencia abierta (MIT o Apache 2.0).

---

> *“El prototipo es solo el comienzo; la visión de Nimbus25 es convertir los datos de la NASA en conocimiento útil para todos.”*  
> — Equipo Nimbus25