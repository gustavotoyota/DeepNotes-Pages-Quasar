import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { Cookies } from 'quasar';
import { boot } from 'quasar/wrappers';
import { DeepNotesApp } from './app';

export const apiBaseURL = process.env.DEV
  ? 'http://localhost:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  refresh: '/auth/refresh',
};

const redirectBaseURL = process.env.DEV
  ? 'http://localhost:60379'
  : 'https://deepnotes.app';

export const authRedirects = {
  login: `${redirectBaseURL}/login`,
  logout: `${redirectBaseURL}/`,
};

export const ACCESS_TOKEN_COOKIE = 'access-token';
export const REFRESH_TOKEN_COOKIE = 'refresh-token';

export class AppAuth {
  readonly app: DeepNotesApp;

  constructor(app: DeepNotesApp) {
    this.app = app;
  }

  logout() {
    Cookies.remove(ACCESS_TOKEN_COOKIE);
    Cookies.remove(REFRESH_TOKEN_COOKIE);

    location.assign(authRedirects.logout);
  }
}

function isTokenExpiring(cookies: Cookies, cookie: string) {
  if (!cookies.has(cookie)) {
    return false;
  }

  const decodedToken = jwtDecode<{
    exp: number;
    iat: number;
  }>(cookies.get(cookie));

  const timeToLive = decodedToken.exp * 1000 - decodedToken.iat * 1000;
  const timeDifference = decodedToken.exp * 1000 - new Date().getTime();
  const timeExpired = timeToLive - timeDifference;

  return timeExpired / timeToLive >= 0.75;
}

function areTokensExpiring(cookies: Cookies) {
  return (
    isTokenExpiring(cookies, ACCESS_TOKEN_COOKIE) ||
    isTokenExpiring(cookies, REFRESH_TOKEN_COOKIE)
  );
}

async function refreshTokens(
  cookies: Cookies,
  api: AxiosInstance
): Promise<boolean> {
  const response = await api.post(authEndpoints.refresh, {
    refreshToken: cookies.get(REFRESH_TOKEN_COOKIE),
  });

  if (response.status !== 200) {
    return false;
  }

  cookies.set(ACCESS_TOKEN_COOKIE, response.data.accessToken);
  cookies.set(REFRESH_TOKEN_COOKIE, response.data.refreshToken);

  return true;
}

export default boot(async ({ app, ssrContext, redirect }) => {
  const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;

  if (!cookies.has(ACCESS_TOKEN_COOKIE)) {
    redirect(authRedirects.login);
    return;
  }

  const api: AxiosInstance = app.config.globalProperties.$api;

  if (process.env.SERVER) {
    if (!(await refreshTokens(cookies, api))) {
      redirect(authRedirects.login);
      return;
    }
  }

  if (process.env.CLIENT) {
    setInterval(() => {
      if (areTokensExpiring(cookies)) {
        refreshTokens(cookies, api);
      }
    }, 60 * 1000);
  }
});
