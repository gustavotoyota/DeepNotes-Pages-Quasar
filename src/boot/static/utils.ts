export function negateProp<T extends Record<any, any>>(obj: T, key: keyof T) {
  // @ts-ignore
  obj[key] = !obj[key];
}
