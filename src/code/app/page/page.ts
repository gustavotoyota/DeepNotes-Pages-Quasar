import { refProp } from 'src/code/static/vue';
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
import { PageEditing } from './notes/editing';
import { PageClickSelection } from './selection/click-selection';
import { PageDragging } from './notes/dragging';
import { PageRegions } from './regions/regions';
import { PageCloning } from './notes/cloning';
import { PageDeleting } from './elems/deleting';
import { PageDropping } from './notes/dropping';
import { PageClipboard } from './elems/clipboard';
import { PageResizing } from './notes/resizing';

export interface IPageReference {
  id: string;
  name: string;
}

export const IPageCollab = IRegionCollab.extend({
  name: z.string(),

  nextZIndex: z.number(),
});
export type IPageCollab = z.output<typeof IPageCollab>;

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

  readonly pos: PagePos;
  readonly rects: PageRects;
  readonly sizes: PageSizes;

  readonly camera: PageCamera;
  readonly panning: PagePanning;
  readonly zooming: PageZooming;

  readonly selection: PageSelection;
  readonly activeElem: PageActiveElem;
  readonly activeRegion: PageActiveRegion;
  readonly clickSelection: PageClickSelection;
  readonly boxSelection: PageBoxSelection;

  readonly regions: PageRegions;

  readonly elems: PageElems;
  readonly deleting: PageDeleting;
  readonly clipboard: PageClipboard;

  readonly notes: PageNotes;
  readonly editing: PageEditing;
  readonly dragging: PageDragging;
  readonly dropping: PageDropping;
  readonly cloning: PageCloning;
  readonly resizing: PageResizing;

  readonly arrows: PageArrows;

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

      noteIds: computed(() => this.react.collab.noteIds),
      arrowIds: computed(() => this.react.collab.arrowIds),

      notes: computed(() => this.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.arrows.fromIds(this.react.arrowIds)),
    });

    this.collab = factory.makeCollab(this);

    this.pos = factory.makePos(this);
    this.rects = factory.makeRects(this);
    this.sizes = factory.makeSizes(this);

    this.camera = factory.makeCamera(this);
    this.panning = factory.makePanning(this);
    this.zooming = factory.makeZooming(this);

    this.selection = factory.makeSelection(this);
    this.activeElem = factory.makeActiveElem(this);
    this.activeRegion = factory.makeActiveRegion(this);
    this.clickSelection = factory.makeClickSelection(this);
    this.boxSelection = factory.makeBoxSelection(this);

    this.regions = factory.makeRegions(this);

    this.elems = factory.makeElems(this);
    this.deleting = factory.makeDeleting(this);
    this.clipboard = factory.makeClipboard(this);

    this.notes = factory.makeNotes(this);
    this.editing = factory.makeEditing(this);
    this.dragging = factory.makeDragging(this);
    this.dropping = factory.makeDropping(this);
    this.cloning = factory.makeCloning(this);
    this.resizing = factory.makeResizing(this);

    this.arrows = factory.makeArrows(this);
  }

  postSync() {
    if (this.collab.store.page.name == null) {
      this.collab.reset();
    }

    this.elems.setup();

    this.react.size = encodeStateAsUpdateV2(this.collab.doc).byteLength;

    this.react.loaded = true;
  }
}
