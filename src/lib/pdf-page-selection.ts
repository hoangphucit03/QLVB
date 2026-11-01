export function parsePageSelection(value: string, count: number): number[] {
  if (!value.trim()) throw new Error('Nhập trang, ví dụ: 1,3,5-8.');
  const pages = new Set<number>();
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Định dạng trang không hợp lệ. Dùng ví dụ: 1,3,5-8.');
    const start = Number(match[1]), end = Number(match[2] || match[1]);
    if (start < 1 || end > count || start > end || !Number.isSafeInteger(end)) throw new Error(`Chỉ chọn trang từ 1 đến ${count}, theo thứ tự tăng dần trong mỗi khoảng.`);
    for (let page = start; page <= end; page++) pages.add(page - 1);
  }
  return [...pages].sort((a, b) => a - b);
}
