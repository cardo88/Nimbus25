//import { getWeatherData } from "../services/integrationServiceMock.js";
//import { getWeatherData } from "../services/integrationService.js";
import { getWeatherData } from '../services/weather/index.js';


export const getProbability = async (req, res) => {
    try {
        const { lat, lon, date } = req.body;
        const redis = req.redis;

        if (!lat || !lon || !date) {
            return res.status(400).json({ error: "lat, lon y date son obligatorios" });
        }

        const result = await getWeatherData(lat, lon, date);

        const responseData = {
            probability: result.probability,
            condition: result.condition,
            temperature_max: result.temperature_max,
            temperature_min: result.temperature_min,
            inputs: { lat, lon, date },
            source: result.source,
            timestamp: result.timestamp,
        };

        // Guardar historial en Redis
        if (redis) {
            const username = req.user?.preferred_username || "unknown";
            const key = `history:${username}`;
            const existing = await redis.get(key);
            const history = existing ? JSON.parse(existing) : [];

            // Añadimos el nuevo registro al inicio
            history.unshift(responseData);
            // Limitamos a las 5 más recientes
            const trimmed = history.slice(0, 5);

            await redis.set(key, JSON.stringify(trimmed), "EX", 3600);
        }

        res.json(responseData);
    } catch (error) {
        console.error("[probabilityController] Error:", error.message);
        res.status(500).json({
            error: "Error interno al calcular la probabilidad",
            details: error.message,
        });
    }
};
