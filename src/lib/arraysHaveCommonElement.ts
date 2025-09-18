export function arraysHaveCommonElement(a: any[], b: string | any[]) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    return a.some((item) => b.includes(item));
  }