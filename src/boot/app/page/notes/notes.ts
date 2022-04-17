import { reactive } from 'vue';
import { PageNote } from './note';

export class PageNotes {
  react: {
    map: Record<string, PageNote>;
  };

  constructor() {
    this.react = reactive({
      map: {},
    });
  }
}
