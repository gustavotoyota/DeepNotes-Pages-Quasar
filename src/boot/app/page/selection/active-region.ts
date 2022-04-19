import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { PageArrow } from '../arrows/arrow';
import { PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';
import { PageRegion } from '../regions/region';

export interface IActiveRegionReact {
  id: string | null;

  region: ComputedRef<PageRegion>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
  elems: ComputedRef<PageElem[]>;
}

export class PageActiveRegion {
  readonly page: AppPage;

  react: UnwrapRef<IActiveRegionReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp(this, 'react', {
      id: null,

      region: computed(() => {
        if (this.react.id == null) {
          return this.page;
        } else {
          return this.page.notes.react.map[this.react.id];
        }
      }),

      noteIds: computed(() => this.react.region.react.noteIds),
      arrowIds: computed(() => this.react.region.react.arrowIds),

      notes: computed(() => this.react.region.react.notes),
      arrows: computed(() => this.react.region.react.arrows),
      elems: computed(() =>
        (this.react.notes as PageElem[]).concat(this.react.arrows)
      ),
    });
  }
}
