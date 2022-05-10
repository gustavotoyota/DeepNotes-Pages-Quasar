import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as math from 'lib0/math';
import { Observable } from 'lib0/observable';
import * as time from 'lib0/time';
import * as url from 'lib0/url';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';

import { SymmetricKey } from '../static/crypto/symmetric-key';

export const MESSAGE_SYNC = 0;
export const MESSAGE_AWARENESS = 1;

export const MESSAGE_SYNC_REQUEST = 0;
export const MESSAGE_SYNC_ALL_UPDATES_UNMERGED = 1;
export const MESSAGE_SYNC_ALL_UPDATES_MERGED = 2;
export const MESSAGE_SYNC_SINGLE_UPDATE = 3;

// @todo - this should depend on awareness.outdatedTime

const MESSAGE_RECONNECT_TIMEOUT = 30000;

interface IAwarenessChanges {
  added: number[];
  updated: number[];
  removed: number[];
}

export class WebsocketProvider extends Observable<string> {
  readonly maxBackoffTime: number;

  readonly roomname: string;
  readonly broadcastChannel: string;
  readonly url: string;

  readonly doc: Y.Doc;
  private readonly _WS: typeof WebSocket;
  readonly awareness: awarenessProtocol.Awareness;

  wsconnected: boolean; //  True if this instance is currently connected to the server.
  wsconnecting: boolean; // True if this instance is currently connecting to the server.
  wsUnsuccessfulReconnects: number;

  private _synced: boolean; // True if this instance is currently connected and synced with the server.

  ws: WebSocket;
  wsLastMessageReceived: number;

  shouldConnect: boolean; // If false, the client will not try to reconnect.

  private readonly _checkInterval: NodeJS.Timer;

  readonly symmetricKey: SymmetricKey;

  constructor(
    serverUrl: string,
    roomname: string,
    doc: Y.Doc,
    symmetricKey: SymmetricKey,
    {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      WebSocketPolyfill = WebSocket, // Optionally provide a WebSocket polyfill
      maxBackoffTime = 2500, // Maximum amount of time to wait before trying to reconnect (we try to reconnect using exponential backoff)
    } = {}
  ) {
    super();

    // Ensure that url is always ends with /

    while (serverUrl[serverUrl.length - 1] === '/') {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1);
    }

    const encodedParams = url.encodeQueryParams(params);
    this.maxBackoffTime = maxBackoffTime;
    this.broadcastChannel = serverUrl + '/' + roomname;
    this.url =
      serverUrl +
      '/' +
      roomname +
      (encodedParams.length === 0 ? '' : '?' + encodedParams);
    this.roomname = roomname;
    this.doc = doc;
    this._WS = WebSocketPolyfill;
    this.awareness = awareness;
    this.wsconnected = false;
    this.wsconnecting = false;
    this.wsUnsuccessfulReconnects = 0;

    this._synced = false;

    this.ws = null as any;
    this.wsLastMessageReceived = 0;

    this.shouldConnect = connect;

    this.symmetricKey = symmetricKey;

    // Setup reconnection timeout

    this._checkInterval = setInterval(() => {
      if (
        this.wsconnected &&
        MESSAGE_RECONNECT_TIMEOUT <
          time.getUnixTime() - this.wsLastMessageReceived
      ) {
        // No message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)

        this.ws.close();
      }
    }, MESSAGE_RECONNECT_TIMEOUT / 10);

    // Setup update-handling methods

    this.doc.on('update', this.handleDocumentUpdate);
    awareness.on('update', this.handleAwarenessUpdate);

