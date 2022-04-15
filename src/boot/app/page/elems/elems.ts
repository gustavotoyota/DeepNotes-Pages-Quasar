import { reactive } from 'vue';
import { Page } from '../page';
import { PageActiveElem } from '../selection/active-elem';
import { PageSelection } from '../selection/selection';

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
  id: string;
  type: ElemType;
  parentId: string | null;

  activeElem: PageActiveElem;
  selection: PageSelection;

  react: IElemReact;

  constructor(params: {
    id: string;
    type: ElemType;
    parentId: string | null;
    activeElem: PageActiveElem;
    selection: PageSelection;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.parentId = params.parentId;

    this.activeElem = params.activeElem;
    this.selection = params.selection;

    this.react = reactive({
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
