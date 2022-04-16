import { reactive, UnwrapNestedRefs } from 'vue';
import { ElemType, PageElem } from '../elems/elems';
import { Page } from '../page';

export class PageArrow extends PageElem {
  constructor(page: Page, id: string, parentId: string | null) {
    super(page, id, ElemType.ARROW, parentId);
  }
}

export interface IPageArrowsReact {
  map: Record<string, PageArrow>;
}

export class PageArrows {
  react: UnwrapNestedRefs<IPageArrowsReact>;

  constructor() {
    this.react = reactive<IPageArrowsReact>({
      map: {},
    });
  }
}
