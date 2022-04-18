import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapNestedRefs } from 'vue';
import { PageArrow } from '../arrows/arrows';
import { PageElem } from '../elems/elems';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IPageSelectionReact {
  noteSet: Record<string, boolean>;
  arrowSet: Record<string, boolean>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
  elems: ComputedRef<PageArrow[]>;
}

export class PageSelection {
  readonly page: AppPage;

  react!: UnwrapNestedRefs<IPageSelectionReact>;

  constructor(page: AppPage) {
    this.page = page;

    refProp<IPageSelectionReact>(this, 'react', {
      noteSet: {},
      arrowSet: {},

      noteIds: computed(() => Object.keys(this.react.noteSet)),
      arrowIds: computed(() => Object.keys(this.react.noteSet)),

      notes: computed(() => this.page.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.page.arrows.fromIds(this.react.arrowIds)),
      elems: computed(() =>
        (this.react.notes as PageElem[]).concat(this.react.arrows)
      ),
    });
  }

  has(elem: PageElem) {
    return elem.id in this.react[`${elem.type}Set`];
  }

  clear(activeRegionId?: string | null) {
    for (const elem of this.react.elems) this.remove(elem);

    this.react.noteSet = {};
    this.react.arrowSet = {};

    this.page.activeElem.clear();

    if (activeRegionId !== undefined)
      this.page.activeRegion.react.id = activeRegionId;
  }

  add(...elems: PageElem[]) {
    for (const elem of elems) {
      if (elem.react.selected) {
        continue;
      }

      if (elem.parentId != this.page.activeRegion.react.id) {
        this.clear(elem.parentId);
      }

      elem.react.selected = true;
      this.react[`${elem.type}Set`][elem.id] = true;

      if (!this.page.activeElem.react.exists) {
        this.page.activeElem.set(elem);
      }

      if (elem instanceof PageNote) {
        elem.bringToTop();
      }
    }
  }
  remove(...elems: PageElem[]) {
    for (const elem of elems) {
      if (!elem.react.selected) {
        continue;
      }

      elem.react.selected = false;
      delete this.react[`${elem.type}Set`][elem.id];

      if (elem.react.active) {
        this.page.activeElem.set(this.react.elems.at(-1) ?? null);
      }
    }
  }
}
