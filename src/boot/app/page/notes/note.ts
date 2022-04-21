import { SyncedText } from '@syncedstore/core';
import 'src/boot/external/highlight';
import Quill from 'quill';
import { Rect } from 'src/boot/static/rect';
import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { computed, ComputedRef, UnwrapRef, WritableComputedRef } from 'vue';
import { z } from 'zod';
import { ElemType, IElemReact } from '../elems/elem';
import { AppPage } from '../page';
import { IRegionCollab, IRegionReact, PageRegion } from '../regions/region';
import { hasVertScrollbar } from 'src/boot/static/dom';

export const INoteCollabSize = z
  .object({
    expanded: z.string().default('auto'),
    collapsed: z.string().default('auto'),
  })
  .default({});
export type INoteCollabSize = z.infer<typeof INoteCollabSize>;

export const INoteCollabSection = z.object({
  height: INoteCollabSize,
});
export type INoteCollabSection = z.infer<typeof INoteCollabSection>;

export const INoteCollabTextSection = INoteCollabSection.extend({
  enabled: z.boolean(),
  value: z.any() as z.ZodType<SyncedText>,
  wrap: z.boolean().default(true),
});
export type INoteCollabTextSection = z.infer<typeof INoteCollabTextSection>;

export const INoteCollab = IRegionCollab.extend({
  link: z.string().uuid().or(z.string().url()).nullable().default(null),

  anchor: IVec2.default({ x: 0.5, y: 0.5 }),
  pos: IVec2.default({ x: 0, y: 0 }),

  width: INoteCollabSize,

  head: INoteCollabTextSection,
  body: INoteCollabTextSection,

  container: INoteCollabSection.extend({
    enabled: z.boolean().default(false),

    horizontal: z.boolean().default(false),
    spatial: z.boolean().default(false),

    wrapChildren: z.boolean().default(false),
    stretchChildren: z.boolean().default(true),
  }).default({}),

  collapsing: z
    .object({
      enabled: z.boolean().default(false),
      collapsed: z.boolean().default(false),
      localCollapsing: z.boolean().default(false),
    })
    .default({}),

  movable: z.boolean().default(true),
  resizable: z.boolean().default(true),
  readOnly: z.boolean().default(false),

  zIndex: z.number(),
});
export type INoteCollab = z.infer<typeof INoteCollab>;

export type NoteSection = 'head' | 'body' | 'container';
export type NoteTextSection = 'head' | 'body';

export interface INoteSize {
  expanded: WritableComputedRef<string>;
  collapsed: WritableComputedRef<string>;
}
export type NoteSizeProp = keyof INoteSize;

export interface INoteVec2React {
  x: WritableComputedRef<number>;
  y: WritableComputedRef<number>;
}

export interface INoteSectionReact {
  enabled: WritableComputedRef<boolean>;
  collabHeight: INoteSize;
}

export interface INoteTextSectionReact extends INoteSectionReact {
  wrap: WritableComputedRef<boolean>;
  quill: Quill | null;
}

export interface INoteReact extends IRegionReact {
  parent: WritableComputedRef<PageNote | null>;
  region: ComputedRef<PageRegion>;

  editing: boolean;
  dragging: boolean;

  head: {
    quill: Quill | null;
    visible: ComputedRef<boolean>;
    height: ComputedRef<string | undefined>;
  };
  body: {
    quill: Quill | null;
    visible: ComputedRef<boolean>;
    height: ComputedRef<string | undefined>;
  };
  container: {
    visible: ComputedRef<boolean>;
    height: ComputedRef<string | undefined>;
  };

  collapsing: {
    collapsed: WritableComputedRef<boolean>;
    locallyCollapsed: boolean;
  };

  sizeProp: ComputedRef<NoteSizeProp>;

  width: {
    controlled: ComputedRef<boolean>;
    min: ComputedRef<string | undefined>;
    dom: ComputedRef<string | undefined>;
    target: ComputedRef<string | undefined>;
  };

  topSection: ComputedRef<NoteSection>;
  bottomSection: ComputedRef<NoteSection>;
  numSections: ComputedRef<number>;

  index: number;

  worldSize: Vec2;
  worldRect: ComputedRef<Rect>;

  clientSize: ComputedRef<Vec2>;
  clientRect: ComputedRef<Rect>;
}

export class PageNote extends PageRegion {
  collab: INoteCollab;

  declare react: UnwrapRef<INoteReact>;

  private _parent: PageNote | null = null;

