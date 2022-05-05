import { z } from 'zod';
import { IVec2 } from '../static/vec2';
import { DeepNotesApp } from './app';
import { INoteCollab } from './page/notes/note';
import { cloneDeep, pull } from 'lodash';
import { createSyncedText } from '../static/synced-store';
import { IArrowCollab } from './page/arrows/arrow';
import { useMainStore } from 'src/stores/main-store';
import { Op } from '../static/quill';
import { IRegionCollab } from './page/regions/region';

// Arrow

export const ISerialArrowEndpoint = z
  .object({
    noteIndex: z.number().nullable().default(null),
    pos: IVec2.default({ x: 0, y: 0 }),
  })
  .default({});

export const ISerialArrow = z.object({
  start: ISerialArrowEndpoint,
  end: ISerialArrowEndpoint,
});

// Note

export const ISerialTextSection = z.object({
  enabled: z.boolean(),
  value: Op.array().default([{ insert: '\n' }]),
  wrap: z.boolean().default(true),
  height: z
    .object({
      expanded: z.string().default('auto'),
      collapsed: z.string().default('auto'),
    })
    .default({}),
});

export interface ISerialNoteInput
  extends Omit<
      z.input<typeof INoteCollab>,
      'head' | 'body' | keyof z.input<typeof IRegionCollab> | 'zIndex'
    >,
    ISerialRegionInput {
  head?: z.input<typeof ISerialTextSection>;
  body?: z.input<typeof ISerialTextSection>;
}
export interface ISerialNoteOutput
  extends Omit<
      z.output<typeof INoteCollab>,
      'head' | 'body' | keyof z.output<typeof IRegionCollab> | 'zIndex'
    >,
    ISerialRegionOutput {
  head: z.output<typeof ISerialTextSection>;
  body: z.output<typeof ISerialTextSection>;
}

export const ISerialNote = z.lazy(() =>
  INoteCollab.omit({
    head: true,
    body: true,

    noteIds: true,
    arrowIds: true,

    zIndex: true,
  }).extend({
    head: ISerialTextSection.default({ enabled: true }),
    body: ISerialTextSection.default({ enabled: false }),

    notes: ISerialNote.array().default([]),
    arrows: ISerialArrow.array().default([]),
  })
) as z.ZodType<ISerialNoteOutput>;

// Region

export interface ISerialRegionInput {
  notes?: ISerialNoteInput[];
  arrows?: z.input<typeof ISerialArrow>[];
}
export interface ISerialRegionOutput {
  notes: ISerialNoteOutput[];
  arrows: z.output<typeof ISerialArrow>[];
}
export const ISerialRegion = z.lazy(() =>
  z.object({
    notes: ISerialNote.array().default([]),
    arrows: ISerialArrow.array().default([]),
  })
) as z.ZodType<ISerialRegionOutput, z.ZodTypeDef, ISerialRegionInput>;

export class AppSerialization {
  readonly app: DeepNotesApp;

  constructor(app: DeepNotesApp) {
    this.app = app;
  }

  serialize(container: z.output<typeof IRegionCollab>): ISerialRegionOutput {
    const serialRegion: ISerialRegionOutput = {
      notes: [],
      arrows: [],
    };

    const page = useMainStore().page;

    // Serialize notes

    const noteMap = new Map<string, number>();

    for (const note of page.notes.fromIds(container.noteIds)) {
      // Children

      const serialNote: Partial<ISerialNoteOutput> = this.serialize(
        note.collab
      );

      // Head and body

      serialNote.head = {
        enabled: note.collab.head.enabled,
        value: note.collab.head.value.toDelta(),
        wrap: note.collab.head.wrap,
        height: cloneDeep(note.collab.head.height),
      };
      serialNote.body = {
        enabled: note.collab.body.enabled,
        value: note.collab.body.value.toDelta(),
        wrap: note.collab.body.wrap,
        height: cloneDeep(note.collab.body.height),
      };

      // Rest of the properties

      const collabKeys = Object.keys(note.collab);
      pull(collabKeys, 'head', 'body', 'noteIds', 'arrowIds', 'zIndex');
      for (const collabKey of collabKeys) {
        // @ts-ignore
        serialNote[collabKey] = cloneDeep(note.collab[collabKey]);
      }

      noteMap.set(note.id, serialRegion.notes.length);

      serialRegion.notes.push(serialNote as ISerialNoteOutput);
    }

    // Serialize arrows

    for (const arrow of page.arrows.fromIds(container.arrowIds)) {
      const serialArrow: z.output<typeof ISerialArrow> = {
        start: {
          noteIndex: noteMap.get(arrow.collab.start.noteId ?? '') ?? null,
          pos: arrow.collab.start.pos,
        },
        end: {
          noteIndex: noteMap.get(arrow.collab.end.noteId ?? '') ?? null,
          pos: arrow.collab.end.pos,
        },
      };

      serialRegion.arrows.push(serialArrow);
    }

    return serialRegion;
  }

