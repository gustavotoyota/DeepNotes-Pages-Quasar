import { refProp } from 'src/boot/static/vue';
import { UnwrapNestedRefs } from 'vue';
import { AppPage } from '../page';

export interface IPageActiveElemReact {
  id: string | null;
  type: string;
}

export class PageActiveElem {
  page: AppPage;

  react!: UnwrapNestedRefs<IPageActiveElemReact>;

  constructor(page: AppPage) {
    this.page = page;

    refProp<IPageActiveElemReact>(this, 'react', {
      id: null,
      type: 'page',
    });
  }

  is(elemId: string) {
    return elemId === this.react.id;
  }
}
