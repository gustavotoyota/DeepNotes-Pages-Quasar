import syncedStore, { getYjsValue, Y } from '@syncedstore/core';
import { reactive } from 'vue';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';
import { IArrowCollab } from './arrows/arrow';
import { INoteCollab } from './notes/note';
import { AppPage, IPageCollab } from './page';

export interface IAppCollabStore {
  page: IPageCollab;
  notes: { [key: string]: INoteCollab };
  arrows: { [key: string]: IArrowCollab };
}

export class PageCollab {
  readonly page: AppPage;

  readonly store: IAppCollabStore;
  readonly doc: Y.Doc;

  indexedDbProvider!: IndexeddbPersistence;
  websocketProvider!: WebsocketProvider;

  constructor(page: AppPage) {
    this.page = page;

    this.store = reactive(
      syncedStore({
        page: {},
        notes: {},
        arrows: {},
      })
    ) as IAppCollabStore;

    this.doc = getYjsValue(this.store) as Y.Doc;
  }

  reset(pageName: string) {
    this.doc.transact(() => {
      Object.assign(this.store.page, {
        name: pageName,

        noteIds: [],
        arrowIds: [],

        nextZIndex: 0,
      } as IPageCollab);
    });
  }

  async preSync() {
    const promises = [];

    const roomName = `page-${this.page.id}-3`;

    // IndexedDB

    if (!process.env.DEV) {
      this.indexedDbProvider = new IndexeddbPersistence(roomName, this.doc);

      promises.push(
        new Promise((resolve) => this.indexedDbProvider.on('synced', resolve))
      );
    }

    // Websocket

    this.websocketProvider = new WebsocketProvider(
      process.env.DEV
        ? 'ws://localhost:1234'
        : 'wss://yjs-server.deepnotes.app/',
      roomName,
      this.doc
    );

    promises.push(
      new Promise((resolve) => this.websocketProvider.on('sync', resolve))
    );

    await Promise.all(promises);
  }

  postSync() {
    // To do

    this.page.react.loaded = true;
  }
}
