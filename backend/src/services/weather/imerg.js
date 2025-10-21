import { ym, ymd } from './utils.js';
import { GPM_OPENDAP_BASE } from './config.js';
import { headOk } from './http.js';
import { getDimsFromDDSorDMR, getFirstTwoCoordsAscii, normalizeLon, toIndex, readPointASCII } from './opendap.js';
import { log } from './logger.js';

export async function getIMERGFileBase(dateISO) {
  const YMP = ym(dateISO);
  const D   = ymd(dateISO);
  const dfName = `3B-DAY.MS.MRG.3IMERG.${D}-S000000-E235959.V07B.nc4`;
  const dlName = `3B-DAY-L.MS.MRG.3IMERG.${D}-S000000-E235959.V07B.nc4`;

  const dfBase = `${GPM_OPENDAP_BASE}/GPM_L3/GPM_3IMERGDF.07/${YMP}/${dfName}`;
  if (await headOk(`${dfBase}.dds`)) return dfBase;

  const dlBase = `${GPM_OPENDAP_BASE}/GPM_L3/GPM_3IMERGDL.07/${YMP}/${dlName}`;
  if (await headOk(`${dlBase}.dds`)) return dlBase;

  throw new Error(`IMERG no disponible para ${dateISO} (ni DF ni DL)`);
}

export async function readIMERGPrecip(lat, lon, dateISO) {
  const base = await getIMERGFileBase(dateISO);
  log.info(`[IMERG] ${dateISO} → ${base}`);
  const { latName, lonName, latLen, lonLen } = await getDimsFromDDSorDMR(base);
  const { lat: LAT, lon: LON } = await getFirstTwoCoordsAscii(base, latName, lonName);
  const lonNorm = normalizeLon(lon, LON.v0);
  const yi = toIndex(lat,     LAT.v0, LAT.step, latLen, LAT.asc);
  const xi = toIndex(lonNorm, LON.v0, LON.step, lonLen, LON.asc);
  const precip = await readPointASCII(base, 'precipitation', 0, yi, xi);
  log.info(`[IMERG] ${dateISO}: precip=${precip.toFixed(2)} mm`);
  return { precip, imergFile: base };
}
