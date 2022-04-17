import { refProp } from 'src/boot/static/vue';
import { UnwrapNestedRefs } from 'vue';
import { ElemType, PageElem } from '../elems/elems';
import { AppPage } from '../page';

export class PageArrow extends PageElem {
  constructor(page: AppPage, id: string, parentId: string | null) {
    super(page, id, ElemType.ARROW, parentId);
  }
}

export interface IPageArrowsReact {
  map: Record<string, PageArrow>;
}

export class PageArrows {
  react!: UnwrapNestedRefs<IPageArrowsReact>;

  constructor() {
    refProp<IPageArrowsReact>(this, 'react', {
      map: {},
    });
  }
}
