export const getHistory = async (req, res) => {
    try {
        const redis = req.redis;
        const ip = req.ip || "unknown";
        const key = `history:${ip}`;

        if (!redis) {
            return res.status(503).json({ error: "Redis no disponible" });
        }

        const data = await redis.get(key);
        const history = data ? JSON.parse(data) : [];

        res.json({
            user: ip,
            count: history.length,
            history,
            source: "redis",
        });
    } catch (error) {
        console.error("[historyController] Error:", error.message);
        res.status(500).json({ error: "Error al obtener historial" });
    }
};