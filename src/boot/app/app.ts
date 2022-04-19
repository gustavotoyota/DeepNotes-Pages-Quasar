import { boot } from 'quasar/wrappers';
import { Factory, factory } from '../static/composition-root';
import 'src/boot/static/types';
import { AppSerialization } from './serialization';
import { AppTemplates } from './templates';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $app: App;
  }
}

export class DeepNotesApp {
  readonly serialization: AppSerialization;
  readonly templates: AppTemplates;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
    this.templates = factory.makeTemplates(this);
  }
}

export default boot((params) => {
  const app = factory.makeApp();

  params.app.config.globalProperties.$app = factory.makeApp();

  params.app.provide('app', app);
});
