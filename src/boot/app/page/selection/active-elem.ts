import { reactive } from 'vue';

export interface IPageActiveElemReact {
  id: string | null;
  type: string;
}

export class PageActiveElem {
  react: IPageActiveElemReact;

  constructor() {
    this.react = reactive({
      id: null,
      type: 'page',
    });
  }

  is(elemId: string) {
    return elemId === this.react.id;
  }
}
