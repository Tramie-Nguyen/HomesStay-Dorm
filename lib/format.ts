export function formatGia(gia: number): string {
  if (!gia || gia === 0) return "0";

  if (gia < 1_000_000) {
    // Dưới 1 triệu → hiển thị K
    const k = gia / 1000;
    // Nếu là số nguyên thì bỏ decimal
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }

  // Từ 1 triệu trở lên → hiển thị X.Xtr hoặc Xtr
  const tr = gia / 1_000_000;
  return `${tr % 1 === 0 ? tr : tr.toFixed(1)} triệu`;
}

export function formatGiaRange(min: number, max: number): string {
  if (min === max) return formatGia(min);
  return `${formatGia(min)} - ${formatGia(max)}`;
}
