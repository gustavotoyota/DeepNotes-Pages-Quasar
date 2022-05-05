import sodium from 'libsodium-wrappers';

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

    decrypt(nonceAndCyphertext: string, publicKey: Uint8Array): Uint8Array {
      const [nonce, cyphertext] = nonceAndCyphertext.split('.');

      return sodium.crypto_box_open_easy(
        sodium.from_base64(cyphertext),
        sodium.from_base64(nonce),
        publicKey,
        _value!
      );
    }
  })();
}

export const privateKey = createPrivateKey();
