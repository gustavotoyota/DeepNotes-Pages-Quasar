import { SyncedText } from '@syncedstore/core';
import { IVec2, Vec2 } from 'src/boot/static/vec2';
import { computed, ComputedRef, UnwrapRef, WritableComputedRef } from 'vue';
import { z } from 'zod';
import { ElemType, IElemReact } from '../elems/elems';
import { AppPage } from '../page';
import { Quill } from 'quill';
import { getDeep, setDeep } from 'src/boot/static/deep-access';
import { IRegionCollab, IRegionReact, PageRegion } from '../regions/region';

export const INoteCollabSize = z
  .object({
    expanded: z.string().optional(),
    collapsed: z.string().optional(),
  })
  .optional();
export type INoteCollabSize = z.infer<typeof INoteCollabSize>;

export const INoteCollabSection = z.object({
  height: INoteCollabSize,
});
export type INoteCollabSection = z.infer<typeof INoteCollabSection>;

export const INoteCollabTextSection = INoteCollabSection.extend({
  enabled: z.boolean().optional(),
  text: z.any() as z.ZodType<SyncedText>,
  wrap: z.boolean().optional(),
});
export type INoteCollabTextSection = z.infer<typeof INoteCollabTextSection>;

export const INoteCollab = IRegionCollab.extend({
  link: z.string().uuid().or(z.string().url()).nullable().optional(),

  anchor: IVec2.optional(),
  pos: IVec2,

  width: INoteCollabSize,

  head: INoteCollabTextSection,
  body: INoteCollabTextSection,

  container: INoteCollabSection.extend({
    enabled: z.boolean().optional(),

    horizontal: z.boolean().optional(),
    spatial: z.boolean().optional(),

    wrapChildren: z.boolean().optional(),
    stretchChildren: z.boolean().optional(),
  }).optional(),

  collapsing: z
    .object({
      enabled: z.boolean().optional(),
      collapsed: z.boolean().optional(),
      localCollapsing: z.boolean().optional(),
    })
    .optional(),

  movable: z.boolean().optional(),
  resizable: z.boolean().optional(),
  readOnly: z.boolean().optional(),

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

export interface INoteReact extends IRegionReact {
  parent: WritableComputedRef<PageNote | null>;

  editing: boolean;
  dragging: boolean;

  anchor: WritableComputedRef<IVec2>;

  head: {
    enabled: WritableComputedRef<boolean>;
    quill: Quill | null;
    collabHeight: INoteSize;
  };
  body: {
    enabled: WritableComputedRef<boolean>;
    quill: Quill | null;
    collabHeight: INoteSize;
  };
  container: {
    enabled: WritableComputedRef<boolean>;
    horizontal: WritableComputedRef<boolean>;
    spatial: WritableComputedRef<boolean>;
    wrapChildren: WritableComputedRef<boolean>;
    stretchChildren: WritableComputedRef<boolean>;
    collabHeight: INoteSize;
  };

  collapsing: {
    enabled: WritableComputedRef<boolean>;
    collapsed: WritableComputedRef<boolean>;
    localCollapsing: WritableComputedRef<boolean>;
    locallyCollapsed: boolean;
  };

  sizeProp: ComputedRef<NoteSizeProp>;

  collabWidth: INoteSize;
  autoWidth: ComputedRef<boolean>;
  domWidth: ComputedRef<string>;
  targetWidth: ComputedRef<string>;

  topSection: ComputedRef<NoteSection>;
  bottomSection: ComputedRef<NoteSection>;
  numSections: ComputedRef<number>;
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

    const mapCollab = (path: string[], defaultVal: () => any) => {
      return mapDeep(this.collab, path, defaultVal);
    };

    const makeSectionSize = (section: NoteSection) => {
      return {
        expanded: mapCollab([section, 'height', 'expanded'], () => 'auto'),
        collapsed: mapCollab([section, 'height', 'collapsed'], () => 'auto'),
      };
    };

    const makeTextSection = (section: NoteTextSection, defaultVal: boolean) => {
      return {
        enabled: mapCollab([section, 'enabled'], () => defaultVal),
        quill: null,
        collabHeight: makeSectionSize(section),
      };
    };

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

      anchor: mapCollab(['anchor'], () => new Vec2(0.5, 0.5)),

      head: makeTextSection('head', false),
      body: makeTextSection('body', true),
      container: {
        enabled: mapCollab(['container', 'enabled'], () => false),
        horizontal: mapCollab(['container', 'horizontal'], () => false),
        spatial: mapCollab(['container', 'spatial'], () => false),
        wrapChildren: mapCollab(['container', 'wrapChildren'], () => false),
        stretchChildren: mapCollab(
          ['container', 'stretchChildren'],
          () => true
        ),
        collabHeight: makeSectionSize('container'),
      },

      collapsing: {
        enabled: mapCollab(['collapsing', 'enabled'], () => false),
        collapsed: computed({
          get: () => {
            if (!this.react.collapsing.enabled) {
              return false;
            }

            if (this.react.collapsing.localCollapsing) {
              return this.react.collapsing.locallyCollapsed;
            }

            return this.collab.collapsing?.collapsed ?? false;
          },
          set: (val) => setDeep(this.collab, ['collapsing', 'collapsed'], val),
        }),
        localCollapsing: mapCollab(
          ['collapsing', 'localCollapsing'],
          () => false
        ),
        locallyCollapsed: false,
      },

      sizeProp: computed(() =>
        this.react.collapsing.collapsed ? 'collapsed' : 'expanded'
      ),

      collabWidth: {
        expanded: mapCollab(['width', 'expanded'], () => 'auto'),
        collapsed: mapCollab(['width', 'collapsed'], () => 'auto'),
      },
      autoWidth: computed(() => {
        // Returns false if has fixed width parent with stretched vertical children

        if (
          this.react.parent != null &&
          !this.react.parent.react.autoWidth &&
          !this.react.parent.react.container.horizontal &&
          this.react.parent.react.container.stretchChildren
        )
          return false;

        // Returns false if has fixed width itself

        if (this.react.collabWidth[this.react.sizeProp].endsWith('px'))
          return false;

        return true;
      }),
      targetWidth: computed(() => {
        return this.react.autoWidth ? 'auto' : '0px';
      }),
      domWidth: computed(() => {
        return 'test';
      }),

      topSection: computed(() => {
        if (this.react.head.enabled) {
          return 'head';
        } else if (this.react.body.enabled) {
          return 'body';
        } else if (this.react.container.enabled) {
          return 'container';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      bottomSection: computed(() => {
        if (this.react.collapsing.collapsed) {
          return this.react.topSection;
        } else if (this.react.container.enabled) {
          return 'container';
        } else if (this.react.body.enabled) {
          return 'body';
        } else if (this.react.head.enabled) {
          return 'head';
        } else {
          throw new Error('No sections enabled');
        }
      }),
      numSections: computed(() => {
        let numSections = 0;

        if (this.react.head.enabled) {
          ++numSections;
        }
        if (this.react.body.enabled) {
          ++numSections;
        }
        if (this.react.container.enabled) {
          ++numSections;
        }

        return numSections;
      }),

      noteIds: computed(() => this.collab.noteIds ?? []),
      arrowIds: computed(() => this.collab.arrowIds ?? []),

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

function mapDeep<T>(
  initialObj: any,
  path: string[],
  defaultVal: () => T
): WritableComputedRef<T> {
  return computed({
    get: () => getDeep(initialObj, path, defaultVal),
    set: (val: any) => setDeep(initialObj, path, val),
  });
}
