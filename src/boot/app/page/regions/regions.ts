import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export class PageRegions {
  page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  getNoteIds(note: PageNote): string[] {
    if (note == null) {
      return this.page.react.noteIds;
    } else {
      return note.react.noteIds;
    }
  }
  getArrowIds(note: PageNote): string[] {
    if (note == null) {
      return this.page.react.arrowIds;
    } else {
      return note.react.arrowIds;
    }
  }
}
