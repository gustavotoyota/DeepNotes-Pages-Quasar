import { reactive } from 'vue';
import { AppPage } from '../page';

export class PageActiveElem {
  page: AppPage;

  react: {
    id: string | null;
    type: string;
  };

  constructor(page: AppPage) {
    this.page = page;

    this.react = reactive({
      id: null,
      type: 'page',
    });
  }

  is(elemId: string) {
    return elemId === this.react.id;
  }
}
