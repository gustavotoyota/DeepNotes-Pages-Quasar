import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { PageArrow } from '../arrows/arrow';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IActiveRegionReact {
  id: string | null;

  elem: ComputedRef<PageNote | null>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
}

export class PageActiveRegion {
  readonly page: AppPage;

  react: UnwrapRef<IActiveRegionReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp(this, 'react', {
      id: null,

      elem: computed(() => {
        if (this.react.id == null) {
          return null;
        } else {
          return this.page.notes.react.map[this.react.id];
        }
      }),

      noteIds: computed(() => this.react.elem?.react.noteIds ?? []),
      arrowIds: computed(() => this.react.elem?.react.arrowIds ?? []),

      notes: computed(() => this.page.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.page.arrows.fromIds(this.react.arrowIds)),
    });
  }
}
