import { boot } from 'quasar/wrappers';
import { Factory, factory } from '../static/composition-root';
import 'src/boot/static/types';
import { AppSerialization } from './serialization';
import { AppPage } from './page/page';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { refProp } from '../static/vue';
import { usePageCache } from 'src/stores/page-cache';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $app: App;
  }
}

export interface IAppReact {
  pageId: string | null;

  page: ComputedRef<AppPage | null>;
}

export class DeepNotesApp {
  readonly serialization: AppSerialization;

  react!: UnwrapRef<IAppReact>;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);

    refProp(this, 'react', {
      pageId: null,

      page: computed(() => {
        const pageCache = usePageCache();

        return (
          pageCache.cache.find((page) => {
            return page.id === this.react.pageId;
          }) ?? null
        );
      }),
    });
  }
}

export default boot((params) => {
  const app = factory.makeApp();

  params.app.config.globalProperties.$app = factory.makeApp();

  params.app.provide('app', app);
});
