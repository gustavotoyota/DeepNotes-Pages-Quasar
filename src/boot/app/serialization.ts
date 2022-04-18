import { z } from 'zod';
import { IVec2 } from '../static/vec2';
import { DeepNotesApp } from './app';
import { INoteCollab } from './page/notes/note';
import { Op } from 'src/boot/static/types';
import { IRegionCollab } from './page/regions/region';
import { cloneDeep, pull } from 'lodash';

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
    if (this.app.react.page == null) {
      return {};
    }

    const serialRegion: ISerialRegion = {};

    // Serialize notes

    const noteMap = new Map<string, number>();

    serialRegion.notes = [];

    for (const note of this.app.react.page.notes.fromIds(
      container.noteIds ?? []
    )) {
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

    for (const arrow of this.app.react.page.arrows.fromIds(
      container.arrowIds ?? []
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
}
