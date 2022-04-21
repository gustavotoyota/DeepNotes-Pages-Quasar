import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { PageArrow } from '../arrows/arrow';
import { ElemType, PageElem } from '../elems/elem';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IPageActiveElemReact {
  id: string | null;
  type: ElemType;

  elem: ComputedRef<PageElem | null>;

  note: ComputedRef<PageNote | null>;
  arrow: ComputedRef<PageArrow | null>;

  exists: ComputedRef<boolean>;
}

export class PageActiveElem {
  readonly page: AppPage;

  react: UnwrapRef<IPageActiveElemReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IPageActiveElemReact>(this, 'react', {
      id: null,
      type: ElemType.PAGE,

      elem: computed((): PageElem | null => {
        if (this.react.id == null || this.react.type === ElemType.PAGE) {
          return null;
        }

        const elems = this.page[`${this.react.type}s`];
        const activeElem = elems.react.map[this.react.id] ?? null;

        if (
          activeElem == null ||
          activeElem.parentId != this.page.activeRegion.react.id
        )
          return null;

        return activeElem;
      }),

      note: computed(() => {
        if (this.react.elem instanceof PageNote) {
          return this.react.elem;
        } else {
          return null;
        }
      }),
      arrow: computed(() => {
        if (this.react.elem instanceof PageArrow) {
          return this.react.elem;
        } else {
          return null;
        }
      }),

      exists: computed(() => this.react.elem != null),
    });
  }

  is(elemId: string) {
    return elemId === this.react.id;
  }

  set(elem: PageElem | null) {
    if (elem?.id == this.react.id) {
      return;
    }

    if (this.react.elem != null) {
      this.react.elem.react.active = false;
    }

    this.react.id = elem?.id ?? null;
    this.react.type = elem?.type ?? ElemType.NOTE;

    if (elem == null) {
      return;
    }

    elem.react.active = true;

    this.page.selection.add(elem);

    if (elem instanceof PageNote) {
      elem.bringToTop();
    }
  }

  clear() {
    this.set(null);
  }
}
