import assert from 'node:assert';
import { log } from '../logger.js';
import { getText, curlAscii } from './opendap-client.js';
import { parseAsciiArray } from './parsing.js';
import {
  getDimsFromDDSorDMR, getFirstTwoCoordsAscii,
  nearestIndex, normalizeLon, toIndex
} from './grid.js';
import { listVarsFromDDS } from './variables.js';
import { buildMERRACandidates } from './urls.js';

async function tryReadDayFromUrl(url, dateISO, lat, lon, cachedGrid) {
  let latIdx, lonIdx, latName, lonName;
  const dims = await getDimsFromDDSorDMR(url);
  latName = dims.latName; lonName = dims.lonName;
  const { latLen, lonLen } = dims;

  if (cachedGrid && cachedGrid.latIdx != null && cachedGrid.lonIdx != null && cachedGrid.baseUrlForIdx === url) {
    ({ latIdx, lonIdx } = cachedGrid);
  } else {
    try {
      const latTxt = await getText(`${url}.ascii?${latName}`);
      const lonTxt = await getText(`${url}.ascii?${lonName}`);
      const latVals = parseAsciiArray(latTxt);
      const rawLon = parseAsciiArray(lonTxt);
      const lonVals = rawLon.map(v => (v > 180 ? v - 360 : v));
      latIdx = nearestIndex(latVals, lat);
      lonIdx = nearestIndex(lonVals, lon);
    } catch (e) {
      log.warn(`[MERRA] ${dateISO} no pude parsear lat/lon completas (${latName}/${lonName}) en ${url}: ${e.message}. Fallback a primeros 2 valores.`);
      const first2 = await getFirstTwoCoordsAscii(url, latName, lonName);
      const lonNorm = normalizeLon(lon, first2.lon.v0);
      latIdx = toIndex(lat, first2.lat.v0, first2.lat.step, latLen, first2.lat.asc);
      lonIdx = toIndex(lonNorm, first2.lon.v0, first2.lon.step, lonLen, first2.lon.asc);
    }
    if (cachedGrid) {
      cachedGrid.latIdx = latIdx;
      cachedGrid.lonIdx = lonIdx;
      cachedGrid.latName = latName;
      cachedGrid.lonName = lonName;
      cachedGrid.baseUrlForIdx = url;
    }
  }

  const vars = await listVarsFromDDS(url);
  if (process.env.DEBUG_CLIMO) {
    log.info(`[MERRA] ${dateISO} vars DDS (${url}):`, Array.from(vars).slice(0, 20).join(', '));
  }
  const candVars = ['T2M', 't2m', 'T2M_2m'];
  let varName = candVars.find(v => vars.has(v));

  if (!varName) {
    for (const v of candVars) {
      try {
        const probe = await curlAscii(url, `${v}[0:0][${latIdx}:${latIdx}][${lonIdx}:${lonIdx}]`);
        const arr = parseAsciiArray(probe);
        if (arr.length >= 1 && Number.isFinite(arr[0])) { varName = v; break; }
      } catch (_) {}
    }
  }

  if (!varName) {
    if (process.env.DEBUG_CLIMO) {
      const firstVars = Array.from(vars).slice(0, 12).join(', ');
      log.warn(`[MERRA] ${dateISO} sin T2M en ${url}. Ejemplos DDS: ${firstVars || '(vacío)'} ...`);
    }
    return null;
  }
  if (process.env.DEBUG_CLIMO) log.info(`[MERRA] ${dateISO} usando var=${varName} en ${url}`);

  const projs = [
    `${varName}[0:1:23][${latIdx}:${latIdx}][${lonIdx}:${lonIdx}]`,
    `${varName}[0:23][${latIdx}:${latIdx}][${lonIdx}:${lonIdx}]`,
  ];

  let ascii = null;
  for (const proj of projs) {
    try {
      const raw = await curlAscii(url, proj);
      if (!raw) { log.warn(`[MERRA] ${dateISO} ASCII vacío (${proj}) en ${url}`); continue; }
      const vals = parseAsciiArray(raw);
      if (vals && vals.length) { ascii = vals; break; }
    } catch (e) {
      log.warn(`[MERRA] ${dateISO} parse ASCII error (${proj}) en ${url}: ${e.message}`);
    }
  }
  if (!Array.isArray(ascii)) return null;

  const valsK = ascii;
  const valsKclean = valsK.filter(v => Number.isFinite(v) && v > 150 && v < 350);
  if (valsKclean.length < 12) {
    log.warn(`[MERRA] ${dateISO} horas válidas=${valsKclean.length} (<12) para ${varName} en ${url}`);
    return null;
  }

  const valsC = valsKclean.map(k => k - 273.15);
  const tmax = Math.max(...valsC);
  const tmin = Math.min(...valsC);

  if (process.env.DEBUG_CLIMO) {
    log.debug(`[MERRA] ${dateISO} ${varName}: ok horas=${valsKclean.length} tmin=${tmin.toFixed(1)}°C tmax=${tmax.toFixed(1)}°C en ${url}`);
  }
  return { tmax, tmin, source: url };
}

