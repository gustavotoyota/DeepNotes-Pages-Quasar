import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapNestedRefs } from 'vue';
import { ElemType, PageElem } from '../elems/elems';
import { PageNote } from '../notes/note';
import { AppPage } from '../page';

export interface IPageActiveElemReact {
  id: string | null;
  type: ElemType | null;

  elem: ComputedRef<PageElem | null>;
  exists: ComputedRef<boolean>;
}

export class PageActiveElem {
  readonly page: AppPage;

  react!: UnwrapNestedRefs<IPageActiveElemReact>;

  constructor(page: AppPage) {
    this.page = page;

    refProp<IPageActiveElemReact>(this, 'react', {
      id: null,
      type: null,

      elem: computed((): PageElem | null => {
        if (this.react.id == null || this.react.type == null) {
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
      //elem.bringToTop();
    }
  }

  clear() {
    this.set(null);
  }
}
