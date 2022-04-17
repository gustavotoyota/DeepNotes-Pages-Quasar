import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { refProp } from 'src/boot/static/vue';
import { computed, UnwrapNestedRefs, WritableComputedRef } from 'vue';
import { AppPage } from '../page';

export interface IPageCameraReact {
  pos: IVec2;

  _zoom: number;
  zoom: WritableComputedRef<number>;

  lockPos: boolean;
  lockZoom: boolean;
}

export class PageCamera {
  page: AppPage;

  react!: UnwrapNestedRefs<IPageCameraReact>;

  constructor(page: AppPage) {
    this.page = page;

    refProp<IPageCameraReact>(this, 'react', {
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
