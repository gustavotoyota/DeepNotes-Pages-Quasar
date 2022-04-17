import { reactive } from 'vue';
import { ElemType, PageElem } from '../elems/elems';
import { AppPage } from '../page';

export class PageArrow extends PageElem {
  constructor(page: AppPage, id: string, parentId: string | null) {
    super(page, id, ElemType.ARROW, parentId);
  }
}

export class PageArrows {
  react: {
    map: Record<string, PageArrow>;
  };

  constructor() {
    this.react = reactive({
      map: {},
    });
  }
}
