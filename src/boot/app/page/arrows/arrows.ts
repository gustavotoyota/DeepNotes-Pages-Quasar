import { refProp } from 'src/boot/static/vue';
import { shallowReactive, ShallowReactive, UnwrapRef } from 'vue';
import { PageArrow } from './arrow';

export interface IArrowsReact {
  map: ShallowReactive<Record<string, PageArrow>>;
}

export class PageArrows {
  react: UnwrapRef<IArrowsReact>;

  constructor() {
    this.react = refProp<IArrowsReact>(this, 'react', {
      map: shallowReactive({}),
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
