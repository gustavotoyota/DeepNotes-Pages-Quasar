import { boot } from 'quasar/wrappers';
import { DeepNotesApp } from 'src/code/app/app';
import { factory } from 'src/code/static/composition-root';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dn: DeepNotesApp;
    console: Console;
    process: NodeJS.Process;
  }
}

export default boot((params) => {
  const app = factory.makeApp();

  params.app.config.globalProperties.$dn = app;
  params.app.config.globalProperties.console = console;
  params.app.config.globalProperties.process = process;

  params.app.provide('app', app);
});