  private _deserializeAux(
    serialRegion: ISerialRegionOutput
  ): z.output<typeof IRegionCollab> {
    const page = useMainStore().page;

    const noteMap = new Map<number, string>();

    // Deserialize notes

    const noteIds = [];

    if (serialRegion.notes != null) {
      for (let i = 0; i < serialRegion.notes.length; i++) {
        const serialNote = serialRegion.notes[i];

        const noteCollab = {} as Partial<z.output<typeof INoteCollab>>;

        // Head and body

        noteCollab.head = {
          enabled: serialNote.head.enabled,
          value: createSyncedText(serialNote.head.value),
          wrap: serialNote.head.wrap,
          height: cloneDeep(serialNote.head.height),
        };
        noteCollab.body = {
          enabled: serialNote.body.enabled,
          value: createSyncedText(serialNote.body.value),
          wrap: serialNote.body.wrap,
          height: cloneDeep(serialNote.body.height),
        };

        // Rest of the keys

        const collabKeys = Object.keys(serialNote);
        pull(collabKeys, 'head', 'body', 'notes', 'arrows');

        for (const collabKey of collabKeys) {
          // @ts-ignore
          noteCollab[collabKey] = cloneDeep(serialNote[collabKey]);
        }

        noteCollab.zIndex = page.react.collab.nextZIndex++;

        // Children

        const deserializedChild = this._deserializeAux(serialNote);

        noteCollab.noteIds = deserializedChild.noteIds;
        noteCollab.arrowIds = deserializedChild.arrowIds;

        // Add note data to the store

        const noteId = crypto.randomUUID();

        page.notes.react.collab[noteId] = noteCollab as z.output<
          typeof INoteCollab
        >;

        noteMap.set(i, noteId);

        noteIds.push(noteId);
      }
    }

    // Deserialize arrows

    const arrowIds = [];

    if (serialRegion.arrows != null) {
      for (const serialArrow of serialRegion.arrows) {
        const arrowCollab: IArrowCollab = {
          start: {
            noteId: noteMap.get(serialArrow.start.noteIndex ?? -1) ?? null,
            pos: serialArrow.start.pos,
          },
          end: {
            noteId: noteMap.get(serialArrow.end.noteIndex ?? -1) ?? null,
            pos: serialArrow.end.pos,
          },
        };

        const arrowId = crypto.randomUUID();

        page.arrows.react.collab[arrowId] = arrowCollab as IArrowCollab;

        arrowIds.push(arrowId);
      }
    }

    return { noteIds, arrowIds };
  }
  deserialize(
    serialRegion: ISerialRegionInput,
    destRegion: z.output<typeof IRegionCollab>,
    destIndex?: number | null
  ): z.output<typeof IRegionCollab> {
    let result: z.output<typeof IRegionCollab> = { noteIds: [], arrowIds: [] };

    const parsedSerialRegion = ISerialRegion.parse(serialRegion);

    const mainStore = useMainStore();

    mainStore.page.collab.doc.transact(() => {
      result = this._deserializeAux(parsedSerialRegion);

      destIndex = destIndex ?? destRegion.noteIds.length;
      destRegion.noteIds.splice(destIndex, 0, ...result.noteIds);

      destRegion.arrowIds.push(...result.arrowIds);
    });

    return result;
  }
}
