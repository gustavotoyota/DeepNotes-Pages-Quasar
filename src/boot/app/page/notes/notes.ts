import { reactive } from 'vue';
import { ElemType, PageElem } from '../elems/elems';
import { Page } from '../page';

export class PageNote extends PageElem {
  constructor(page: Page, id: string, parentId: string | null) {
    super({
      id,
      type: ElemType.NOTE,
      parentId,
      activeElem: page.activeElem,
      selection: page.selection,
    });
  }
}

export interface IPageNotesReact {
  map: Record<string, PageNote>;
}

export class PageNotes {
  react: IPageNotesReact;

  constructor() {
    this.react = reactive({
      map: {},
    });
  }
}
