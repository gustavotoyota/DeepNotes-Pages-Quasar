import './argon2';

import sodium, { from_base64 } from 'libsodium-wrappers';

import { createMasterKey, masterKey } from './master-key';
import { privateKey } from './private-key';

export function encryptAssymetric(
  plaintext: Uint8Array,
  recipientsPublicKey: Uint8Array,
  sendersPrivateKey: Uint8Array
): string {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

  const ciphertext = sodium.crypto_box_easy(
    plaintext,
    nonce,
    recipientsPublicKey,
    sendersPrivateKey
  );

  return sodium.to_base64(nonce) + '.' + sodium.to_base64(ciphertext);
}

export function decryptAssymetric(
  nonceAndCiphertext: string,
  sendersPublicKey: Uint8Array,
  recipientsPrivateKey: Uint8Array
): Uint8Array {
  const [nonce, ciphertext] = nonceAndCiphertext.split('.');

  return sodium.crypto_box_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sendersPublicKey,
    recipientsPrivateKey
  );
}

export function encryptSymmetric(
  plaintext: Uint8Array,
  key: Uint8Array,
  additionalData: string | null = null
): string {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  const cyphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    additionalData,
    null,
    nonce,
    key
  );

  return sodium.to_base64(nonce) + '.' + sodium.to_base64(cyphertext);
}

export function decryptSymmetric(
  noncedCyphertext: string,
  key: Uint8Array,
  additionalData: string | null = null
): Uint8Array {
  const [nonce, cyphertext] = noncedCyphertext.split('.');

  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    sodium.from_base64(cyphertext),
    additionalData,
    sodium.from_base64(nonce),
    key
  );
}

export async function computeDerivedKeys(email: string, password: string) {
  // Master key

  const masterKeyHash = (
    await argon2.hash({
      pass: password,
      salt: email,
      type: argon2.ArgonType.Argon2id,
      hashLen: 32,
    })
  ).hash;

  const masterKey = createMasterKey(masterKeyHash);

  // Password hash

  const passwordHash = sodium.to_base64(
    (
      await argon2.hash({
        pass: masterKeyHash,
        salt: password,
        type: argon2.ArgonType.Argon2id,
      })
    ).hash
  );

  return {
    masterKeyHash,
    masterKey,

    passwordHash,
  };
}

export async function generateRandomKeys(
  masterKey: ReturnType<typeof createMasterKey>
) {
  // Key pair

  const keyPair = sodium.crypto_box_keypair();

  const encryptedPrivateKey = masterKey.encrypt(keyPair.privateKey);

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

export function reencryptSecretKeys(
  decryptedMasterKey: Uint8Array,
  decryptedPrivateKey: Uint8Array,
  sessionKey: Uint8Array
) {
  return {
    sessionEncryptedMasterKey: encryptSymmetric(decryptedMasterKey, sessionKey),
    sessionEncryptedPrivateKey: encryptSymmetric(
      decryptedPrivateKey,
      sessionKey
    ),
  };
}

export function storeCryptoValues(
  encryptedMasterKey: string,
  encryptedPrivateKey: string
) {
  localStorage.setItem('encrypted-master-key', encryptedMasterKey);
  localStorage.setItem('encrypted-private-key', encryptedPrivateKey);
}

export function deleteCryptoValues() {
  localStorage.removeItem('encrypted-master-key');
  localStorage.removeItem('encrypted-private-key');
}

export function processCryptoKeys(
  encryptedPrivateKey: string,
  oldMasterKeyHash: Uint8Array,
  newMasterKeyHash: Uint8Array,
  sessionKey: string
) {
  // Decrypt private key

  const decryptedPrivateKey = decryptSymmetric(
    encryptedPrivateKey,
    oldMasterKeyHash
  );

  // Encrypt keys with session key

  const { sessionEncryptedMasterKey, sessionEncryptedPrivateKey } =
    reencryptSecretKeys(
      newMasterKeyHash,
      decryptedPrivateKey,
      from_base64(sessionKey)
    );

  // Store encrypted keys

  storeCryptoValues(sessionEncryptedMasterKey, sessionEncryptedPrivateKey);

  // Store keys on memory

  masterKey.set(newMasterKeyHash);
  privateKey.set(decryptedPrivateKey);

  return { decryptedPrivateKey };
}
