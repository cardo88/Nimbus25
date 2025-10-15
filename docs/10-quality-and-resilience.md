

# 🧪 Calidad y Resiliencia – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🎯 Propósito del documento

Describir las **estrategias de aseguramiento de calidad**, **mecanismos de resiliencia** y **buenas prácticas de testing** aplicadas en el prototipo Nimbus25.  
El objetivo es garantizar que el sistema se mantenga **estable, confiable y fácil de mantener** incluso ante fallos externos.

---

## 🧱 Dimensiones de calidad abordadas

| Dimensión | Descripción | Implementación |
|------------|--------------|----------------|
| **Fiabilidad** | Capacidad de mantener el servicio operativo ante errores. | Health checks, cache y modo degradado. |
| **Disponibilidad** | Porcentaje de tiempo que el sistema responde correctamente. | Cache local + reintentos ante fallos NASA. |
| **Desempeño** | Tiempo de respuesta adecuado para cada consulta. | Cache-aside, normalización ligera, logs de latencia. |
| **Seguridad** | Protección de datos y control de acceso básico. | Sanitización de inputs, CORS, variables de entorno. |
| **Mantenibilidad** | Facilidad para incorporar cambios y corregir errores. | Código modular, documentación actualizada. |
| **Portabilidad** | Facilidad para ejecutar el sistema en otros entornos. | Docker + `.env` configurable. |

---

## ⚙️ Mecanismos de resiliencia

### 1️⃣ Health Checks
- Endpoint `/health` para verificar disponibilidad del backend.  
- Endpoint `/status` para evaluar la salud de las APIs NASA y cache.  
- Monitoreo de tiempo de respuesta y códigos HTTP.

### 2️⃣ Cache y modo degradado
- Estrategia *cache-aside*: si una API NASA falla, se usa el último dataset almacenado.  
- Las respuestas incluyen el campo `data_source_status = "DEGRADED"` para indicar al frontend el origen del dato.  
- Esto garantiza funcionamiento parcial incluso ante caídas externas.

### 3️⃣ Reintentos y timeouts
- Reintentos automáticos con **backoff exponencial** en llamadas HTTP.  
- Timeouts configurables por entorno (`NASA_API_TIMEOUT=5000ms`).  
- Circuit breaker interno para pausar llamadas repetidamente fallidas.

### 4️⃣ Validaciones y control de errores
- Validaciones estrictas en los endpoints (tipos, rangos, fechas válidas).  
- Middleware `errorHandler` que captura y formatea excepciones.  
- Estructura estándar de error:
```json
{ "code": "DATA_UNAVAILABLE", "message": "No hay datos para la fecha", "traceId": "abc123" }
```

### 5️⃣ Logging estructurado
- Logs en formato JSON con `timestamp`, `traceId`, `nivel`, `módulo` y `mensaje`.  
- Ejemplo:
```json
{
  "timestamp": "2025-10-10T22:45:00Z",
  "level": "info",
  "module": "nasaClient",
  "message": "Datos obtenidos correctamente de NASA POWER",
  "traceId": "7f9c3"
}
```

### 6️⃣ Métricas básicas
- Contadores de éxito/fallo de llamadas NASA (`api_success_total`, `api_failure_total`).  
- Promedio de latencia (`api_latency_seconds`).  
- Ratio de aciertos de cache (`cache_hit_ratio`).  
- Endpoint `/metrics` para exponer métricas (Prometheus-ready, en futuro).

---

## 🧩 Estrategia de testing

| Tipo de prueba | Objetivo | Herramientas / Ejemplo |
|----------------|-----------|------------------------|
| **Unitarias** | Validar funciones internas (merge, cálculo de probabilidad). | Jest / Pytest |
| **Integración** | Verificar comunicación entre módulos (API ↔ NASA ↔ Cache). | Supertest / requests |
| **E2E (End-to-End)** | Simular flujo completo desde frontend hasta backend. | Postman, Newman o Cypress |
| **Carga básica** | Medir tiempos de respuesta ante múltiples solicitudes. | k6 / Artillery |
| **Manual** | Validación visual y funcional del prototipo. | Interfaz UI + curl |

---

## 🧠 Ejemplo de prueba unitaria (Node.js)

```js
import { calcularProbabilidad } from '../domain/services/calculationService.js';

test('Calcula probabilidad correctamente para datos de precipitación', () => {
  const datos = [2, 5, 10, 20, 50, 100];
  const resultado = calcularProbabilidad(datos, 90); // percentil 90
  expect(resultado).toBeGreaterThan(0);
  expect(resultado).toBeLessThanOrEqual(1);
});
```

---

## 🧭 Checklist de calidad antes de cada entrega

- [x] Todos los endpoints responden (`/health`, `/status`, `/probability`).  
- [x] Documentación actualizada en `/docs`.  
- [x] Logs y métricas verificadas localmente.  
- [x] Cache funcional y validada con fallos simulados.  
- [x] Tests unitarios ejecutados sin errores.  
- [x] Docker Compose funciona en todos los equipos.  

---

> *“La resiliencia no significa no fallar, sino poder recuperarse sin interrumpir la experiencia del usuario.”*  
> — Equipo Nimbus25