export async function getWeatherData(lat, lon, date) {
    // Simulación: genera clima según día y ubicación
    const conditions = ["sunny", "rainy", "cloudy", "windy"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    const probability =
        condition === "rainy" ? Number((Math.random() * 0.3 + 0.6).toFixed(2)) :
            condition === "cloudy" ? Number((Math.random() * 0.5 + 0.3).toFixed(2)) :
                Number((Math.random() * 0.3).toFixed(2));

    const temperature_max = Number((Math.random() * 15 + 20).toFixed(1));
    const temperature_min = Number((temperature_max - (Math.random() * 5 + 5)).toFixed(1));

    return {
        probability,
        condition,
        temperature_max,
        temperature_min,
        source: "integrationServiceMock",
        timestamp: new Date().toISOString(),
    };
}
