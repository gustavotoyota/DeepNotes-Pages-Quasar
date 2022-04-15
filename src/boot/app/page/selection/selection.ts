import { computed, reactive } from 'vue';
import { PageElem } from '../elems/elems';
import { Page } from '../page';

export interface IPageSelectionReact {
  noteSet: Record<string, boolean>;
  arrowSet: Record<string, boolean>;

  noteIds: string[];
  arrowIds: string[];
}

export class PageSelection {
  page: Page;

  react: IPageSelectionReact;

  constructor(page: Page) {
    this.page = page;

    this.react = reactive({
      noteSet: {},
      arrowSet: {},

      noteIds: computed(() => Object.keys(this.react.noteSet)),
      arrowIds: computed(() => Object.keys(this.react.noteSet)),
    });
  }

  has(elem: PageElem) {
    return elem.id in this.react[`${elem.type}Set`];
  }
}
