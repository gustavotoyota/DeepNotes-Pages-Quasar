import { reactive, UnwrapNestedRefs } from 'vue';
import { Page } from '../page';

export interface IPageActiveElemReact {
  id: string | null;
  type: string;
}

export class PageActiveElem {
  page: Page;

  react: UnwrapNestedRefs<IPageActiveElemReact>;

  constructor(page: Page) {
    this.page = page;

    this.react = reactive<IPageActiveElemReact>({
      id: null,
      type: 'page',
    });
  }

  is(elemId: string) {
    return elemId === this.react.id;
  }
}
