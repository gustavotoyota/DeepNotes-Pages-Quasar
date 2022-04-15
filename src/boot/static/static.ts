import { StaticClipboard } from './clipboard';
import { StaticSyncedStore } from './synced-store';
import { StaticUtils } from './utils';

export class Static {
  utils: StaticUtils = new StaticUtils();
  clipboard: StaticClipboard = new StaticClipboard();
  syncedStore: StaticSyncedStore = new StaticSyncedStore();
}

