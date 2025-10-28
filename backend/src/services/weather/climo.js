import { PROBABILITY_WINDOW_DAYS, PROBABILITY_YEARS_BACK, PROBABILITY_THRESHOLD_MM } from './config.js';
import { buildClimoDates } from './utils.js';
import { readIMERGPrecip } from './imerg.js';
import { log } from './logger.js';

export async function climoProbVeryWet(lat, lon, targetDate, {
  yearsBack  = PROBABILITY_YEARS_BACK,
  windowDays = PROBABILITY_WINDOW_DAYS,
  threshold  = PROBABILITY_THRESHOLD_MM,
} = {}) {
  const dates = buildClimoDates(targetDate, windowDays, yearsBack);
  let hits = 0, total = 0;
  const used = [], skipped = [];

  log.info(`[CLIMO] Prob. muy húmedo ${targetDate}: ${dates.length} días, umbral ${threshold} mm`);
  for (const [i, d] of dates.entries()) {
    try {
      const { precip } = await readIMERGPrecip(lat, lon, d);
      total++; used.push({ date: d, precip });
      if (precip >= threshold) hits++;
    } catch (err) {
      skipped.push({ date: d, reason: err?.message || 'error' });
    }
    if ((i + 1) % 10 === 0) {
      log.debug(`[CLIMO] → ${i + 1}/${dates.length}`);
    }
  }

  const prob = total > 0 ? hits / total : 0;
  log.info(`[CLIMO] ${targetDate}: p=${prob.toFixed(2)} hits=${hits}/${total} skipped=${skipped.length}`);
  return { prob, hits, usedDays: total, expectedDays: dates.length, skipped, used, source: 'Climatología IMERG (OPeNDAP)' };
}
