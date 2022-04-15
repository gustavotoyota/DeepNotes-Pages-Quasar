import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { computed, reactive } from 'vue';
import { Page } from '../page';

export interface ICameraReact {
  pos: IVec2;

  _zoom: number;
  zoom: number;

  lockPos: boolean;
  lockZoom: boolean;
}

export class PageCamera {
  page: Page;

  react: ICameraReact;

  constructor(page: Page) {
    this.page = page;

    this.react = reactive({
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
