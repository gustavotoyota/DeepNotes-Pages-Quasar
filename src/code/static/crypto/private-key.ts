import { decryptAssymetric } from './crypto';

export function createPrivateKey(value: Uint8Array | null = null) {
  let _value = value;

  return new (class PrivateKey {
    set(value: Uint8Array | null) {
      _value = value;
    }
    clear() {
      this.set(null);
    }

    exists(): boolean {
      return _value != null;
    }

    decrypt(
      nonceAndCiphertext: Uint8Array,
      sendersPublicKey: Uint8Array
    ): Uint8Array {
      return decryptAssymetric(nonceAndCiphertext, sendersPublicKey, _value!);
    }
  })();
}

export type PrivateKey = ReturnType<typeof createPrivateKey>;

export const privateKey = createPrivateKey();
