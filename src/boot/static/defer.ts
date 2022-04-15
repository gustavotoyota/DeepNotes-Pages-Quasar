export class Deferred<T extends object> {
  placeholder: T;
  value: T = null as any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.placeholder = new Proxy(this, {
      apply(target, thisArg, args) {
        return Reflect.apply(target.value as () => any, thisArg, args);
      },
      construct(target, args) {
        return Reflect.construct(target.value as () => any, args);
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
    });
  }
}

export function createDeferrer<T = Record<string, any>>(target: any = {}): T {
  return new Proxy(target, {
    get(target, propertyKey) {
      if (propertyKey in target && target[propertyKey] !== undefined) {
        const value = target[propertyKey];

        if (value instanceof Deferred) {
          return value.placeholder;
        } else {
          return value;
        }
      }

      const deferred = new Deferred();

      target[propertyKey] = deferred;

      return deferred.placeholder;
    },
    set(target, propertyKey, value) {
      if (propertyKey in target && target[propertyKey] instanceof Deferred)
        target[propertyKey].value = value;

      target[propertyKey] = value;

      return true;
    },
  });
}

export class Deferrer {
  constructor() {
    return createDeferrer<this>(this);
  }
}
