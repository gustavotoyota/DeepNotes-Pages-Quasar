import { refProp } from 'src/boot/static/vue';
import { UnwrapNestedRefs } from 'vue';
import { PageNote } from './note';

export interface INotesReact {
  map: Record<string, PageNote>;
}

export class PageNotes {
  react!: UnwrapNestedRefs<INotesReact>;

  constructor() {
    refProp<INotesReact>(this, 'react', {
      map: {},
    });
  }
}
