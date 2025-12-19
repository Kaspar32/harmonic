export function arraysHaveCommonElement<T>(a: T[], b: T[]): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  return a.some((item) => b.includes(item));
}
