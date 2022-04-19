import { refProp } from 'src/boot/static/vue';
import { nextTick, ShallowRef, UnwrapRef } from 'vue';
import { PageElem } from '../elems/elem';
import { AppPage } from '../page';
import { NoteTextSection, PageNote } from './note';

export interface IEditingReact {
  note: ShallowRef<PageNote | null>;

  active: boolean;
}

export class AppEditing {
  page: AppPage;

  react: UnwrapRef<IEditingReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp(this, 'react', {
      note: null,

      active: false,
    });
  }

  start(note: PageNote, section?: NoteTextSection) {
    if (note.react.editing) {
      return;
    }

    if (note.collab.readOnly) {
      return;
    }

    this.react.note = note;
    note.react.editing = true;

    this.page.selection.set(note as PageElem);

    // Setup Quill

    nextTick(() => {
      for (const section of ['head', 'body'] as ('head' | 'body')[]) {
        const quill = note.react[section].quill;

        if (quill == null) {
          continue;
        }

        quill.enable(true);
        // @ts-ignore
        quill.history.clear();
      }

      if (note.react.topSection === 'container') {
        return;
      }

      section = section ?? note.react.topSection;
      const quill = note.react[section].quill;

      if (quill == null) {
        return;
      }

      quill.focus();
      quill.setSelection(0, 0);
      quill.setSelection(0, Infinity, 'user');
    });
  }

  stop() {
    if (this.react.note == null) {
      return;
    }

    for (const section of ['head', 'body'] as ('head' | 'body')[]) {
      const quill = this.react.note.react[section].quill;

      if (quill == null) {
        continue;
      }

      quill.enable(false);
      // @ts-ignore
      quill.setSelection(null);
      // @ts-ignore
      quill.theme.tooltip.hide();
    }

    this.react.note.react.editing = false;
    this.react.note = null;

    // Reset undo-redo capturing

    //this.page.undoRedo.resetCapturing();
  }
}
