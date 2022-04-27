import { boot } from 'quasar/wrappers';
import { Factory, factory } from '../static/composition-root';
import 'src/boot/static/types';
import { AppSerialization } from './serialization';
import { AppAuth } from './auth';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dn: DeepNotesApp;
    console: Console;
    process: NodeJS.Process;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __DEEP_NOTES__: {
    pages: Record<
      string,
      {
        zoom?: number;
      }
    >;
  };
}

export class DeepNotesApp {
  readonly auth: AppAuth;
  readonly serialization: AppSerialization;

  constructor(factory: Factory) {
    this.auth = factory.makeAuth(this);
    this.serialization = factory.makeSerialization(this);

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };
  }
}

export default boot((params) => {
  const app = factory.makeApp();

  params.app.config.globalProperties.$dn = app;
  params.app.config.globalProperties.console = console;
  params.app.config.globalProperties.process = process;

  params.app.provide('app', app);
});
