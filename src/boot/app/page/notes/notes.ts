import { refProp } from 'src/boot/static/vue';
import { UnwrapNestedRefs } from 'vue';
import { PageNote } from './note';

export interface IPageNotesReact {
  map: Record<string, PageNote>;
}

export class PageNotes {
  react!: UnwrapNestedRefs<IPageNotesReact>;

  constructor() {
    refProp<IPageNotesReact>(this, 'react', {
      map: {},
    });
  }
}
