import { refProp } from 'src/boot/static/vue';
import {
  computed,
  ComputedRef,
  shallowReactive,
  ShallowReactive,
  UnwrapRef,
} from 'vue';
import { AppPage } from '../page';
import { IArrowCollab, PageArrow } from './arrow';

export interface IArrowsReact {
  map: ShallowReactive<Record<string, PageArrow>>;

  collab: ComputedRef<Record<string, IArrowCollab>>;
}

export class PageArrows {
  page: AppPage;

  react: UnwrapRef<IArrowsReact>;

  constructor(page: AppPage) {
    this.page = page;

    this.react = refProp<IArrowsReact>(this, 'react', {
      map: shallowReactive({}),

      collab: computed(() => this.page.collab.store.arrows),
    });
  }

  fromId(arrowId: string): PageArrow | null {
    return this.react.map[arrowId] ?? null;
  }
  toId(arrow: PageArrow): string {
    return arrow.id;
  }

  fromIds(arrowIds: string[]): PageArrow[] {
    return arrowIds
      .map((arrowId) => this.react.map[arrowId])
      .filter((arrow) => arrow != null);
  }
  toIds(arrows: PageArrow[]): string[] {
    return arrows.map((arrow) => arrow.id);
  }
}