  constructor(
    page: AppPage,
    id: string,
    parentId: string | null,
    collab: INoteCollab
  ) {
    super(page, id, ElemType.NOTE, parentId);

    this.collab = collab;

    const react: Omit<INoteReact, keyof IElemReact> = {
      parent: computed({
        get: () => {
          return this.page.notes.fromId(parentId) ?? this._parent;
        },
        set: (val) => {
          this._parent = val;
        },
      }),
      region: computed(() => {
        if (this.react.parent == null) {
          return this.page;
        } else {
          return this.react.parent;
        }
      }),

      editing: false,
      dragging: page.dragging.react.active && this.react.selected,

      head: {
        quill: null,
        visible: computed(() => this.collab.head.enabled),
        height: computed(() => undefined),
      },
      body: {
        quill: null,
        visible: computed(
          () =>
            this.collab.body.enabled &&
            (!this.react.collapsing.collapsed ||
              this.react.topSection === 'body')
        ),
        height: computed(() => undefined),
      },
      container: {
        visible: computed(
          () =>
            this.collab.container.enabled &&
            (!this.react.collapsing.collapsed ||
              this.react.topSection === 'container')
        ),
        height: computed(() => undefined),
      },

      collapsing: {
        collapsed: computed({
          get: () => {
            if (!this.collab.collapsing.enabled) {
              return false;
            }

            if (this.collab.collapsing.localCollapsing) {
              return this.react.collapsing.locallyCollapsed;
            }

            return this.collab.collapsing.collapsed;
          },
          set: (val) => {
            if (this.collab.collapsing.localCollapsing) {
              this.react.collapsing.locallyCollapsed = val;
            } else {
              this.collab.collapsing.collapsed = val;
            }
          },
        }),
        locallyCollapsed: false,
      },

      sizeProp: computed(() =>
        this.react.collapsing.collapsed ? 'collapsed' : 'expanded'
      ),

      width: {
        controlled: computed(() => {
          // Returns true if has controlled width parent with stretched vertical children

          if (
            this.react.parent != null &&
            this.react.parent.react.width.controlled &&
            !this.react.parent.collab.container.horizontal &&
            this.react.parent.collab.container.stretchChildren
          )
            return true;

          // Returns true if has controlled width itself

          if (this.collab.width[this.react.sizeProp].endsWith('px'))
            return true;

          return false;
        }),
        min: computed(() => {
          if (
            !this.react.width.controlled &&
            this.collab.container.enabled &&
            this.react.notes.length === 0
          ) {
            return '130px';
          } else {
            return undefined;
          }
        }),
        dom: computed(() => {
          return undefined;
        }),
        target: computed(() => {
          return this.react.width.controlled ? '0px' : undefined;
        }),
      },

      topSection: computed(() => {
        if (this.collab.head.enabled) {
          return 'head';
        } else if (this.collab.body.enabled) {
          return 'body';
        } else if (this.collab.container.enabled) {
          return 'container';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      bottomSection: computed(() => {
        if (this.react.collapsing.collapsed) {
          return this.react.topSection;
        } else if (this.collab.container.enabled) {
          return 'container';
        } else if (this.collab.body.enabled) {
          return 'body';
        } else if (this.collab.head.enabled) {
          return 'head';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      numSections: computed(() => {
        let numSections = 0;

        if (this.collab.head.enabled) {
          ++numSections;
        }
        if (this.collab.body.enabled) {
          ++numSections;
        }
        if (this.collab.container.enabled) {
          ++numSections;
        }

        return numSections;
      }),

      index: -1,

      worldSize: new Vec2(0, 0),
      worldRect: computed(
        () =>
          new Rect(
            new Vec2(this.collab.pos).sub(
              new Vec2(this.collab.anchor).mul(this.react.worldSize)
            ),
            new Vec2(this.collab.pos).add(
              new Vec2(1)
                .sub(new Vec2(this.collab.anchor))
                .mul(this.react.worldSize)
            )
          )
      ),

      clientSize: computed(() =>
        this.page.pos.worldToClient(this.react.worldSize)
      ),
      clientRect: computed(() =>
        this.page.rects.worldToClient(this.react.worldRect)
      ),

      noteIds: computed(() => this.collab.noteIds),
      arrowIds: computed(() => this.collab.arrowIds),

      notes: computed(() => this.page.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.page.arrows.fromIds(this.react.arrowIds)),
    };

    Object.assign(this.react, react);
  }

  bringToTop() {
    if (this.collab.zIndex === this.page.react.collab.nextZIndex - 1) {
      return;
    }

    this.collab.zIndex = this.page.react.collab.nextZIndex++;
  }

  getNode(part: string | null): Element {
    if (part == null)
      return document.getElementById(`note-${this.id}`) as Element;
    else return document.querySelector(`#note-${this.id} .${part}`) as Element;
  }

  scrollIntoView() {
    if (this.parentId == null) return;

    const frameNode = this.getNode('note-frame');

    let auxNode = frameNode as Node;

    while (auxNode != null) {
      if (hasVertScrollbar(auxNode as HTMLElement)) break;

      auxNode = auxNode.parentNode as Node;
    }

    if (auxNode == null) return;

    frameNode.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }

  getClientRect(part: string) {
    const node = this.getNode(part);

    const domClientRect = node.getBoundingClientRect();

    return this.page.rects.fromDOM(domClientRect);
  }
  getDisplayRect(part: string) {
    return this.page.rects.clientToDisplay(this.getClientRect(part));
  }
  getWorldRect(part: string) {
    return this.page.rects.clientToWorld(this.getClientRect(part));
  }

  removeFromRegion() {
    this.react.region.react.noteIds.splice(this.react.index, 1);
  }
}
