import { reactive, UnwrapNestedRefs } from 'vue';
import { Page } from '../page';

export enum ElemType {
  NOTE = 'note',
  ARROW = 'arrow',
}

export interface IElemReact {
  active: boolean;
  selected: boolean;

  index: number;
}

export class PageElem {
  page: Page;

  id: string;
  type: ElemType;
  parentId: string | null;

  react: UnwrapNestedRefs<IElemReact>;

  constructor(page: Page, id: string, type: ElemType, parentId: string | null) {
    this.page = page;

    this.id = id;
    this.type = type;
    this.parentId = parentId;

    this.react = reactive<IElemReact>({
      active: false,
      selected: false,

      index: -1,
    });
  }
}

export class PageElems {
  page: Page;

  get notes() {
    return this.page.notes;
  }
  get arrows() {
    return this.page.arrows;
  }

  constructor(page: Page) {
    this.page = page;
  }
}