async function readDayT2M(lat, lon, dateISO, cachedGrid) {
  const dt = new Date(dateISO + 'T00:00:00Z');
  const candidates = buildMERRACandidates(dt);

  for (const c of candidates) {
    try { await getText(`${c}.dds`); }
    catch { if (process.env.DEBUG_CLIMO) log.info(`[MERRA:MISS] ${dateISO} ${c}`); continue; }
    if (process.env.DEBUG_CLIMO) log.info(`[MERRA:OK]   ${dateISO} ${c}`);

    const rec = await tryReadDayFromUrl(c, dateISO, lat, lon, cachedGrid).catch(() => null);
    if (rec) return rec;
  }
  return null;
}

export async function climoTemp2mSameDayBackfill(
  lat, lon, targetISO,
  {
    yearsNeeded = Number(process.env.CLIMO_YEARS ?? 5),
    maxExtraYears = Number(process.env.CLIMO_MAX_EXTRA ?? 10),
    quiet = true,
  } = {}
) {
  assert(!Number.isNaN(new Date(targetISO + 'T00:00:00Z').valueOf()), 'Fecha inválida');

  const details = [];
  const cachedGrid = {};
  let collected = 0;
  let offset = 1;
  let extraUsed = 0;

  while (collected < yearsNeeded) {
    const baseDate = new Date(targetISO + 'T00:00:00Z');
    const year = baseDate.getUTCFullYear() - offset;
    const dt = new Date(Date.UTC(year, baseDate.getUTCMonth(), baseDate.getUTCDate()));
    const iso = dt.toISOString().slice(0, 10);

    const rec = await readDayT2M(lat, lon, iso, cachedGrid).catch(() => null);
    if (rec) {
      details.push({
        date: iso,
        tmax: +rec.tmax.toFixed(2),
        tmin: +rec.tmin.toFixed(2),
        src: rec.source.replace(/^https?:\/\/[^/]+/, ''),
      });
      collected++;
      if (!quiet) log.debug(`[MERRA CLIMO] ${iso} ok (tmax=${rec.tmax.toFixed(1)} tmin=${rec.tmin.toFixed(1)})`);
    } else {
      extraUsed++;
      if (extraUsed > maxExtraYears && collected === 0) break;
    }

    offset++;
    if ((offset - 1) > (yearsNeeded + maxExtraYears)) break;
  }

  if (collected === 0) {
    return {
      tmax_mean: null,
      tmin_mean: null,
      samples: 0,
      details: [],
      source: 'MERRA-2 T2M same-day backfill (sin muestras)',
    };
  }

  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const tmax_mean = +mean(details.map(d => d.tmax)).toFixed(2);
  const tmin_mean = +mean(details.map(d => d.tmin)).toFixed(2);

  return {
    tmax_mean,
    tmin_mean,
    samples: collected,
    details,
    source: `MERRA-2 (ASM/SLV T2M) — mismo día hacia atrás, ${collected} muestras`,
  };
}
