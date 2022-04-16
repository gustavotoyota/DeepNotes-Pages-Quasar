import { reactive } from 'vue';
import { Page } from '../page';

export interface IPageActiveElemReact {
  id: string | null;
  type: string;
}

export class PageActiveElem {
  page: Page;

  react: IPageActiveElemReact;

  constructor(page: Page) {
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
