import { getYjsValue, SyncedArray, SyncedMap } from '@syncedstore/core';
import { Factory } from 'src/code/static/composition-root';
import { refProp } from 'src/code/static/vue';
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
  factory: Factory;
  page: AppPage;

  react: UnwrapRef<IArrowsReact>;

  constructor(factory: Factory, page: AppPage) {
    this.factory = factory;
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

  create(arrowId: string, parentId: string | null) {
    const collab = this.react.collab[arrowId];

    const arrow = this.factory.makeArrow(this.page, arrowId, parentId, collab);

    this.page.arrows.react.map[arrow.id] = arrow;
  }
  createAndObserveIds(arrowIds: string[], parentId: string | null) {
    for (const arrowId of arrowIds) this.create(arrowId, parentId);

    (getYjsValue(arrowIds) as SyncedArray<string>).observe((event) => {
      for (const delta of event.changes.delta) {
        if (delta.insert == null) continue;

        for (const arrowId of delta.insert) this.create(arrowId, parentId);
      }
    });
  }

  observeMap() {
    (getYjsValue(this.react.collab) as SyncedMap<IArrowCollab>).observe(
      (event) => {
        for (const [arrowId, change] of event.changes.keys) {
          if (change.action !== 'delete') {
            continue;
          }

          //const arrow = this.react.map[arrowId];

          const startNoteId = change.oldValue._map
            .get('start')
            .content.type._map.get('noteId').content.arr[0];

          if (startNoteId != null) {
            const note = this.page.notes.fromId(startNoteId);

            if (note != null) {
              //pull(note.outgoingArrows, arrow);
            }
          }

          const endNoteId = change.oldValue._map
            .get('end')
            .content.type._map.get('noteId').content.arr[0];

          if (endNoteId != null) {
            const note = this.page.notes.fromId(endNoteId);

            if (note != null) {
              // pull(note.incomingArrows, arrow);
            }
          }

          delete this.react.map[arrowId];
        }
      }
    );
  }
}
