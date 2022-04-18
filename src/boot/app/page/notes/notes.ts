import { refProp } from 'src/boot/static/vue';
import {
  computed,
  ComputedRef,
  shallowReactive,
  ShallowReactive,
  UnwrapRef,
} from 'vue';
import { AppPage } from '../page';
import { INoteCollab, PageNote } from './note';

export interface INotesReact {
  map: ShallowReactive<Record<string, PageNote>>;

  collab: ComputedRef<Record<string, INoteCollab>>;
}

export class PageNotes {
  page: AppPage;

  react: UnwrapRef<INotesReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<INotesReact>(this, 'react', {
      map: shallowReactive({}),

      collab: computed(() => this.page.collab.store.notes),
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
