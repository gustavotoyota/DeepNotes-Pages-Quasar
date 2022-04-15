// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export class Deferred<T> {
  placeholder: T;
  value: T;

  constructor() {
    this.placeholder = new Proxy(
      {},
      {
        apply(target, thisArg, args) {
          return Reflect.apply(target.value, thisArg, args);
        },
        construct(target, args) {
          return Reflect.construct(target.value, args);
        },
        defineProperty(target, propertyKey, attributes) {
          return Reflect.defineProperty(target.value, propertyKey, attributes);
        },
        deleteProperty(target, propertyKey) {
          return Reflect.deleteProperty(target.value, propertyKey);
        },
        get(target, propertyKey, receiver) {
          return Reflect.get(target.value, propertyKey, receiver);
        },
        getOwnPropertyDescriptor(target, propertyKey) {
          return Reflect.getOwnPropertyDescriptor(target.value, propertyKey);
        },
        getPrototypeOf(target) {
          return Reflect.getPrototypeOf(target.value);
        },
        has(target, propertyKey) {
          return Reflect.has(target.value, propertyKey);
        },
        isExtensible(target) {
          return Reflect.isExtensible(target.value);
        },
        ownKeys(target) {
          return Reflect.ownKeys(target.value);
        },
        preventExtensions(target) {
          return Reflect.preventExtensions(target.value);
        },
        set(target, propertyKey, value, receiver) {
          return Reflect.set(target.value, propertyKey, value, receiver);
        },
        setPrototypeOf(target, prototype) {
          return Reflect.setPrototypeOf(target.value, prototype);
        },
      }
    ) as T;
    this.value = null as T;
  }
}

export function createDeferred<T>(): Deferred<T> {
  return new Deferred<T>();
}

export function createDeferrer<T = Record<string, any>>(): {
  [K in keyof T]: IDeferredObject<T[K]>;
} {
  return new Proxy(
    {},
    {
      get(target, propertyKey) {
        if (propertyKey in target) {
          return target[propertyKey];
        }

        const deferred = createDeferred();

        target[propertyKey] = deferred;

        return deferred;
      },
    }
  );
}

export function createDeferrerEnv<T>(target: T, func: (this: T) => void): void {
  const envTarget = {};

  const deferrerEnv = new Proxy(envTarget, {
    get(target, propertyKey) {
      if (propertyKey in target) {
        const value = target[propertyKey];

        if (value instanceof Deferred) {
          return value.placeholder;
        } else {
          return value;
        }
      }

      const deferred = createDeferred();

      target[propertyKey] = deferred;

      return deferred.placeholder;
    },
    set(target, propertyKey, value) {
      if (propertyKey in target && target[propertyKey] instanceof Deferred) {
        target[propertyKey].value = value;
      }

      target[propertyKey] = value;

      return true;
    },
  });

  func.bind(deferrerEnv)();

  Object.assign(target, envTarget);
}
