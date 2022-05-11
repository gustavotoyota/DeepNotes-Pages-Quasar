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
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
};

export const homeURL = process.env.DEV
  ? 'http://localhost:60379'
  : 'https://deepnotes.app';

export const pagesURL = process.env.DEV
  ? 'http://localhost:24579'
  : 'https://pages.deepnotes.app';

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

  if (
    isTokenValid('refresh-token') &&
    !areTokensExpiring() &&
    privateKey.exists()
  ) {
    auth.loggedIn = true;
    return;
  }

  try {
    if (!Cookies.get('encrypted-private-key')) {
      return;
    }

    const encryptedPrivateKey = from_base64(
      Cookies.get('encrypted-private-key')
    );

    const response = await api.post<{
      accessToken: string;
      refreshToken: string;

      oldSessionKey: string;
      newSessionKey: string;
    }>(authEndpoints.refresh);

    // Store tokens

    storeTokens(response.data.accessToken, response.data.refreshToken);

    // Reencrypt private key

    processSessionPrivateKey(
      encryptedPrivateKey,
      from_base64(response.data.oldSessionKey),
      from_base64(response.data.newSessionKey)
    );

    auth.loggedIn = true;
  } catch (err) {
    logout(api);
    console.error(err);
  }
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  storeToken('access-token', accessToken);
  storeToken('refresh-token', refreshToken);
}
function storeToken(tokenName: string, token: string) {
  Cookies.set(tokenName, token, {
    sameSite: process.env.PROD ? 'Strict' : 'Lax',
    secure: process.env.PROD,
    httpOnly: process.env.PROD,
  });

  const decodedToken = jwtDecode<{ exp: number; iat: number }>(token);

  localStorage.setItem(`${tokenName}-iat`, `${decodedToken.iat * 1000}`);
  localStorage.setItem(`${tokenName}-exp`, `${decodedToken.exp * 1000}`);
}

export function deleteTokens() {
  deleteToken('access-token');
  deleteToken('refresh-token');
}
export function deleteToken(tokenName: string) {
  Cookies.remove(tokenName);
  localStorage.removeItem(`${tokenName}-iat`);
  localStorage.removeItem(`${tokenName}-exp`);
}

export function logout(api: AxiosInstance) {
  const auth = useAuth();

  if (!Cookies.get('refresh-token')) {
    return;
  }

  // Notify server of logout

  if (auth.loggedIn) {
    try {
      api.post(authEndpoints.logout);
    } catch (err) {
      console.error(err);
    }
  }

  auth.loggedIn = false;

  // Delete token data

  deleteTokens();

  // Clear e-mail

  Cookies.remove('email');

  // Clear private key

  Cookies.remove('encrypted-private-key');
  privateKey.clear();
}
