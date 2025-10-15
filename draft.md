## 🗂️ Estructura de documentación propuesta para el repositorio `Nimbus25`

Todo estará en formato **Markdown (.md)** dentro de una carpeta `/docs/`, y el **README.md principal** del repo servirá como índice y carta de presentación del proyecto.

---

### 🧭 1. `README.md` (raíz)

**Propósito:** resumen ejecutivo del proyecto
**Contenido:**

* Nombre del proyecto y logo
* Breve descripción del desafío (“Will It Rain On My Parade?”)
* Propósito general
* Tecnologías principales
* Estructura del repositorio (con links a los demás `.md`)
* Créditos del equipo

---

### 📄 2. `/docs/01-onepager.md`

**Propósito:** tener una *visión rápida* de qué estamos resolviendo.
**Contenido:**

* Problema
* Solución propuesta
* Qué aporta (valor diferencial)
* Alcance del prototipo
* Limitaciones y próximos pasos

---

### 🧩 3. `/docs/02-architecture-overview.md`

**Propósito:** visión de arquitectura general, entendible por todo el equipo.
**Contenido:**

* Diagrama de arquitectura general (Front–Backend–APIs NASA–Cache–DB)
* Flujos principales (usuario consulta → API → NASA/cache → resultado)
* Tecnologías por capa (con justificación breve)
* Consideraciones locales vs nube (plan de despliegue futuro)

---

### 🧱 4. `/docs/03-components.md`

**Propósito:** detallar el diseño interno del backend.
**Contenido:**

* Diagrama de componentes (PlantUML)
* Módulos: API, Dominio, Adaptadores (NASA, Cache, Logger, Métricas)
* Descripción de responsabilidades y dependencias
* Decisiones de diseño (por qué monolito modular, y cómo escalar luego)

---

### 🔄 5. `/docs/04-sequence-flows.md`

**Propósito:** mostrar los flujos clave de interacción.
**Contenido:**

* Diagrama de secuencia: *Consulta de probabilidad*
* Diagrama de secuencia: *Ingesta/actualización de datasets*
* Manejo de errores / modo degradado

---

### 🧠 6. `/docs/05-api-contract.md`

**Propósito:** definir el contrato claro para el front y testers.
**Contenido:**

* Descripción general
* Endpoints `/health`, `/status`, `/probability`, `/history`
* Esquemas de request/response (OpenAPI o JSON examples)
* Códigos de error y convenciones

---

### 🗃️ 7. `/docs/06-data-model.md`

**Propósito:** documentar qué datos se manejan.
**Contenido:**

* Datasets NASA seleccionados
* Variables, unidades y claves de merge
* Estructura interna (ej. JSON o tabla SQL)
* Estrategia de cache y persistencia

---

### 🧩 8. `/docs/07-patterns-and-principles.md`

**Propósito:** guiar al equipo en buenas prácticas.
**Contenido:**

* Patrones de arquitectura (Hexagonal, Cache-Aside, Circuit Breaker)
* Patrones de diseño aplicados (Repository, Strategy, Adapter, DTO)
* Buenas prácticas de modularidad, logs, resiliencia

---

### 🔧 9. `/docs/08-dev-environment.md`

**Propósito:** asegurar que todos puedan correr el proyecto localmente.
**Contenido:**

* Requisitos (Node/Python/DB/Docker)
* Instrucciones de instalación y ejecución local
* Variables de entorno
* Estructura del proyecto
* Comandos de prueba y verificación (`curl`, `pytest`, etc.)

---

### 🚀 10. `/docs/09-deployment-plan.md`

**Propósito:** dejar planteado cómo se desplegará.
**Contenido:**

* Estrategia actual: local / Docker Compose
* Estrategia futura: nube (AWS/Azure/Universidad)
* Kubernetes simulado (Minikube)
* Consideraciones CI/CD (plan de evolución)

---

### 📊 11. `/docs/10-quality-and-resilience.md`

**Propósito:** checklist de robustez y confiabilidad.
**Contenido:**

* Estrategias de timeout, retry, circuit breaker
* Modo degradado y fallback
* Health checks y métricas
* Logging y trazabilidad (`traceId`)
* Testing básico (unitario e integración)

---

### 💡 12. `/docs/11-next-steps.md`

**Propósito:** documentar las mejoras futuras (para entregar en el reto).
**Contenido:**

* Qué no entró en el prototipo
* Qué se implementaría después
* Recomendaciones de evolución tecnológica

---

### 👥 13. `/docs/TEAM.md`

**Propósito:** dejar claro quién hace qué.
**Contenido:**

* Integrantes
* Roles (Front, Backend, DevOps, UI/UX, Data)
* Responsabilidades y puntos de contacto
* Cronograma tentativo semanal

---

# 🔚 Resultado final

Quedará así:

```
Nimbus25/
├── README.md
├── /docs/
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
```
