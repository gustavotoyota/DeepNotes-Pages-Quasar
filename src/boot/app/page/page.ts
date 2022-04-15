import { AxiosInstance } from 'axios';
import { createDeferrerEnv } from 'src/boot/static/defer';
import { reactive } from 'vue';
import { Factory } from '../composition-root';
import { PageCamera } from './camera/camera';
import { PageElems } from './elems/elems';
import { PageActiveElem } from './selection/active-elem';
import { PageSelection } from './selection/selection';
import { PagePos } from './space/pos';
import { PageRects } from './space/rects';
import { PageSizes } from './space/sizes';

export interface IPageReact {
  name: string;
}

export class Page {
  id: string;

  react: IPageReact;

  elems: PageElems;

  activeElem: PageActiveElem;
  selection: PageSelection;

  camera: PageCamera;

  pos: PagePos;
  rects: PageRects;
  sizes: PageSizes;

  constructor(factory: Factory, params: { id: string; axios: AxiosInstance }) {
    this.id = params.id;

    this.react = reactive({
      name: '',
    });

    createDeferrerEnv(this, function () {
      this.elems = factory.makeElems();

      this.activeElem = factory.makeActiveElem();
      this.selection = factory.makeSelection(this.elems);

      this.camera = factory.makeCamera(params.axios);

      this.pos = factory.makePos(this.rects, this.camera);
      this.rects = factory.makeRects(this.pos);
      this.sizes = factory.makeSizes(this.camera);
    });
  }
}
