import { SyncedText } from '@syncedstore/core';
import { IVec2, Vec2 } from 'src/boot/static/vec2';
import {
  computed,
  ComputedRef,
  UnwrapNestedRefs,
  WritableComputedRef,
} from 'vue';
import { z } from 'zod';
import { ElemType, IElemReact, PageElem } from '../elems/elems';
import { Page } from '../page';
import { IRegionCollab } from '../regions';
import { Quill } from 'quill';
import { getValue, setValue } from 'src/boot/static/dyn-access';

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

export interface INoteReact extends IElemReact {
  editing: boolean;
  dragging: boolean;

  anchor: WritableComputedRef<IVec2>;

  collabWidth: INoteSize;
  domWidth: ComputedRef<string>;

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

  topSection: ComputedRef<NoteSection>;
  bottomSection: ComputedRef<NoteSection>;
  numSections: ComputedRef<number>;
}

function mapValue<T>(
  initialObj: any,
  path: string[],
  defaultVal: T
): WritableComputedRef<T> {
  return computed({
    get: () => getValue(initialObj, path, defaultVal),
    set: (val: any) => setValue(initialObj, path, val),
  });
}

export class PageNote extends PageElem {
  collab: INoteCollab;

  declare react: UnwrapNestedRefs<INoteReact>;

  constructor(
    page: Page,
    id: string,
    parentId: string | null,
    collab: INoteCollab
  ) {
    super(page, id, ElemType.NOTE, parentId);

    this.collab = collab;

    const mapCollab = (path: string[], defaultVal: any) => {
      return mapValue(this.collab, path, defaultVal);
    };

    const makeSectionSize = (section: NoteSection) => {
      return {
        expanded: mapCollab([section, 'height', 'expanded'], 'auto'),
        collapsed: mapCollab([section, 'height', 'collapsed'], 'auto'),
      };
    };

    const makeTextSection = (section: NoteTextSection) => {
      return {
        enabled: mapCollab([section, 'enabled'], false),
        quill: null,
        collabHeight: makeSectionSize(section),
      };
    };

    const react: Omit<INoteReact, keyof IElemReact> = {
      editing: false,
      dragging: false,

      anchor: mapCollab(['anchor'], new Vec2(0.5, 0.5)),

      head: makeTextSection('head'),
      body: makeTextSection('body'),
      container: {
        enabled: mapCollab(['container', 'enabled'], false),
        horizontal: mapCollab(['container', 'horizontal'], false),
        spatial: mapCollab(['container', 'spatial'], false),
        wrapChildren: mapCollab(['container', 'wrapChildren'], false),
        stretchChildren: mapCollab(['container', 'stretchChildren'], true),
        collabHeight: makeSectionSize('container'),
      },

      collapsing: {
        enabled: mapCollab(['collapsing', 'enabled'], false),
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
          set: (val) => setValue(this.collab, ['collapsing', 'collapsed'], val),
        }),
        localCollapsing: mapCollab(['collapsing', 'localCollapsing'], false),
        locallyCollapsed: false,
      },

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

      collabWidth: {
        expanded: computed(() => this.collab.width?.expanded ?? ''),
        collapsed: computed(() => this.collab.width?.collapsed ?? ''),
      },
      domWidth: computed(() => {
        return 'asd';
      }),
    };

    Object.assign(this.react, react);
  }
}
