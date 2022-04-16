import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { computed, reactive, UnwrapNestedRefs, WritableComputedRef } from 'vue';
import { Page } from '../page';

export interface ICameraReact {
  pos: IVec2;

  _zoom: number;
  zoom: WritableComputedRef<number>;

  lockPos: boolean;
  lockZoom: boolean;
}

export class PageCamera {
  page: Page;

  react: UnwrapNestedRefs<ICameraReact>;

  constructor(page: Page) {
    this.page = page;

    this.react = reactive<ICameraReact>({
      pos: new Vec2(),

      _zoom: 1,
      zoom: computed({
        get: () => this.react._zoom,
        set: (value) => {
          if (this.react.lockZoom) return;

          this.react._zoom = value;
        },
      }),

      lockPos: false,
      lockZoom: false,
    });
  }

  resetZoom() {
    this.react._zoom = 1;
  }
}
