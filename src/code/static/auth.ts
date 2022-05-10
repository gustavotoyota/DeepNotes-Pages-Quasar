import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { from_base64 } from 'libsodium-wrappers';
import { Cookies } from 'quasar';
import { useAuth } from 'src/stores/auth';

import { processSessionPrivateKey } from './crypto/crypto';
import { privateKey } from './crypto/private-key';

export const apiBaseURL = process.env.DEV
  ? 'http://localhost:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  refresh: '/auth/refresh',
  logout: '/auth/logout',
};

export const homeURL = process.env.DEV
  ? 'http://localhost:60379'
  : 'https://deepnotes.app';

export function isTokenValid(tokenName: string): boolean {
  const exp = parseInt(localStorage.getItem(`${tokenName}-exp`) ?? '');

  if (isNaN(exp)) {
    return false;
  }

  return new Date().getTime() < exp;
}

export function isTokenExpiring(tokenName: string): boolean {
  const exp = parseInt(localStorage.getItem(`${tokenName}-exp`) ?? '');
  const iat = parseInt(localStorage.getItem(`${tokenName}-iat`) ?? '');

  if (isNaN(exp) || isNaN(iat)) {
    return true;
  }

  const timeToLive = exp - iat;
  const timeDifference = exp - new Date().getTime();
  const timeExpired = timeToLive - timeDifference;

  return timeExpired / timeToLive >= 0.75;
}
export function areTokensExpiring(): boolean {
  return isTokenExpiring('access-token') || isTokenExpiring('refresh-token');
}

export async function tryRefreshTokens(api: AxiosInstance): Promise<void> {
  const auth = useAuth();

  if (!isTokenValid('refresh-token')) {
    logout(api);
    return;
  }

  if (!areTokensExpiring() && privateKey.exists()) {
    auth.loggedIn = true;
    return;
  }

  if (localStorage.getItem('encrypted-private-key') == null) {
    logout(api);
    return;
  }

  const encryptedPrivateKey = from_base64(
    localStorage.getItem('encrypted-private-key')!
  );

  try {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;

      oldSessionKey: string;
      newSessionKey: string;
    }>(authEndpoints.refresh, {
      refreshToken: localStorage.getItem('refresh-token'),
    });

    // Set API authorization header

    api.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;

    // Store tokens

    storeAuthValues(response.data.accessToken, response.data.refreshToken);

    // Reencrypt private key

    processSessionPrivateKey(
      encryptedPrivateKey,
      from_base64(response.data.oldSessionKey),
      from_base64(response.data.newSessionKey)
    );

    auth.loggedIn = true;
  } catch (err) {
    console.error(err);
    logout(api);
  }
}

function storeTokenValues(tokenName: string, token: string) {
  const decodedToken = jwtDecode<{ exp: number; iat: number }>(token);

  localStorage.setItem(`${tokenName}-iat`, `${decodedToken.iat * 1000}`);
  localStorage.setItem(`${tokenName}-exp`, `${decodedToken.exp * 1000}`);
}

export function storeAuthValues(
  accessToken: string,
  refreshToken: string
): void {
  Cookies.set('access-token', accessToken, {
    sameSite: 'Strict',
    secure: true,
    httpOnly: true,
  });
  storeTokenValues('access-token', accessToken);

  localStorage.setItem('refresh-token', refreshToken);
  storeTokenValues('refresh-token', refreshToken);
}

export function deleteAuthValues() {
  Cookies.remove('access-token');
  localStorage.removeItem('access-token-iat');
  localStorage.removeItem('access-token-exp');

  localStorage.removeItem('refresh-token');
  localStorage.removeItem('refresh-token-iat');
  localStorage.removeItem('refresh-token-exp');
}

export function logout(api: AxiosInstance) {
  const auth = useAuth();

  if (!auth.loggedIn) {
    return;
  }

  auth.loggedIn = false;

  // Notify server of logout

  try {
    api.post(authEndpoints.logout);
  } catch (err) {
    console.error(err);
  }

  // Delete auth values

  deleteAuthValues();

  // Remove e-mail from local storage

  localStorage.removeItem('email');

  // Clear private key from memory

  privateKey.clear();

  // Delete API authorization header

  delete api.defaults.headers.common.Authorization;
}
