import { Deferrer } from 'src/boot/static/defer';
import { reactive } from 'vue';
import { App } from '../app';
import { Factory } from '../composition-root';
import { PageArrows } from './arrows/arrows';
import { PageCamera } from './camera/camera';
import { PagePanning } from './camera/panning';
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
  app: App;

  id: string;

  react: IPageReact;

  notes: PageNotes;
  arrows: PageArrows;
  elems: PageElems;

  activeElem: PageActiveElem;
  activeRegion: PageActiveRegion;
  selection: PageSelection;

  camera: PageCamera;
  panning: PagePanning;

  pos: PagePos;
  rects!: PageRects;
  sizes: PageSizes;

  constructor(factory: Factory, app: App, id: string) {
    super();

    this.app = app;

    this.id = id;

    this.react = reactive({
      name: '',
    });

    this.notes = factory.makeNotes();
    this.arrows = factory.makeArrows();
    this.elems = factory.makeElems(this);

    this.activeElem = factory.makeActiveElem();
    this.activeRegion = factory.makeActiveRegion(this);
    this.selection = factory.makeSelection(this);

    this.camera = factory.makeCamera(this);
    this.panning = factory.makePanning(this);

    this.pos = factory.makePos(this);
    this.rects = factory.makeRects(this);
    this.sizes = factory.makeSizes(this);
  }
}
