import { Factory } from '../static/composition-root';
import 'src/code/static/types';
import { AppSerialization } from './serialization';
import { AppAuth } from '../../boot/internal/auth';

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
