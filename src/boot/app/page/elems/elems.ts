import { AppPage } from '../page';

export class PageElems {
  readonly page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  setup() {
    this.page.notes.createAndObserveIds(this.page.react.collab.noteIds, null);
    this.page.notes.observeMap();

    this.page.arrows.createAndObserveIds(this.page.react.collab.arrowIds, null);
    this.page.arrows.observeMap();
  }
}
