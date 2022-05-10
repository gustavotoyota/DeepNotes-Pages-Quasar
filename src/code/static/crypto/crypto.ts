import './argon2';

import sodium, { to_base64 } from 'libsodium-wrappers';

import { concatUint8Array } from '../utils';
import { privateKey } from './private-key';

export function encryptAssymetric(
  plaintext: Uint8Array,
  recipientsPublicKey: Uint8Array,
  sendersPrivateKey: Uint8Array
): Uint8Array {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

  const ciphertext = sodium.crypto_box_easy(
    plaintext,
    nonce,
    recipientsPublicKey,
    sendersPrivateKey
  );

  return concatUint8Array(nonce, ciphertext);
}
export function decryptAssymetric(
  nonceAndCiphertext: Uint8Array,
  sendersPublicKey: Uint8Array,
  recipientsPrivateKey: Uint8Array
): Uint8Array {
  const nonce = nonceAndCiphertext.slice(0, sodium.crypto_box_NONCEBYTES);
  const ciphertext = nonceAndCiphertext.slice(sodium.crypto_box_NONCEBYTES);

  return sodium.crypto_box_open_easy(
    ciphertext,
    nonce,
    sendersPublicKey,
    recipientsPrivateKey
  );
}

export function encryptSymmetric(
  plaintext: Uint8Array,
  key: Uint8Array,
  additionalData: string | null = null
): Uint8Array {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    additionalData,
    null,
    nonce,
    key
  );

  return concatUint8Array(nonce, ciphertext);
}
export function decryptSymmetric(
  nonceAndCiphertext: Uint8Array,
  key: Uint8Array,
  additionalData: string | null = null
): Uint8Array {
  const nonce = nonceAndCiphertext.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = nonceAndCiphertext.slice(
    sodium.crypto_secretbox_NONCEBYTES
  );

  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    additionalData,
    nonce,
    key
  );
}

export async function computeDerivedKeys(email: string, password: string) {
  // Master key

  const masterKey = (
    await argon2.hash({
      pass: password,
      salt: email,
      type: argon2.ArgonType.Argon2id,
      hashLen: 32,
    })
  ).hash;

  // Password hash

  const passwordHash = sodium.to_base64(
    (
      await argon2.hash({
        pass: masterKey,
        salt: password,
        type: argon2.ArgonType.Argon2id,
      })
    ).hash
  );

  return {
    masterKey,

    passwordHash,
  };
}
export async function generateRandomKeys(masterKey: Uint8Array) {
  // Key pair

  const keyPair = sodium.crypto_box_keypair();

  const encryptedPrivateKey = encryptSymmetric(keyPair.privateKey, masterKey);

  // Group symmetric key

  const symmetricKey = sodium.randombytes_buf(32);

  const encryptedSymmetricKey = encryptAssymetric(
    symmetricKey,
    keyPair.publicKey,
    keyPair.privateKey
  );

  return {
    publicKey: keyPair.publicKey,
    encryptedPrivateKey,

    encryptedSymmetricKey,
  };
}

export function processSessionPrivateKey(
  oldEncryptedPrivateKey: Uint8Array,
  oldEncryptionKey: Uint8Array,
  sessionKey: Uint8Array
) {
  // Decrypt private key

  const decryptedPrivateKey = decryptSymmetric(
    oldEncryptedPrivateKey,
    oldEncryptionKey
  );

  // Encrypt private key with session key

  const newEncryptedPrivateKey = encryptSymmetric(
    decryptedPrivateKey,
    sessionKey
  );

  // Store encrypted private key on local storage

  localStorage.setItem(
    'encrypted-private-key',
    to_base64(newEncryptedPrivateKey)
  );

  // Store private key on memory

  privateKey.set(decryptedPrivateKey);

  return decryptedPrivateKey;
}
