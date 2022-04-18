import { DeepNotesApp } from './app';

export class AppSerialization {
  readonly app: DeepNotesApp;

  constructor(app: DeepNotesApp) {
    this.app = app;
  }
}
