import { PageArrow } from '../arrows/arrow';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export class PageDeleting {
  page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  private _performAux(notes: PageNote[], arrows: PageArrow[] = []) {
    // Delete arrows

    // const arrowSet = new Set<PageArrow>(arrows)

    // for (const note of notes) {
    //   for (const arrow of note.incomingArrows)
    //     arrowSet.add(arrow)
    //   for (const arrow of note.outgoingArrows)
    //     arrowSet.add(arrow)
    //   for (const arrow of note.arrows)
    //     arrowSet.add(arrow)
    // }

    // const sortedArrows = Array.from(arrowSet).sort(
    //   (a: PageArrow, b: PageArrow) => b.index - a.index)

    // for (const arrow of sortedArrows) {
    //   arrow.removeFromRegion()
    //   Vue.delete(this.page.collab.store.arrows, arrow.id)
    // }

    // Delete notes

    notes.sort((a: PageNote, b: PageNote) => b.react.index - a.react.index);

    for (const note of notes) {
      this._performAux(note.react.notes);

      this.page.activeRegion.react.noteIds.splice(note.react.index, 1);

      delete this.page.collab.store.notes[note.id];
    }
  }
  perform() {
    this.page.collab.doc.transact(() => {
      this._performAux(
        this.page.selection.react.notes,
        this.page.selection.react.arrows
      );
    });

    this.page.selection.clear();

    //this.page.undoRedo.resetCapturing();
  }
}
