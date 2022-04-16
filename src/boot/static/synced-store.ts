import { SyncedText } from '@syncedstore/core';

export function createText(delta: object) {
  const clone = new SyncedText();

  clone.applyDelta(delta);

  return clone;
}

export function cloneText(text: SyncedText) {
  return createText(text.toDelta());
}
