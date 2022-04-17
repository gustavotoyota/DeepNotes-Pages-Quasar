import { computed, reactive } from 'vue';
import { PageElem } from '../elems/elems';
import { AppPage } from '../page';

export class PageSelection {
  page: AppPage;

  react: {
    noteSet: Record<string, boolean>;
    arrowSet: Record<string, boolean>;

    noteIds: string[];
    arrowIds: string[];
  };

  constructor(page: AppPage) {
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
