import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { AppPage } from '../page';
import { NoteTextSection, PageNote } from './note';

export interface IEditingReact {
  noteId: string | null;

  note: ComputedRef<PageNote | null>;
  section?: NoteTextSection;
}

export class PageEditing {
  page: AppPage;

  react: UnwrapRef<IEditingReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp(this, 'react', {
      noteId: null,

      note: computed(() => this.page.notes.fromId(this.react.noteId)),
    });
  }

  start(note: PageNote, section?: NoteTextSection) {
    if (this.react.noteId === note.id) {
      return;
    }

    if (this.react.note != null) {
      this.stop();
    }

    if (note.collab.readOnly) {
      return;
    }

    this.react.noteId = note.id;

    if (section != null) {
      this.react.section = section;
    } else if (note.react.topSection !== 'container') {
      this.react.section = note.react.topSection;
    }

    note.react.editing = true;
  }

  stop() {
    if (this.react.note == null) {
      return;
    }

    this.react.note.react.editing = false;

    this.react.noteId = null;
  }
}
