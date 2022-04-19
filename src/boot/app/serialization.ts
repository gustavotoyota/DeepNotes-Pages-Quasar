import { z } from 'zod';
import { IVec2 } from '../static/vec2';
import { DeepNotesApp } from './app';
import { INoteCollab } from './page/notes/note';
import { IRegionCollab } from './page/regions/region';
import { cloneDeep, pull } from 'lodash';
import { createText } from '../static/synced-store';
import { v4 } from 'uuid';
import { IArrowCollab } from './page/arrows/arrow';
import { useMainStore } from 'src/stores/main-store';
import { Op } from '../static/quill';

// Arrow

export const ISerialArrowEndpoint = z.object({
  noteIndex: z.number().optional(),
  pos: IVec2.optional(),
});
export type ISerialArrowEndpoint = z.infer<typeof ISerialArrowEndpoint>;

export const ISerialArrow = z.object({
  start: ISerialArrowEndpoint,
  end: ISerialArrowEndpoint,
});
export type ISerialArrow = z.infer<typeof ISerialArrow>;

// Note

export const ISerialTextSection = z.object({
  enabled: z.boolean().optional(),
  value: Op.array().default([{ insert: '\n' }]),
  wrap: z.boolean().optional(),
});
export type ISerialTextSection = z.infer<typeof ISerialTextSection>;

export interface ISerialNote
  extends Omit<INoteCollab, 'head' | 'body' | keyof IRegionCollab | 'zIndex'>,
    ISerialRegion {
  head: ISerialTextSection;
  body: ISerialTextSection;
}
export const ISerialNote = z.lazy(() =>
  INoteCollab.omit({
    head: true,
    body: true,

    noteIds: true,
    arrowIds: true,

    zIndex: true,
  }).extend({
    head: ISerialTextSection,
    body: ISerialTextSection,

    notes: ISerialNote.array().optional(),
    arrows: ISerialArrow.array().optional(),
  })
) as z.ZodType<ISerialNote>;

// Region

export interface ISerialRegion {
  notes?: ISerialNote[];
  arrows?: ISerialArrow[];
}
export const ISerialRegion = z.lazy(() =>
  z.object({
    notes: ISerialNote.array().optional(),
    arrows: ISerialArrow.array().optional(),
  })
) as z.ZodType<ISerialRegion>;

export class AppSerialization {
  readonly app: DeepNotesApp;

  constructor(app: DeepNotesApp) {
    this.app = app;
  }

  serialize(container: IRegionCollab): ISerialRegion {
    const serialRegion: ISerialRegion = {};

    const mainStore = useMainStore();

    // Serialize notes

    const noteMap = new Map<string, number>();

    serialRegion.notes = [];

    for (const note of mainStore.currentPage.notes.fromIds(container.noteIds)) {
      // Children

      const serialNote: Partial<ISerialNote> = this.serialize(note.collab);

      // Head and body

      serialNote.head = {
        enabled: note.collab.head.enabled,
        value: note.collab.head.value.toDelta(),
        wrap: note.collab.head.wrap,
      };
      serialNote.body = {
        enabled: note.collab.body.enabled,
        value: note.collab.body.value.toDelta(),
        wrap: note.collab.body.wrap,
      };

      // Rest of the properties

      const collabKeys = Object.keys(note.collab);
      pull(collabKeys, 'head', 'body', 'noteIds', 'arrowIds', 'zIndex');
      for (const collabKey of collabKeys) {
        // @ts-ignore
        serialNote[collabKey] = cloneDeep(note.collab[collabKey]);
      }

      noteMap.set(note.id, serialRegion.notes.length);

      serialRegion.notes.push(serialNote as ISerialNote);
    }

    if (serialRegion.notes.length === 0) {
      delete serialRegion.notes;
    }

    // Serialize arrows

    serialRegion.arrows = [];

    for (const arrow of mainStore.currentPage.arrows.fromIds(
      container.arrowIds
    )) {
      const serialArrow: ISerialArrow = {
        start: {
          noteIndex: noteMap.get(arrow.collab.start.noteId ?? ''),
          pos: arrow.collab.start.pos,
        },
        end: {
          noteIndex: noteMap.get(arrow.collab.end.noteId ?? ''),
          pos: arrow.collab.end.pos,
        },
      };

      serialRegion.arrows.push(serialArrow);
    }

    if (serialRegion.arrows.length === 0) {
      delete serialRegion.arrows;
    }

    return serialRegion;
  }

  private _deserializeAux(serialRegion: ISerialRegion): IRegionCollab {
    const mainStore = useMainStore();

    const noteMap = new Map<number, string>();

    // Deserialize notes

    const noteIds = [];

    if (serialRegion.notes != null) {
      for (let i = 0; i < serialRegion.notes.length; i++) {
        const serialNote = serialRegion.notes[i];

        const noteCollab = {} as Partial<INoteCollab>;

        // Head and body

        noteCollab.head = {
          enabled: serialNote.head.enabled,
          value: createText(serialNote.head),
          wrap: serialNote.head.wrap,
        };
        noteCollab.body = {
          enabled: serialNote.body.enabled,
          value: createText(serialNote.body),
          wrap: serialNote.body.wrap,
        };

        // Rest of the keys

        const collabKeys = Object.keys(serialNote);
        pull(collabKeys, 'head', 'body', 'notes', 'arrows');

        for (const collabKey of collabKeys) {
          // @ts-ignore
          noteCollab[collabKey] = cloneDeep(serialNote[collabKey]);
        }

        noteCollab.zIndex = mainStore.currentPage.react.collab.nextZIndex++;

        // Children

        const deserializedChild = this._deserializeAux(serialNote);

        noteCollab.noteIds = deserializedChild.noteIds;
        noteCollab.arrowIds = deserializedChild.arrowIds;

        // Add note data to the store

        const noteId = v4();

        mainStore.currentPage.notes.react.collab[noteId] =
          noteCollab as INoteCollab;

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
            noteId: noteMap.get(serialArrow.start.noteIndex ?? -1),
            pos: serialArrow.start.pos,
          },
          end: {
            noteId: noteMap.get(serialArrow.end.noteIndex ?? -1),
            pos: serialArrow.end.pos,
          },
        };

        const arrowId = v4();

        mainStore.currentPage.arrows.react.collab[arrowId] =
          arrowCollab as IArrowCollab;

        arrowIds.push(arrowId);
      }
    }

    return { noteIds, arrowIds };
  }
  deserialize(
    serialRegion: ISerialRegion,
    destRegion: IRegionCollab,
    destIndex?: number | null
  ): IRegionCollab {
    let result: IRegionCollab = { noteIds: [], arrowIds: [] };

    serialRegion = ISerialRegion.parse(serialRegion);

    const mainStore = useMainStore();

    mainStore.currentPage.collab.doc.transact(() => {
      result = this._deserializeAux(serialRegion);

      destIndex = destIndex ?? destRegion.noteIds.length;
      destRegion.noteIds.splice(destIndex, 0, ...result.noteIds);

      destRegion.arrowIds.push(...result.arrowIds);
    });

    return result;
  }
}
