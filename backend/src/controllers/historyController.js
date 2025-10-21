export const getHistory = async (req, res) => {
    try {
        const redis = req.redis;
        const username = req.user?.preferred_username || "unknown";
        const key = `history:${username}`;

        if (!redis) {
            return res.status(503).json({ error: "Redis no disponible" });
        }

        const data = await redis.get(key);
        const history = data ? JSON.parse(data) : [];

        res.json({
            user: username,
            count: history.length,
            history,
            source: "redis",
        });
    } catch (error) {
        console.error("[historyController] Error:", error.message);
        res.status(500).json({ error: "Error al obtener historial" });
    }
};