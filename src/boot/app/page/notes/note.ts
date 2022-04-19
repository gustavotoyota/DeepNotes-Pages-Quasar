import { SyncedText } from '@syncedstore/core';
import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { computed, ComputedRef, UnwrapRef, WritableComputedRef } from 'vue';
import { z } from 'zod';
import { ElemType, IElemReact } from '../elems/elem';
import { AppPage } from '../page';
import { Quill } from 'quill';
import { IRegionCollab, IRegionReact, PageRegion } from '../regions/region';

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

  editing: boolean;
  dragging: boolean;

  headQuill: Quill | null;
  bodyQuill: Quill | null;

  collapsed: ComputedRef<boolean>;
  locallyCollapsed: boolean;

  sizeProp: ComputedRef<NoteSizeProp>;

  autoWidth: ComputedRef<boolean>;
  domWidth: ComputedRef<string>;
  targetWidth: ComputedRef<string>;

  topSection: ComputedRef<NoteSection>;
  bottomSection: ComputedRef<NoteSection>;
  numSections: ComputedRef<number>;

  index: number;

  worldSize: Vec2;
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
          return this._parent;
        },
        set: (val) => {
          this._parent = val;
        },
      }),

      editing: false,
      dragging: false,

      headQuill: null,
      bodyQuill: null,

      collapsed: computed(() => {
        if (!this.collab.collapsing.enabled) {
          return false;
        }

        if (this.collab.collapsing.localCollapsing) {
          return this.react.locallyCollapsed;
        }

        return this.collab.collapsing.collapsed;
      }),
      locallyCollapsed: false,

      sizeProp: computed(() =>
        this.react.collapsed ? 'collapsed' : 'expanded'
      ),

      autoWidth: computed(() => {
        // Returns false if has fixed width parent with stretched vertical children

        if (
          this.react.parent != null &&
          !this.react.parent.react.autoWidth &&
          !this.react.parent.collab.container.horizontal &&
          this.react.parent.collab.container.stretchChildren
        )
          return false;

        // Returns false if has fixed width itself

        if (this.collab.width[this.react.sizeProp].endsWith('px')) return false;

        return true;
      }),
      targetWidth: computed(() => {
        return this.react.autoWidth ? 'auto' : '0px';
      }),
      domWidth: computed(() => {
        return 'test';
      }),

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
        if (this.react.collapsed) {
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

      noteIds: computed(() => this.collab.noteIds),
      arrowIds: computed(() => this.collab.arrowIds),

      notes: computed(() => this.page.notes.fromIds(this.react.noteIds)),
      arrows: computed(() => this.page.arrows.fromIds(this.react.arrowIds)),
    };

    Object.assign(this.react, react);
  }

  bringToTop() {
    if (this.collab.zIndex === this.page.react.collab.nextZIndex - 1) return;

    this.collab.zIndex = this.page.react.collab.nextZIndex++;
  }
}
