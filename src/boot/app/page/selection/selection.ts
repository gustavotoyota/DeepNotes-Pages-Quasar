import { computed, ComputedRef, reactive, UnwrapNestedRefs } from 'vue';
import { PageElem } from '../elems/elems';
import { Page } from '../page';

export interface IPageSelectionReact {
  noteSet: Record<string, boolean>;
  arrowSet: Record<string, boolean>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;
}

export class PageSelection {
  page: Page;

  react: UnwrapNestedRefs<IPageSelectionReact>;

  constructor(page: Page) {
    this.page = page;

    this.react = reactive<IPageSelectionReact>({
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
