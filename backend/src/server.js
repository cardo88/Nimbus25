import express from "express";
import Redis from "ioredis";
import cors from "cors";
import routes from "./routes/index.js";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
app.use(express.json());

// Configuración Keycloak
const realm = "nimbus";
const issuer = `http://keycloak-keycloak-1:7080/realms/${realm}`;
const JWKS = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

// Middleware para validar token
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.substring("Bearer ".length);
    const { payload } = await jwtVerify(token, JWKS, { issuer });

    req.user = payload;
    next();
  } catch (error) {
    console.error("[Auth] Token inválido:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// CORS
app.use(
    cors({
      origin: "*", // o "http://localhost:8081"
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
);

const PORT = process.env.PORT || 8080;
const REDIS_URL = process.env.REDIS_URL || "redis://cache:6379";

// Redis client (compartido entre controladores)
let redis;
try {
  redis = new Redis(REDIS_URL, { lazyConnect: true, connectTimeout: 800 });
  await redis.connect();
  console.log("[backend] Redis conectado");
} catch (e) {
  console.warn("[backend] Redis no disponible:", e.message);
  redis = null;
}

// Middleware para inyectar redis en req
app.use((req, _res, next) => {
  req.redis = redis;
  next();
});

// Rutas
app.use("/", routes);

export { verifyToken };

app.listen(PORT, () => {
  console.log(`[backend] escuchando en ${PORT}`);
});