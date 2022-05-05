import { nextTick } from 'vue';

import { AppPage } from '../page';
import { PageNote } from './note';

export class PageDropping {
  page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  perform(regionNote: PageNote, dropIndex: number) {
    const selectedNotes = this.page.selection.react.notes.slice();

    selectedNotes.sort(
      (a: PageNote, b: PageNote) => b.react.index - a.react.index
    );

    this.page.collab.doc.transact(() => {
      for (const selectedNote of selectedNotes) {
        selectedNote.removeFromRegion();

        regionNote.collab.noteIds.splice(dropIndex++, 0, selectedNote.id);

        selectedNote.parentId = regionNote.id;
      }
    });

    this.page.activeRegion.react.id = regionNote.id;

    nextTick(() => {
      const lastSelectedNote = this.page.selection.react.notes.at(-1)!;

      lastSelectedNote.scrollIntoView();
    });

    this.page.dragging.cancel();
  }
}
