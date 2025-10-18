import axios from "axios";

export const getStatus = async (req, res) => {
    const redis = req.redis;
    const checks = { version: "0.0.1", providers: {}, cache: {} };

    // Verificar Redis
    try {
        await redis.set("nimbus25:ping", "ok", "EX", 5);
        const val = await redis.get("nimbus25:ping");
        checks.cache.redis = { ok: val === "ok" };
    } catch (e) {
        checks.cache.redis = { ok: false, error: e.message };
    }

    // Verificar servicio de datos que consumen API de la NASA
    const DATA_SERVICE_URL =
        process.env.DATA_SERVICE_URL || "http://localhost:9001/health";

    const start = Date.now();
    try {
        const response = await axios.get(DATA_SERVICE_URL, { timeout: 3000 });
        checks.providers.dataIntegration = {
            ok: response.status === 200,
            latency_ms: Date.now() - start,
        };
    } catch (error) {
        checks.providers.dataIntegration = {
            ok: false,
            error: error.message,
            latency_ms: Date.now() - start,
        };
    }

    res.json(checks);
};