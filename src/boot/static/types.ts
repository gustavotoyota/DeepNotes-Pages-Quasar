export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      DEV: boolean;
      PROD: boolean;
      DEBUGGING: boolean;
      CLIENT: boolean;
      SERVER: boolean;
      MODE:
        | 'spa'
        | 'ssr'
        | 'pwa'
        | 'bex'
        | 'cordova'
        | 'capacitor'
        | 'electron';
    }
  }
}
