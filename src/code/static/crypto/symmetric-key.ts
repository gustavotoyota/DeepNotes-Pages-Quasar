import { decryptSymmetric, encryptSymmetric } from './crypto';

export function createSymmetricKey(value: Uint8Array | null = null) {
  let _value = value;

  return new (class SymmetricKey {
    set(value: Uint8Array | null) {
      _value = value;
    }
    clear() {
      this.set(null);
    }

    exists(): boolean {
      return _value != null;
    }

    encrypt(
      plaintext: Uint8Array,
      additionalData: string | null = null
    ): Uint8Array {
      return encryptSymmetric(plaintext, _value!, additionalData);
    }
    decrypt(
      nonceAndCiphertext: Uint8Array,
      additionalData: string | null = null
    ): Uint8Array {
      return decryptSymmetric(nonceAndCiphertext, _value!, additionalData);
    }
  })();
}

export type SymmetricKey = ReturnType<typeof createSymmetricKey>;
