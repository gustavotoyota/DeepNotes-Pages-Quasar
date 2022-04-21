import { SyncedText } from '@syncedstore/core';
import { Op } from './quill';

export function createText(delta: Op[]) {
  const clone = new SyncedText();

  clone.applyDelta(delta);

  return clone;
}

export function cloneText(text: SyncedText) {
  return createText(text.toDelta());
}