    // Setup unload handling

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.clearAwareness);
    } else if (typeof process !== 'undefined') {
      process.on('exit', this.clearAwareness);
    }

    if (connect) {
      this.connect();
    }
  }
  connect() {
    this.shouldConnect = true;

    if (!this.wsconnected && this.ws === null) {
      this.setupWebSocket();
    }
  }
  setupWebSocket = () => {
    if (!this.shouldConnect || this.ws !== null) {
      return;
    }

    const websocket = new this._WS(this.url);
    websocket.binaryType = 'arraybuffer';
    this.ws = websocket;
    this.wsconnecting = true;
    this.wsconnected = false;
    this.synced = false;

    websocket.onmessage = (event) => {
      this.wsLastMessageReceived = time.getUnixTime();

      const encoder = this.handleMessage(
        new Uint8Array(event.data as any),
        true
      );

      if (encoding.length(encoder) > 0) {
        websocket.send(encoding.toUint8Array(encoder));
      }
    };

    websocket.onerror = (event) => {
      this.emit('connection-error', [event, this]);
    };

    websocket.onclose = (event) => {
      this.emit('connection-close', [event, this]);

      this.ws = null as any;
      this.wsconnecting = false;

      if (this.wsconnected) {
        this.wsconnected = false;
        this.synced = false;

        // Update awareness (all users except local left)

        awarenessProtocol.removeAwarenessStates(
          this.awareness,
          Array.from(this.awareness.getStates().keys()).filter(
            (client) => client !== this.doc.clientID
          ),
          this
        );

        this.emit('status', [
          {
            status: 'disconnected',
          },
        ]);
      } else {
        this.wsUnsuccessfulReconnects++;
      }

      // Start with no reconnect timeout and increase timeout by
      // using exponential backoff starting with 100ms

      setTimeout(
        this.setupWebSocket,
        math.min(
          math.pow(2, this.wsUnsuccessfulReconnects) * 100,
          this.maxBackoffTime
        )
      );
    };

    websocket.onopen = () => {
      this.wsLastMessageReceived = time.getUnixTime();
      this.wsconnecting = false;
      this.wsconnected = true;
      this.wsUnsuccessfulReconnects = 0;

      this.emit('status', [
        {
          status: 'connected',
        },
      ]);

      // Send sync request when connected

      const encoderDocument = encoding.createEncoder();

      this.writeSyncRequestMessage(encoderDocument);

      websocket.send(encoding.toUint8Array(encoderDocument));

      // Broadcast local awareness state

      if (this.awareness.getLocalState() !== null) {
        const encoderAwareness = encoding.createEncoder();

        encoding.writeVarUint(encoderAwareness, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoderAwareness,
          awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
            this.doc.clientID,
          ])
        );

        websocket.send(encoding.toUint8Array(encoderAwareness));
      }
    };

    this.emit('status', [
      {
        status: 'connecting',
      },
    ]);
  };

  get synced(): boolean {
    return this._synced;
  }
  set synced(state: boolean) {
    if (this._synced === state) {
      return;
    }

    this._synced = state;

    this.emit('synced', [state]);
    this.emit('sync', [state]);
  }

  handleDocumentUpdate = (update: Uint8Array) => {
    const encoder = encoding.createEncoder();

    this.writeSyncSingleUpdateMessage(encoder, update);

    this.ws.send(encoding.toUint8Array(encoder));
  };
  handleAwarenessUpdate = ({ added, updated, removed }: IAwarenessChanges) => {
    const changedClients = added.concat(updated).concat(removed);

    const encoder = encoding.createEncoder();

    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
    );

    this.ws.send(encoding.toUint8Array(encoder));
  };

  handleMessage(buf: Uint8Array, emitSynced: boolean) {
    const decoder = decoding.createDecoder(buf);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MESSAGE_SYNC:
        this.handleDocumentSyncMessage(decoder, encoder, emitSynced);
        break;
      case MESSAGE_AWARENESS:
        console.log('Awareness message received');
        this.handleAwarenessSyncMessage(decoder);
        break;
      default:
        console.error('Unable to compute message');
    }

    return encoder;
  }
  handleDocumentSyncMessage(
    decoder: decoding.Decoder,
    encoder: encoding.Encoder,
    emitSynced: boolean
  ) {
    const syncMessageType = decoding.readVarUint(decoder);

    switch (syncMessageType) {
      case MESSAGE_SYNC_REQUEST:
        console.log('Sync request message received');
        this.handleSyncRequestMessage(encoder);
        break;
      case MESSAGE_SYNC_ALL_UPDATES_UNMERGED:
        console.log('Sync all updates unmerged message received');
        this.handleSyncAllUpdatesUnmergedMessage(decoder, encoder);
        break;
      case MESSAGE_SYNC_ALL_UPDATES_MERGED:
        console.log('Sync all updates merged message received');
        this.handleSyncAllUpdatesMergedMessage(decoder);
        break;
      case MESSAGE_SYNC_SINGLE_UPDATE:
        console.log('Sync single update message received');
        this.handleSyncSingleUpdateMessage(decoder);
        break;
    }

    if (
      emitSynced &&
      [
        MESSAGE_SYNC_ALL_UPDATES_UNMERGED,
        MESSAGE_SYNC_ALL_UPDATES_MERGED,
      ].includes(syncMessageType) &&
      !this.synced
    ) {
      this.synced = true;
    }
  }
  handleAwarenessSyncMessage(decoder: decoding.Decoder) {
    awarenessProtocol.applyAwarenessUpdate(
      this.awareness,
      decoding.readVarUint8Array(decoder),
      this
    );
  }

  writeSyncRequestMessage(encoder: encoding.Encoder) {
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    encoding.writeVarUint(encoder, MESSAGE_SYNC_REQUEST);
  }
  handleSyncRequestMessage(encoder: encoding.Encoder) {
    this.writeSyncAllUpdatesMergedMessage(encoder);
  }

  handleSyncAllUpdatesUnmergedMessage(
    decoder: decoding.Decoder,
    encoder: encoding.Encoder
  ) {
    const numUpdates = decoding.readVarUint(decoder);

    for (let i = 0; i < numUpdates; i++) {
      this.handleSyncSingleUpdateMessage(decoder);
    }

    this.writeSyncAllUpdatesMergedMessage(encoder);
  }

  writeSyncAllUpdatesMergedMessage(encoder: encoding.Encoder) {
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    encoding.writeVarUint(encoder, MESSAGE_SYNC_ALL_UPDATES_MERGED);

    // Compute decrypted update
    const decryptedUpdate = Y.encodeStateAsUpdate(this.doc);

    // Encrypt update with symmetric key
    const encryptedUpdate = this.symmetricKey.encrypt(decryptedUpdate);

    // Send encrypted update
    encoding.writeVarUint8Array(encoder, encryptedUpdate);
  }
  handleSyncAllUpdatesMergedMessage(decoder: decoding.Decoder) {
    decoding.readVarUint(decoder); // Read update index

    this.handleSyncSingleUpdateMessage(decoder);
  }

  writeSyncSingleUpdateMessage(encoder: encoding.Encoder, update: Uint8Array) {
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    encoding.writeVarUint(encoder, MESSAGE_SYNC_SINGLE_UPDATE);

    // Encrypt update with symmetric key
    const encryptedUpdate = this.symmetricKey.encrypt(update);

    // Send encrypted update
    encoding.writeVarUint8Array(encoder, encryptedUpdate);
  }
  handleSyncSingleUpdateMessage(decoder: decoding.Decoder) {
    // Read encrypted update
    const encryptedUpdate = decoding.readVarUint8Array(decoder);

    // Decrypt update with symmetric key
    const decryptedUpdate = this.symmetricKey.decrypt(encryptedUpdate);

    // Apply decrypted update
    Y.applyUpdate(this.doc, decryptedUpdate);
  }

  clearAwareness = () => {
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      'window unload'
    );
  };

  disconnect() {
    this.shouldConnect = false;

    if (this.ws !== null) {
      this.ws.close();
    }
  }

  destroy() {
    clearInterval(this._checkInterval);

    this.disconnect();

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.clearAwareness);
    } else if (typeof process !== 'undefined') {
      process.off('exit', () => this.clearAwareness);
    }

    this.awareness.off('update', this.handleAwarenessUpdate);
    this.doc.off('update', this.handleDocumentUpdate);

    super.destroy();
  }
}
