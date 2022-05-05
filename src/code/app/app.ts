import 'src/code/static/types';

import { Factory } from '../static/composition-root';
import { AppSerialization } from './serialization';

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
