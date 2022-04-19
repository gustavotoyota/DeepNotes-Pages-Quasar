import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapRef } from 'vue';
import { z } from 'zod';
import { DeepNotesApp } from '../app';
import { Factory } from '../../static/composition-root';
import { PageArrows } from './arrows/arrows';
import { PageCamera } from './camera/camera';
import { PagePanning } from './camera/panning';
import { PageZooming } from './camera/zooming';
import { ElemType } from './elems/elem';
import { PageNotes } from './notes/notes';
import { PageActiveElem } from './selection/active-elem';
import { PageActiveRegion } from './selection/active-region';
import { PageBoxSelection } from './selection/box-selection';
import { PageSelection } from './selection/selection';
import { PagePos } from './space/pos';
import { PageRects } from './space/rects';
import { PageSizes } from './space/sizes';
import { PageCollab } from './collab';
import { IRegionCollab, IRegionReact, PageRegion } from './regions/region';
import { PageElems } from './elems/elems';
import { encodeStateAsUpdateV2 } from 'yjs';

export interface IPageReference {
  id: string;
  name: string;
}

export const IPageCollab = IRegionCollab.extend({
  name: z.string(),

  nextZIndex: z.number(),
});
export type IPageCollab = z.infer<typeof IPageCollab>;

export interface IAppPageReact extends IRegionReact {
  name: string;

  loaded: boolean;

  collab: ComputedRef<IPageCollab>;

  size: number;
}

export class AppPage extends PageRegion {
  readonly app: DeepNotesApp;

  readonly id: string;

  declare react: UnwrapRef<IAppPageReact>;

  readonly collab: PageCollab;

  readonly notes: PageNotes;
  readonly arrows: PageArrows;
  readonly elems: PageElems;

  readonly selection: PageSelection;
  readonly activeElem: PageActiveElem;
  readonly activeRegion: PageActiveRegion;
  readonly boxSelection: PageBoxSelection;

  readonly camera: PageCamera;
  readonly panning: PagePanning;
  readonly zooming: PageZooming;

  readonly pos: PagePos;
  readonly rects: PageRects;
  readonly sizes: PageSizes;

  constructor(factory: Factory, app: DeepNotesApp, id: string) {
    super(null as any, id, ElemType.PAGE, null);

    this.app = app;

    this.id = id;

    this.react = refProp<IAppPageReact>(this, 'react', {
      // Page

      name: '',

      loaded: false,

      collab: computed(() => this.collab.store.page),

      size: 0,

      // Elem

      active: false,
      selected: false,

      // Region

      noteIds: computed(() => {
        console.log('asd');
        return this.react.collab.noteIds;
      }),
      arrowIds: computed(() => this.react.collab.arrowIds),

      notes: computed(() => this.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.arrows.fromIds(this.react.arrowIds)),
    });

    this.collab = factory.makeCollab(this);

    this.notes = factory.makeNotes(this);
    this.arrows = factory.makeArrows(this);
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

  postSync() {
    this.elems.setup();

    this.react.size = encodeStateAsUpdateV2(this.collab.doc).byteLength;

    this.react.loaded = true;
  }
}
