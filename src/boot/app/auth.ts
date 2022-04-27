import { AxiosInstance } from 'axios';
import jwtDecode from 'jwt-decode';
import { Cookies } from 'quasar';
import { boot } from 'quasar/wrappers';
import { DeepNotesApp } from './app';

export const apiBaseURL = process.env.DEV
  ? 'http://localhost:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  user: '/auth/user',
};

const redirectBaseURL = process.env.DEV
  ? 'http://localhost:60379'
  : 'https://deepnotes.app';

export const authRedirects = {
  login: `${redirectBaseURL}/login`,
  logout: `${redirectBaseURL}/`,
};

type JwtToken = {
  exp: number;
  iat: number;
};

export class AppAuth {
  readonly app: DeepNotesApp;

  constructor(app: DeepNotesApp) {
    this.app = app;
  }

  logout() {
    Cookies.set('auth._token.local', 'false');
    Cookies.set('auth._token_expiration.local', 'false');

    Cookies.set('auth._refresh_token.local', 'false');
    Cookies.set('auth._refresh_token_expiration.local', 'false');

    location.assign(authRedirects.logout);
  }
}

function isTokenExpiring(cookies: Cookies, cookie: string) {
  const decodedToken = jwtDecode<JwtToken>(cookies.get(cookie));

  const timeToLive = decodedToken.exp * 1000 - decodedToken.iat * 1000;
  const timeDifference = decodedToken.exp * 1000 - new Date().getTime();
  const timeExpired = timeToLive - timeDifference;

  return timeExpired / timeToLive >= 0.75;
}

async function refreshTokens(cookies: Cookies, api: AxiosInstance) {
  if (
    !isTokenExpiring(cookies, 'auth._token.local') &&
    !isTokenExpiring(cookies, 'auth._refresh_token.local')
  ) {
    return;
  }

  const response = await api.post(authEndpoints.refresh, {
    refreshToken: cookies.get('auth._refresh_token.local'),
  });

  if (response.status === 200) {
    cookies.set('auth._token.local', response.data.accessToken);
    cookies.set(
      'auth._token_expiration.local',
      jwtDecode<JwtToken>(response.data.accessToken).exp.toString()
    );

    cookies.set('auth._refresh_token.local', response.data.refreshToken);
    cookies.set(
      'auth._refresh_token_expiration.local',
      jwtDecode<JwtToken>(response.data.refreshToken).exp.toString()
    );
  }
}

export default boot(async ({ app, ssrContext, redirect }) => {
  const cookies = Cookies.parseSSR(ssrContext);

  if (!cookies.has('auth._token.local')) {
    redirect(authRedirects.login);
    return;
  }

  const api: AxiosInstance = app.config.globalProperties.$api;

  const response = await api.post(authEndpoints.user);

  if (response.status !== 200) {
    redirect(authRedirects.login);
    return;
  }

  // Refresh tokens automatically

  if (process.env.CLIENT) {
    refreshTokens(cookies, api);
    setInterval(refreshTokens, 60 * 1000);
  }
});
