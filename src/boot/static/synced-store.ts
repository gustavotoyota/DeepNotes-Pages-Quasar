import { SyncedText } from '@syncedstore/core';

export class StaticSyncedStore {
  createText(delta: object) {
    const clone = new SyncedText();

    clone.applyDelta(delta);

    return clone;
  }

  cloneText(text: SyncedText) {
    return this.createText(text.toDelta());
  }
}
