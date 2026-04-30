export function formatGia(gia: number): string {
  const trieu = gia / 1_000_000;
  const nguyen = Math.floor(trieu);
  const le = Math.round((trieu % 1) * 10);
  return le === 0 ? `${nguyen}tr` : `${nguyen}tr${le}`;
}

export function formatGiaRange(min: number, max: number): string {
  if (min === max || max === 0) return `${formatGia(min)}/giường`;
  return `${formatGia(min)} - ${formatGia(max)}/giường`;
}
