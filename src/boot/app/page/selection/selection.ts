import { computed, reactive } from 'vue';
import { PageElem, PageElems } from '../elems/elems';

export interface IPageSelectionReact {
  noteSet: Record<string, boolean>;
  arrowSet: Record<string, boolean>;

  noteIds: string[];
  arrowIds: string[];
}

export class PageSelection {
  elems: PageElems;

  react: IPageSelectionReact;

  constructor(elems: PageElems) {
    this.elems = elems;

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
