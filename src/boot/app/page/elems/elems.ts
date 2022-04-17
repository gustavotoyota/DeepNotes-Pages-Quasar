import { reactive, UnwrapNestedRefs } from 'vue';
import { AppPage } from '../page';

export enum ElemType {
  NOTE = 'note',
  ARROW = 'arrow',
}

export interface IPageElemReact {
  active: boolean;
  selected: boolean;

  index: number;
}

export class PageElem {
  page: AppPage;

  id: string;
  type: ElemType;
  parentId: string | null;

  react: UnwrapNestedRefs<IPageElemReact>;

  constructor(
    page: AppPage,
    id: string,
    type: ElemType,
    parentId: string | null
  ) {
    this.page = page;

    this.id = id;
    this.type = type;
    this.parentId = parentId;

    this.react = reactive<IPageElemReact>({
      active: false,
      selected: false,

      index: -1,
    });
  }
}

export class PageElems {
  page: AppPage;

  get notes() {
    return this.page.notes;
  }
  get arrows() {
    return this.page.arrows;
  }

  constructor(page: AppPage) {
    this.page = page;
  }
}
