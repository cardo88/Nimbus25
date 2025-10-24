export const HOST = process.env.MERRA_OPENDAP_BASE || 'https://goldsmr4.gesdisc.eosdis.nasa.gov/opendap/hyrax';

export const PRODUCTS = (process.env.MERRA_PRODUCTS || 'MERRA2/M2I1NXASM.5.12.4,MERRA2/M2T1NXSLV.5.12.4')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const pad = (n) => String(n).padStart(2, '0');
export function merraStream(year) { return (year >= 1992) ? 400 : 300; }

export function buildMERRACandidates(date) {
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const stream = merraStream(yyyy);

  const asm = `${HOST}/MERRA2/M2I1NXASM.5.12.4/${yyyy}/${mm}/MERRA2_${stream}.inst1_2d_asm_Nx.${yyyy}${mm}${dd}.nc4`;
  const slv = `${HOST}/MERRA2/M2T1NXSLV.5.12.4/${yyyy}/${mm}/MERRA2_${stream}.tavg1_2d_slv_Nx.${yyyy}${mm}${dd}.nc4`;
  return [asm, slv];
}
