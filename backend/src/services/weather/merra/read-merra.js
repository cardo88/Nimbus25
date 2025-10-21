import assert from 'node:assert';
import { log } from '../logger.js';
import { getText } from './opendap-client.js';
import { buildMERRACandidates } from './urls.js';
import {
  getDimsFromDDSorDMR, getFirstTwoCoordsAscii,
  normalizeLon, toIndex, getNearestTimeIndex
} from './grid.js';
import { listVarsFromDDS } from './variables.js';
import { readPointASCII } from './parsing.js';

function rhFromQV2M_PS_T2M(QV2M, PS, T2M) {
  if (QV2M == null || PS == null || T2M == null) return null;
  const q = QV2M;  // kg/kg
  const p = PS;    // Pa
  const e = (q * p) / (0.622 + 0.378 * q);                  // Pa
  const Tc = T2M - 273.15;
  const es = 611.2 * Math.exp((17.67 * Tc) / (T2M - 29.65)); // Pa
  const rh = 100 * (e / es);
  return Math.max(0, Math.min(100, rh));
}

async function findNearestMERRAUrl(dateISO, maxOffsetDays = 3) {
  const d0 = new Date(dateISO + 'T00:00:00Z');

  for (let off = 0; off <= maxOffsetDays; off++) {
    for (const sign of [0, +1, -1]) {
      if (off === 0 && sign !== 0) continue;

      const dt = new Date(d0);
      dt.setUTCDate(d0.getUTCDate() + off * sign);

      for (const candidate of buildMERRACandidates(dt)) {
        try {
          await getText(`${candidate}.dds`);
          if (process.env.DEBUG_CLIMO) log.info(`[MERRA:OK]   ${dt.toISOString().slice(0, 10)} ${candidate}`);
          return { url: candidate, usedDate: dt.toISOString().slice(0, 10) };
        } catch {
          if (process.env.DEBUG_CLIMO) log.info(`[MERRA:MISS] ${dt.toISOString().slice(0, 10)} ${candidate}`);
        }
      }
    }
  }
  return { url: null, usedDate: null };
}

export async function readMERRA(lat, lon, dateISO) {
  assert(!Number.isNaN(new Date(dateISO + 'T00:00:00Z').valueOf()), 'Fecha inválida');

  const { url: base, usedDate } = await findNearestMERRAUrl(dateISO, 3);
  if (!base) {
    log.warn(`[MERRA] No hay granules cercanos a ${dateISO} (±3d)`);
    return { T2M: null, RH2M: null, U10M: null, V10M: null, merraFile: null };
  }

  let dims;
  try { dims = await getDimsFromDDSorDMR(base); }
  catch (e) { log.warn('[MERRA] Error dimensiones:', e.message);
    return { T2M: null, RH2M: null, U10M: null, V10M: null, merraFile: null }; }

  const { latName, lonName, latLen, lonLen } = dims;

  let coords;
  try { coords = await getFirstTwoCoordsAscii(base, latName, lonName); }
  catch (e) { log.warn('[MERRA] No pude leer coords:', e.message);
    return { T2M: null, RH2M: null, U10M: null, V10M: null, merraFile: null }; }

  const { lat: LAT, lon: LON } = coords;

  const lonNorm = normalizeLon(lon, LON.v0);
  const yi = toIndex(lat, LAT.v0, LAT.step, latLen, LAT.asc);
  const xi = toIndex(lonNorm, LON.v0, LON.step, lonLen, LON.asc);
  const ti = await getNearestTimeIndex(base).catch(() => 0);

  const varSet = await listVarsFromDDS(base);
  const has = (n) => varSet.has(n);

  let T2M = null, RH2M = null, U = null, V = null;

  try { if (has('T2M')) T2M = await readPointASCII(getText, base, 'T2M', ti, yi, xi); }
  catch (e) { log.warn('[MERRA] T2M:', e.message); }

  try {
    if (has('RH2M')) {
      RH2M = await readPointASCII(getText, base, 'RH2M', ti, yi, xi);
    } else if (T2M != null && has('QV2M') && has('PS')) {
      const QV2M = await readPointASCII(getText, base, 'QV2M', ti, yi, xi);
      const PS = await readPointASCII(getText, base, 'PS', ti, yi, xi);
      RH2M = rhFromQV2M_PS_T2M(QV2M, PS, T2M);
    }
  } catch (e) { log.warn('[MERRA] RH2M:', e.message); }

  try {
    if (has('U10M') && has('V10M')) {
      U = await readPointASCII(getText, base, 'U10M', ti, yi, xi);
      V = await readPointASCII(getText, base, 'V10M', ti, yi, xi);
    } else if (has('U2M') && has('V2M')) {
      U = await readPointASCII(getText, base, 'U2M', ti, yi, xi);
      V = await readPointASCII(getText, base, 'V2M', ti, yi, xi);
    }
  } catch (e) { log.warn('[MERRA] Viento:', e.message); }

  const saneK = v => (v != null && Number.isFinite(v) && v > 150 && v < 350) ? v : null;
  const saneMs = v => (v != null && Number.isFinite(v) && Math.abs(v) < 200) ? v : null;
  const saneRH = v => (v != null && Number.isFinite(v) && v >= 0 && v <= 100) ? v : null;

  const T2M_sane = saneK(T2M);
  const U_sane = saneMs(U);
  const V_sane = saneMs(V);
  const RH_sane = saneRH(RH2M);

  if (T2M_sane == null && T2M != null) log.warn(`[MERRA] T2M fuera de rango: ${T2M}`);
  if ((U_sane == null && U != null) || (V_sane == null && V != null)) log.warn(`[MERRA] Viento fuera de rango: U=${U} V=${V}`);
  if (RH_sane == null && RH2M != null) log.warn(`[MERRA] RH fuera de rango: ${RH2M}`);

  const tC = (T2M_sane != null) ? (T2M_sane - 273.15).toFixed(1) : null;
  log.debug(`[MERRA] ${usedDate}: T2M=${tC ?? 'na'}°C RH=${RH_sane ?? 'na'}%`);

  return { T2M: T2M_sane, RH2M: RH_sane, U10M: U_sane, V10M: V_sane, merraFile: base };
}
