import { Deferrer } from 'src/boot/static/defer';
import { refProp } from 'src/boot/static/vue';
import { computed, ComputedRef, UnwrapNestedRefs } from 'vue';
import { z } from 'zod';
import { DeepNotesApp } from '../app';
import { Factory } from '../../static/composition-root';
import { PageArrow, PageArrows } from './arrows/arrows';
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
import { PageCollab } from './collab';
import { PageNote } from './notes/note';

export const IPageCollab = IRegionCollab.extend({
  name: z.string(),

  nextZIndex: z.number(),
});
export type IPageCollab = z.infer<typeof IPageCollab>;

export interface IAppPageReact {
  name: string;

  loaded: boolean;

  collab: ComputedRef<IPageCollab>;

  notes: ComputedRef<PageNote[]>;
  arrows: ComputedRef<PageArrow[]>;
}

export class AppPage extends Deferrer {
  readonly app: DeepNotesApp;

  readonly id: string;

  react!: UnwrapNestedRefs<IAppPageReact>;

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
  readonly rects!: PageRects;
  readonly sizes: PageSizes;

  constructor(factory: Factory, app: DeepNotesApp, id: string) {
    super();

    this.app = app;

    this.id = id;

    refProp<IAppPageReact>(this, 'react', {
      name: '',

      loaded: true,

      collab: computed(() => this.collab.store.page),

      notes: computed(() =>
        this.notes.fromIds(this.react.collab.noteIds ?? [])
      ),
      arrows: computed(() =>
        this.arrows.fromIds(this.react.collab.arrowIds ?? [])
      ),
    });

    this.collab = factory.makeCollab(this);

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
