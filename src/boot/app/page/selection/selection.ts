import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { PageArrow } from '../arrows/arrow';
import { ElemType, PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IPageSelectionReact {
  noteSet: Record<string, boolean>;
  arrowSet: Record<string, boolean>;

  noteIds: ComputedRef<string[]>;
  arrowIds: ComputedRef<string[]>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
  elems: ComputedRef<PageElem[]>;
}

export class PageSelection {
  readonly page: AppPage;

  react: UnwrapRef<IPageSelectionReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IPageSelectionReact>(this, 'react', {
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

  has(elem: PageElem): boolean {
    if (elem.type === ElemType.PAGE) {
      return false;
    }

    return elem.id in this.react[`${elem.type}Set`];
  }

  clear(activeRegionId?: string | null) {
    for (const elem of this.react.elems) {
      this.remove(elem);
    }

    this.react.noteSet = {};
    this.react.arrowSet = {};

    this.page.activeElem.clear();

    if (activeRegionId !== undefined) {
      this.page.activeRegion.react.id = activeRegionId;
    }
  }

  add(...elems: PageElem[]) {
    for (const elem of elems) {
      if (elem.react.selected || elem.type === ElemType.PAGE) {
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
      if (!elem.react.selected || elem.type === ElemType.PAGE) {
        continue;
      }

      elem.react.selected = false;
      delete this.react[`${elem.type}Set`][elem.id];

      if (elem.react.active) {
        this.page.activeElem.set(this.react.elems.at(-1) ?? null);
      }
    }
  }

  set(...elems: PageElem[]) {
    this.clear();
    this.add(...elems);
  }

  selectAll() {
    for (const elem of this.page.activeRegion.react.elems) {
      this.add(elem);
    }
  }

  shift(shiftX: number, shiftY: number) {
    this.page.collab.doc.transact(() => {
      for (const note of this.react.notes) {
        note.react.pos.x += shiftX;
        note.react.pos.y += shiftY;
      }
    });
  }
}
