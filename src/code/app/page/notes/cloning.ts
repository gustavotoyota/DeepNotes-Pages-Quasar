import { nextTick } from 'vue';

import { PageElem } from '../elems/elem';
import { AppPage } from '../page';

export class PageCloning {
  page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  perform() {
    // Serialize selection

    const serialRegion = this.page.app.serialization.serialize(
      this.page.selection.react
    );

    // Deserialize into structure

    let destIndex;
    if (this.page.selection.react.notes.length > 0)
      destIndex = this.page.selection.react.notes.at(-1)!.react.index + 1;

    const { noteIds, arrowIds } = this.page.app.serialization.deserialize(
      serialRegion,
      this.page.activeRegion.react,
      destIndex
    );

    // Select and reposition clones

    const notes = this.page.notes.fromIds(noteIds);
    const arrows = this.page.arrows.fromIds(arrowIds);

    this.page.selection.set(...(notes as PageElem[]).concat(arrows));

    if (this.page.activeRegion.react.id == null) {
      this.page.collab.doc.transact(() => {
        for (const note of notes) {
          note.collab.pos.x += 8;
          note.collab.pos.y += 8;
        }
      });
    }

    // Scroll into view

    if (this.page.selection.react.notes.length > 0) {
      nextTick(() => {
        const lastSelectedNote = this.page.selection.react.notes.at(-1)!;

        lastSelectedNote.scrollIntoView();
      });
    }
  }
}
