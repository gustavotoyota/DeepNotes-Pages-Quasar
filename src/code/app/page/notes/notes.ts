import { getYjsValue, SyncedArray, SyncedMap } from '@syncedstore/core';
import { Factory } from 'src/code/static/composition-root';
import { Vec2 } from 'src/code/static/vec2';
import { refProp } from 'src/code/static/vue';
import { ITemplate } from 'src/stores/templates';
import {
  computed,
  ComputedRef,
  ShallowReactive,
  shallowReactive,
  UnwrapRef,
} from 'vue';
import { z } from 'zod';

import { AppPage } from '../page';
import { INoteCollab, PageNote } from './note';

export interface INotesReact {
  map: ShallowReactive<Record<string, PageNote>>;

  collab: ComputedRef<Record<string, z.output<typeof INoteCollab>>>;
}

export class PageNotes {
  factory: Factory;
  page: AppPage;

  react: UnwrapRef<INotesReact>;

  constructor(factory: Factory, page: AppPage) {
    this.factory = factory;

    this.page = page;

    this.react = refProp<INotesReact>(this, 'react', {
      map: shallowReactive({}),

      collab: computed(() => this.page.collab.store.notes),
    });
  }

  fromId(noteId: string | null): PageNote | null {
    return this.react.map[noteId ?? ''] ?? null;
  }
  toId(note: PageNote): string {
    return note.id;
  }

  fromIds(noteIds: string[]): PageNote[] {
    return noteIds
      .map((noteId) => this.react.map[noteId])
      .filter((note) => note != null);
  }
  toIds(notes: PageNote[]): string[] {
    return notes.map((note) => note.id);
  }

  createAndObserveChildren(noteId: string, parentId: string | null): void {
    const collab = this.react.collab[noteId];

    const note = this.factory.makeNote(this.page, noteId, parentId, collab);

    this.react.map[note.id] = note;

    this.createAndObserveIds(note.collab.noteIds, note.id);
    this.page.arrows.createAndObserveIds(note.collab.arrowIds, parentId);
  }
  createAndObserveIds(noteIds: string[], parentId: string | null) {
    for (const noteId of noteIds)
      this.createAndObserveChildren(noteId, parentId);

    (getYjsValue(noteIds) as SyncedArray<string>).observe((event) => {
      for (const delta of event.changes.delta) {
        if (delta.insert == null) continue;

        for (const noteId of delta.insert)
          this.createAndObserveChildren(noteId, parentId);
      }
    });
  }

  observeMap() {
    (
      getYjsValue(this.react.collab) as SyncedMap<z.output<typeof INoteCollab>>
    ).observe((event) => {
      for (const [noteId, change] of event.changes.keys) {
        if (change.action !== 'delete') continue;

        delete this.react.map[noteId];
      }
    });
  }

  createFromTemplate(template: ITemplate, clientPos: Vec2) {
    const noteId = this.page.app.serialization.deserialize(
      {
        notes: [template.data],
        arrows: [],
      },
      this.page.react.collab
    ).noteIds[0];

    const note = this.page.notes.react.map[noteId];

    note.collab.pos = this.page.pos.clientToWorld(clientPos);

    this.page.editing.start(note);
  }
}
