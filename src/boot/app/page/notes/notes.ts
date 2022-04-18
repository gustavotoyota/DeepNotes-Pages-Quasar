import { refProp } from 'src/boot/static/vue';
import { shallowReactive, ShallowReactive, UnwrapRef } from 'vue';
import { PageNote } from './note';

export interface INotesReact {
  map: ShallowReactive<Record<string, PageNote>>;
}

export class PageNotes {
  react: UnwrapRef<INotesReact>;

  constructor() {
    this.react = refProp<INotesReact>(this, 'react', {
      map: shallowReactive({}),
    });
  }

  fromId(noteId: string): PageNote | null {
    return this.react.map[noteId] ?? null;
  }
  toId(note: PageNote): string {
    return note.id;
  }

  fromIds(noteIds: string[]): PageNote[] {
    return noteIds
      .map((noteId) => this.react.map[noteId])
      .filter((note) => note != null);
  }
  toIds(notes: PageNote[]): string[] {
    return notes.map((note) => note.id);
  }
}
