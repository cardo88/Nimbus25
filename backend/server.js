import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const REDIS_URL = process.env.REDIS_URL || "redis://cache:6379";

// si no conecta, /status lo informa y /health sigue vivo.
let redis;
try {
  redis = new Redis(REDIS_URL, { lazyConnect: true, connectTimeout: 800 });
  await redis.connect();
  console.log("[backend] Redis conectado");
} catch (e) {
  console.warn("[backend] Redis no disponible:", e.message);
  redis = null;
}

app.get("/health", (_req, res) => {
  res.json({ status: "UP" });
});

app.get("/status", async (_req, res) => {
  const checks = { version: "stub-0.0.0", providers: {}, cache: {} };

  // Provider mocks con latencia
  const ping = (name) =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ name, ok: true, ms: 120 + Math.floor(Math.random() * 120) }), 120)
    );

  const provs = await Promise.all([
    ping("NASA_POWER"),
    ping("GES_DISC"),
    ping("OPEN_METEO"),
  ]);
  provs.forEach((p) => (checks.providers[p.name] = { ok: p.ok, latency_ms: p.ms }));

  // Cache
  if (redis) {
    try {
      await redis.set("nimbus25:ping", "ok", "EX", 10);
      const val = await redis.get("nimbus25:ping");
      checks.cache.redis = { ok: val === "ok" };
    } catch (e) {
      checks.cache.redis = { ok: false, error: e.message };
    }
  } else {
    checks.cache.redis = { ok: false, error: "no connection" };
  }

  res.json(checks);
});

app.post("/probability", (req, res) => {
  const { lat, lon, date, type } = req.body || {};
  const seed = (JSON.stringify({ lat, lon, date, type }) || "x").split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  // Stub: probabilidad pseudoaleatoria basada en inputs  
  const prob = (seed % 71) + 10;
  res.json({ probability: prob / 100, inputs: { lat, lon, date, type }, source: "stub" });
});

app.get("/history", (_req, res) => {
  // Stub: serie chiquita fake
  const out = Array.from({ length: 7 }).map((_, i) => ({
    date: `2025-10-${10 + i}`,
    probability: (Math.random() * 0.7 + 0.1).toFixed(2),
  }));
  res.json({ series: out, source: "stub" });
});

app.listen(PORT, () => {
  console.log(`[backend] escuchando en ${PORT}`);
});