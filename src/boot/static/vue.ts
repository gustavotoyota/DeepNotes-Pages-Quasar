import { ref, shallowRef } from 'vue';

export function refProp<T>(obj: object, key: string, value: T) {
  const aux = ref(value);

  Object.defineProperty(obj, key, {
    get() {
      return aux.value;
    },
    set(value) {
      return (aux.value = value);
    },
  });
}

export function shallowRefProp<T>(obj: object, key: string, value: T) {
  const aux = shallowRef(value);

  Object.defineProperty(obj, key, {
    get() {
      return aux.value;
    },
    set(value) {
      return (aux.value = value);
    },
  });
}
