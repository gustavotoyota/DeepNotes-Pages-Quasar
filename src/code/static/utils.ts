export function negateProp<T extends Record<any, any>>(obj: T, key: keyof T) {
  // @ts-ignore
  obj[key] = !obj[key];
}

export function concatUint8Array(...arrays: any[]) {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
