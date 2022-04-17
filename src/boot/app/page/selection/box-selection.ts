import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { reactive } from 'vue';
import { AppPage } from '../page';

export class PageBoxSelection {
  page: AppPage;

  react: {
    active: boolean;

    startPos: IVec2;
    endPos: IVec2;
  };

  constructor(page: AppPage) {
    this.page = page;

    this.react = reactive({
      active: false,

      startPos: new Vec2(),
      endPos: new Vec2(),
    });
  }
}
