

# 🧱 Componentes del Sistema – Proyecto Nimbus25  
### Desafío: *Will It Rain On My Parade?* – NASA Space Apps Challenge 2025

---

## 🧩 Propósito del documento

Describir la estructura interna del backend y los componentes principales que conforman el sistema Nimbus25, explicando su responsabilidad, dependencias y forma de interacción.

---

## 🧠 Visión general

El backend de Nimbus25 sigue un enfoque **monolito modular**, basado en los principios de **arquitectura hexagonal (puertos y adaptadores)**.  
Esto permite mantener la lógica de negocio independiente de los detalles técnicos y facilita la futura transición hacia una arquitectura de microservicios.

---

## 🧰 Módulos principales

| Módulo | Descripción | Ejemplos de funciones |
|--------|--------------|-----------------------|
| **API Layer** | Gestiona las solicitudes HTTP provenientes del frontend. Expone endpoints REST, valida parámetros y formatea las respuestas. | `/probability`, `/status`, `/health`, `/history` |
| **Domain Layer** | Contiene la lógica central del sistema: procesamiento, merge y cálculo estadístico. No depende de frameworks ni librerías externas. | `calcularProbabilidad()`, `mergearDatos()`, `generarMetricas()` |
| **NASA Adapter** | Se encarga de consultar las APIs de la NASA u otras fuentes, transformar los datos a un formato común y manejar errores o caídas de red. | `fetchPowerData()`, `fetchGesDiscData()` |

---

## 🧩 Diagrama de componentes

```plantuml
@startuml
title Diagrama de Componentes - Proyecto "Nimbus25"

' === NODOS PRINCIPALES ===
node "Dispositivo del Usuario" as USER

' === COMPONENTES ===
component "Aplicación Móvil\n(Frontend - React Native + Expo)" as MOBILE
component "Backend API\n(Node.js + Express)" as API
component "Redis Cache" as REDIS
component "Keycloak\n(Gestión de Identidad)" as KC
component "MERRA-2\n(Datos Atmosféricos)" as MERRA2
component "IMERG\n(Datos de Precipitación)" as IMERG

' === NOTAS ===
note right of MOBILE
Interfaz principal desarrollada en React Native con Expo.
Permite seleccionar ubicación, fecha y tipo de evento.
Consume la API del backend a través de solicitudes REST.
end note

note right of API
Expone endpoints REST:
 - /probability
 - /history
Gestiona la lógica de negocio,
autenticación y comunicación con otros servicios.
end note

note right of REDIS
Almacena temporalmente resultados
de consultas y verificaciones de estado.
end note

note right of KC
Proveedor de autenticación y autorización.
Maneja roles, sesiones y tokens.
end note

' === RELACIONES ===
USER --> MOBILE : Interacción del usuario
MOBILE --> API : Solicitudes HTTP (REST)
API --> REDIS : Cache de resultados
API --> KC : Validación de tokens / autenticación
API --> MERRA2 : Consulta de datos atmosféricos
API --> IMERG : Consulta de datos de precipitación

@enduml
```

---

## 🔄 Flujo general de ejecución

1. El usuario envía una solicitud al **endpoint REST**.  
2. El **Backend** valida los parámetros y delega la solicitud a las **Apis de la NASA**.
5. Los datos se procesan, normalizan.
6. El resultado se devuelve al frontend junto con el estado del sistema y un `traceId`.

---

> *“Mantener las responsabilidades separadas hoy nos da flexibilidad para escalar mañana.”*  
> — Equipo Nimbus25