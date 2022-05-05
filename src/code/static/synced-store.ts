import { SyncedText } from '@syncedstore/core';

import { Op } from './quill';

export function clearSyncedText(text: SyncedText) {
  text.delete(0, text.length);
}

export function swapSyncedTexts(a: SyncedText, b: SyncedText) {
  const deltaA = a.toDelta();
  const deltaB = b.toDelta();

  clearSyncedText(a);
  clearSyncedText(b);

  a.applyDelta(deltaB);
  b.applyDelta(deltaA);
}

export function createSyncedText(delta: Op[]) {
  const clone = new SyncedText();

  clone.applyDelta(delta);

  return clone;
}

export function cloneSyncedText(text: SyncedText) {
  return createSyncedText(text.toDelta());
}
