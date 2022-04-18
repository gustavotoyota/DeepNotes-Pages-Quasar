export function getDeepValue(
  initialObj: any,
  path: string[],
  defaultVal: () => any
): any {
  let obj = initialObj;

  for (const key of path.slice(0, -1)) {
    if (obj[key] == null) {
      return defaultVal();
    }

    obj = obj[key];
  }

  return obj[path.at(-1) ?? ''] ?? defaultVal();
}

export function setDeepValue(initialObj: any, path: string[], val: any): void {
  let obj = initialObj;

  for (const key of path.slice(0, -1)) {
    if (obj[key] === undefined) {
      obj[key] = {};
    }

    obj = obj[key];
  }

  obj[path.at(-1) ?? ''] = val;
}
