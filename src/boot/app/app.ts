import { boot } from 'quasar/wrappers';
import { Factory, factory } from '../static/composition-root';
import 'src/boot/static/types';
import { AppSerialization } from './serialization';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $app: App;
    console: Console;
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
  readonly serialization: AppSerialization;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);

    globalThis.__DEEP_NOTES__ = {
      pages: {},
    };
  }
}

export default boot((params) => {
  const app = factory.makeApp();

  params.app.config.globalProperties.$app = factory.makeApp();
  params.app.config.globalProperties.console = console;

  params.app.provide('app', app);
});
