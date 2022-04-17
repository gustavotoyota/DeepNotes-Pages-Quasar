import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapNestedRefs } from 'vue';
import { PageElem } from '../elems/elems';
import { AppPage } from '../page';

export interface IPageSelectionReact {
  noteSet: Record<string, boolean>;
  arrowSet: Record<string, boolean>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;
}

export class PageSelection {
  page: AppPage;

  react!: UnwrapNestedRefs<IPageSelectionReact>;

  constructor(page: AppPage) {
    this.page = page;

    refProp<IPageSelectionReact>(this, 'react', {
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
