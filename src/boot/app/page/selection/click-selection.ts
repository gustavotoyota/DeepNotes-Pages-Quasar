import { PageElem } from '../elems/elems';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export class PageClickSelection {
  page: AppPage;

  constructor(page: AppPage) {
    this.page = page;
  }

  perform(elem: PageElem, event: PointerEvent) {
    // Container shift-selection

    if (
      elem.parentId != null &&
      event.shiftKey &&
      this.page.activeElem.react.exists
    ) {
      const fromIndex = (this.page.activeElem.react.elem as PageNote).react
        .index;
      const toIndex = (elem as PageNote).react.index;

      const step = Math.sign(toIndex - fromIndex);

      for (let i = fromIndex; i !== toIndex; i += step)
        this.page.selection.add(this.page.activeRegion.react.notes[i]);
    }

    // Clear selection if not holding Ctrl or Shift
    // And the clicked element is not selected

    if (!event.ctrlKey && !event.shiftKey && !elem.react.selected)
      this.page.selection.clear(elem.parentId);

    // Remove element if selected and holding Ctrl
    // Else, just change the active element

    if (event.ctrlKey && elem.react.selected) this.page.selection.remove(elem);
    else this.page.activeElem.set(elem);
  }
}
