import express from "express";
import Redis from "ioredis";
import routes from "./routes/index.js";

const app = express();
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`[backend] escuchando en ${PORT}`);
});