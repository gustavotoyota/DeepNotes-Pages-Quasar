import { Deferrer } from 'src/boot/static/defer';
import { refProp } from 'src/boot/static/vue';
import { UnwrapNestedRefs } from 'vue';
import { z } from 'zod';
import { DeepNotesApp } from '../app';
import { Factory } from '../composition-root';
import { PageArrows } from './arrows/arrows';
import { PageCamera } from './camera/camera';
import { PagePanning } from './camera/panning';
import { PageZooming } from './camera/zooming';
import { PageElems } from './elems/elems';
import { PageNotes } from './notes/notes';
import { IRegionCollab } from './regions';
import { PageActiveElem } from './selection/active-elem';
import { PageActiveRegion } from './selection/active-region';
import { PageBoxSelection } from './selection/box-selection';
import { PageSelection } from './selection/selection';
import { PagePos } from './space/pos';
import { PageRects } from './space/rects';
import { PageSizes } from './space/sizes';

export const IPageCollab = IRegionCollab.extend({
  name: z.string(),

  nextZIndex: z.number(),
});
export type IPageCollab = z.infer<typeof IPageCollab>;

export interface IAppPageReact {
  name: string;

  loaded: boolean;
}

export class AppPage extends Deferrer {
  app: DeepNotesApp;

  id: string;

  react!: UnwrapNestedRefs<IAppPageReact>;

  notes: PageNotes;
  arrows: PageArrows;
  elems: PageElems;

  selection: PageSelection;
  activeElem: PageActiveElem;
  activeRegion: PageActiveRegion;
  boxSelection: PageBoxSelection;

  camera: PageCamera;
  panning: PagePanning;
  zooming: PageZooming;

  pos: PagePos;
  rects!: PageRects;
  sizes: PageSizes;

  constructor(factory: Factory, app: DeepNotesApp, id: string) {
    super();

    this.app = app;

    this.id = id;

    refProp<IAppPageReact>(this, 'react', { name: '', loaded: true });

    this.notes = factory.makeNotes();
    this.arrows = factory.makeArrows();
    this.elems = factory.makeElems(this);

    this.selection = factory.makeSelection(this);
    this.activeElem = factory.makeActiveElem(this);
    this.activeRegion = factory.makeActiveRegion(this);
    this.boxSelection = factory.makeBoxSelection(this);

    this.camera = factory.makeCamera(this);
    this.panning = factory.makePanning(this);
    this.zooming = factory.makeZooming(this);

    this.pos = factory.makePos(this);
    this.rects = factory.makeRects(this);
    this.sizes = factory.makeSizes(this);
  }
}
