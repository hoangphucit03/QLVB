// Serializes numbering within one server process. Multiple instances require a shared lock.
let pending: Promise<unknown> = Promise.resolve();
export function withNumberingLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation, operation);
  pending = result.catch(() => undefined);
  return result;
}

export function nextDocumentNumber<T extends { nam: number }>(list: T[], year: number, field: keyof T): number {
  return list.reduce((max, item) => {
    const number = Number(item[field]);
    return Number(item.nam) === year && Number.isSafeInteger(number) && number > max ? number : max;
  }, 0) + 1;
}
