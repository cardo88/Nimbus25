import { clamp01 } from './utils.js';
import { GPM_OPENDAP_BASE } from './config.js';
import { readIMERGPrecip } from './imerg.js';
import { readMERRA, climoTemp2mSameDayBackfill } from './merra/index.js';
import { climoProbVeryWet } from './climo.js';

function heatIndexC(tC, rh) {
  const tF = tC * 9 / 5 + 32;
  const HI = -42.379 + 2.04901523 * tF + 10.14333127 * rh
    - 0.22475541 * tF * rh - 6.83783e-3 * tF * tF - 5.481717e-2 * rh * rh
    + 1.22874e-3 * tF * tF * rh + 8.5282e-4 * tF * rh * rh - 1.99e-6 * tF * tF * rh * rh;
  return (HI - 32) * 5 / 9;
}

export async function getWeatherData(lat, lon, dateISO) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const isFuture = dateISO > todayISO;

  if (isFuture) {
    const yearsNeeded = Number(process.env.CLIMO_YEARS ?? 5);
    const maxExtra = Number(process.env.CLIMO_MAX_EXTRA ?? 10);
    const wetCfg = {
      yearsBack: Number(process.env.PROBABILITY_YEARS_BACK ?? 3),
      windowDays: Number(process.env.PROBABILITY_WINDOW_DAYS ?? 5),
      threshold: Number(process.env.PROBABILITY_THRESHOLD_MM ?? 25),
    };

    const [wetRes, tempRes] = await Promise.allSettled([
      climoProbVeryWet(lat, lon, dateISO, wetCfg),
      climoTemp2mSameDayBackfill(lat, lon, dateISO, { yearsNeeded, maxExtraYears: maxExtra }),
    ]);

    const wetOk = wetRes.status === 'fulfilled';
    const probRaw = wetOk ? (wetRes.value.prob ?? wetRes.value) : 0;
    const prob = Number((probRaw ?? 0).toFixed(2));

    const tOk = tempRes.status === 'fulfilled' && tempRes.value && tempRes.value.samples > 0;
    const tmax = tOk ? Number(tempRes.value.tmax_mean.toFixed(1)) : null;
    const tmin = tOk ? Number(tempRes.value.tmin_mean.toFixed(1)) : null;
    const merraSamples = tOk ? tempRes.value.samples : 0;

    const condition = prob >= 0.5 ? 'likely_wet' : 'normal';

    return {
      probability: prob,
      condition,
      temperature_max: tmax,
      temperature_min: tmin,
      metrics: {
        temp_climo: { samples: merraSamples },
        prob_very_wet_climo: prob,
        climo_years: wetCfg.yearsBack,
        window_days: wetCfg.windowDays,
        threshold_mm: wetCfg.threshold,
      },
      inputs: { lat, lon, date: dateISO },
      source: {
        imerg: wetOk ? (wetRes.value.source || 'IMERG climatología') : 'IMERG climo (fallback)',
        merra: tOk ? (tempRes.value.source || 'MERRA-2 T2M same-day backfill') : 'MERRA-2 same-day (sin muestras)',
        merra_samples: merraSamples,
      },
      timestamp: new Date().toISOString(),
    };
  }

  const { precip, imergFile } = await readIMERGPrecip(lat, lon, dateISO);
  const { T2M, RH2M, U10M, V10M, merraFile } = await readMERRA(lat, lon, dateISO);

  const tC = (T2M != null) ? T2M - 273.15 : null;
  const wind = (U10M != null && V10M != null) ? Math.hypot(U10M, V10M) : null;
  const hiC = (tC != null && RH2M != null) ? heatIndexC(tC, RH2M) : null;

  const probabilityVeryWet = clamp01(precip / 35);
  const condition =
    precip >= 25 ? 'very_wet'
    : (wind != null && wind >= 10) ? 'very_windy'
    : (tC != null && tC >= 32) ? 'very_hot'
    : (tC != null && tC <= 5) ? 'very_cold'
    : 'normal';

  const temperature_max = (tC != null) ? Number((tC + 3).toFixed(1)) : null;
  const temperature_min = (tC != null) ? Number((tC - 3).toFixed(1)) : null;

  return {
    probability: Number(probabilityVeryWet.toFixed(2)),
    condition,
    temperature_max,
    temperature_min,
    metrics: {
      precip_mm: Number(precip.toFixed(1)),
      t2m_c: (tC != null) ? Number(tC.toFixed(1)) : null,
      rh2m_pct: (RH2M != null) ? Math.round(RH2M) : null,
      wind_ms: (wind != null) ? Number(wind.toFixed(1)) : null,
      heat_index_c: (hiC != null) ? Number(hiC.toFixed(1)) : null,
      flags: {
        very_wet: precip >= 25,
        very_hot: (temperature_max != null) ? temperature_max >= 32 : null,
        very_cold: (temperature_min != null) ? temperature_min <= 5 : null,
        very_windy: (wind != null) ? wind >= 10 : null,
        very_uncomfortable: (hiC != null) ? hiC >= 40 : null,
      },
    },
    inputs: { lat, lon, date: dateISO },
    source: {
      imerg: imergFile ? imergFile.replace(GPM_OPENDAP_BASE, '') : '(no disponible)',
      merra: merraFile ? merraFile.replace(/^https?:\/\/[^/]+/, '') : '(no disponible)',
    },
    timestamp: new Date().toISOString(),
  };
}