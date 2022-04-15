import { AxiosInstance } from 'axios';
import { Deferrer } from 'src/boot/static/defer';
import { reactive } from 'vue';
import { Factory } from '../composition-root';
import { PageArrows } from './arrows/arrows';
import { PageCamera } from './camera/camera';
import { PageElems } from './elems/elems';
import { PageNotes } from './notes/notes';
import { PageActiveElem } from './selection/active-elem';
import { PageActiveRegion } from './selection/active-region';
import { PageSelection } from './selection/selection';
import { PagePos } from './space/pos';
import { PageRects } from './space/rects';
import { PageSizes } from './space/sizes';

export interface IPageReact {
  name: string;
}

export class Page extends Deferrer {
  axios: AxiosInstance;

  id: string;

  react: IPageReact;

  notes: PageNotes;
  arrows: PageArrows;
  elems: PageElems;

  activeElem: PageActiveElem;
  activeRegion: PageActiveRegion;
  selection: PageSelection;

  camera: PageCamera;

  pos: PagePos;
  rects!: PageRects;
  sizes: PageSizes;

  constructor(factory: Factory, id: string, axios: AxiosInstance) {
    super();

    this.axios = axios;

    this.id = id;

    this.react = reactive({
      name: '',
    });

    this.notes = factory.makeNotes();
    this.arrows = factory.makeArrows();
    this.elems = factory.makeElems(this.notes, this.arrows);

    this.activeElem = factory.makeActiveElem();
    this.activeRegion = factory.makeActiveRegion(this);
    this.selection = factory.makeSelection(this.elems);

    this.camera = factory.makeCamera(this);

    this.pos = factory.makePos(this.rects, this.camera);
    this.rects = factory.makeRects(this.pos);
    this.sizes = factory.makeSizes(this.camera);
  }
}
