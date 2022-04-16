import { reactive, UnwrapNestedRefs } from 'vue';
import { PageNote } from './note';

export interface IPageNotesReact {
  map: Record<string, PageNote>;
}

export class PageNotes {
  react: UnwrapNestedRefs<IPageNotesReact>;

  constructor() {
    this.react = reactive<IPageNotesReact>({
      map: {},
    });
  }
}
