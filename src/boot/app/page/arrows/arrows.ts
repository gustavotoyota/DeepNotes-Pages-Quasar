import { reactive } from 'vue';
import { ElemType, PageElem } from '../elems/elems';
import { Page } from '../page';

export class PageArrow extends PageElem {
  constructor(page: Page, id: string, parentId: string | null) {
    super({
      id,
      type: ElemType.ARROW,
      parentId,
      activeElem: page.activeElem,
      selection: page.selection,
    });
  }
}

export interface IPageArrowsReact {
  map: Record<string, PageArrow>;
}

export class PageArrows {
  react: IPageArrowsReact;

  constructor() {
    this.react = reactive({
      map: {},
    });
  }
}
