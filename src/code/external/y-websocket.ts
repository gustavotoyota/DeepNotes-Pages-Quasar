/*
Unlike stated in the LICENSE file, it is not necessary to include the copyright notice and permission notice when you copy code from this file.
*/

/**
 * @module provider/websocket
 */

/* eslint-env browser */

import * as Y from 'yjs'; // eslint-disable-line
import * as bc from 'lib0/broadcastchannel';
import * as time from 'lib0/time';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as authProtocol from 'y-protocols/auth';
import * as awarenessProtocol from 'y-protocols/awareness';
import { Observable } from 'lib0/observable';
import * as math from 'lib0/math';
import * as url from 'lib0/url';

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const MESSAGE_AUTH = 2;
const MESSAGE_QUERY_AWARENESS = 3;

declare global {
  // @ts-ignore
  let window: any;
}

type IMessageHandler = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: WebsocketProvider,
  emitSynced: boolean,
  messageType: number
) => void;

/**
 *                       encoder,          decoder,          provider,          emitSynced, messageType
 * @type {Array<function(encoding.Encoder, decoding.Decoder, WebsocketProvider, boolean,    number):void>}
 */
const messageHandlers: IMessageHandler[] = [];

messageHandlers[MESSAGE_SYNC] = (encoder, decoder, provider, emitSynced) => {
  encoding.writeVarUint(encoder, MESSAGE_SYNC);
  const syncMessageType = syncProtocol.readSyncMessage(
    decoder,
    encoder,
    provider.doc,
    provider
  );
  if (
    emitSynced &&
    syncMessageType === syncProtocol.messageYjsSyncStep2 &&
    !provider.synced
  ) {
    provider.synced = true;
  }
};

messageHandlers[MESSAGE_QUERY_AWARENESS] = (encoder, decoder, provider) => {
  encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(
      provider.awareness,
      Array.from(provider.awareness.getStates().keys())
    )
  );
};

messageHandlers[MESSAGE_AWARENESS] = (encoder, decoder, provider) => {
  awarenessProtocol.applyAwarenessUpdate(
    provider.awareness,
    decoding.readVarUint8Array(decoder),
    provider
  );
};

messageHandlers[MESSAGE_AUTH] = (encoder, decoder, provider) => {
  authProtocol.readAuthMessage(decoder, provider.doc, permissionDeniedHandler);
};

// @todo - this should depend on awareness.outdatedTime
const MESSAGE_RECONNECT_TIMEOUT = 30000;

/**
 * @param {WebsocketProvider} provider
 * @param {string} reason
 */
const permissionDeniedHandler = (provider: WebsocketProvider, reason: string) =>
  console.warn(`Permission denied to access ${provider.url}.\n${reason}`);

/**
 * @param {WebsocketProvider} provider
 * @param {Uint8Array} buf
 * @param {boolean} emitSynced
 * @return {encoding.Encoder}
 */
const readMessage = (
  provider: WebsocketProvider,
  buf: Uint8Array,
  emitSynced: boolean
) => {
  const decoder = decoding.createDecoder(buf);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);
  const messageHandler = provider.messageHandlers[messageType];
  if (/** @type {any} */ messageHandler) {
    messageHandler(encoder, decoder, provider, emitSynced, messageType);
  } else {
    console.error('Unable to compute message');
  }
  return encoder;
};

/**
 * @param {WebsocketProvider} provider
 */
const setupWS = (provider: WebsocketProvider) => {
  if (provider.shouldConnect && provider.ws === null) {
    const websocket = new provider._WS(provider.url);
    websocket.binaryType = 'arraybuffer';
    provider.ws = websocket;
    provider.wsconnecting = true;
    provider.wsconnected = false;
    provider.synced = false;

    websocket.onmessage = (event) => {
      provider.wsLastMessageReceived = time.getUnixTime();
      const encoder = readMessage(
        provider,
        new Uint8Array(event.data as any),
        true
      );
      if (encoding.length(encoder) > 1) {
        websocket.send(encoding.toUint8Array(encoder));
      }
    };
    websocket.onerror = (event) => {
      provider.emit('connection-error', [event, provider]);
    };
    websocket.onclose = (event) => {
      provider.emit('connection-close', [event, provider]);
      provider.ws = null as any;
      provider.wsconnecting = false;
      if (provider.wsconnected) {
        provider.wsconnected = false;
        provider.synced = false;
        // update awareness (all users except local left)
        awarenessProtocol.removeAwarenessStates(
          provider.awareness,
          Array.from(provider.awareness.getStates().keys()).filter(
            (client) => client !== provider.doc.clientID
          ),
          provider
        );
        provider.emit('status', [
          {
            status: 'disconnected',
          },
        ]);
      } else {
        provider.wsUnsuccessfulReconnects++;
      }
      // Start with no reconnect timeout and increase timeout by
      // using exponential backoff starting with 100ms
      setTimeout(
        setupWS,
        math.min(
          math.pow(2, provider.wsUnsuccessfulReconnects) * 100,
          provider.maxBackoffTime
        ),
        provider
      );
    };
    websocket.onopen = () => {
      provider.wsLastMessageReceived = time.getUnixTime();
      provider.wsconnecting = false;
      provider.wsconnected = true;
      provider.wsUnsuccessfulReconnects = 0;
      provider.emit('status', [
        {
          status: 'connected',
        },
      ]);
      // always send sync step 1 when connected
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeSyncStep1(encoder, provider.doc);
      websocket.send(encoding.toUint8Array(encoder));
      // broadcast local awareness state
      if (provider.awareness.getLocalState() !== null) {
        const encoderAwarenessState = encoding.createEncoder();
        encoding.writeVarUint(encoderAwarenessState, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoderAwarenessState,
          awarenessProtocol.encodeAwarenessUpdate(provider.awareness, [
            provider.doc.clientID,
          ])
        );
        websocket.send(encoding.toUint8Array(encoderAwarenessState));
      }
    };

    provider.emit('status', [
      {
        status: 'connecting',
      },
    ]);
  }
};

/**
 * @param {WebsocketProvider} provider
 * @param {ArrayBuffer} buf
 */
const broadcastMessage = (provider: WebsocketProvider, buf: ArrayBuffer) => {
  if (provider.wsconnected) {
    /** @type {WebSocket} */ provider.ws.send(buf);
  }
  if (provider.bcconnected) {
    bc.publish(provider.bcChannel, buf);
  }
};

/**
 * Websocket Provider for Yjs. Creates a websocket connection to sync the shared document.
 * The document name is attached to the provided url. I.e. the following example
 * creates a websocket connection to http://localhost:1234/my-document-name
 *
 * @example
 *   import * as Y from 'yjs'
 *   import { WebsocketProvider } from 'y-websocket'
 *   const doc = new Y.Doc()
 *   const provider = new WebsocketProvider('http://localhost:1234', 'my-document-name', doc)
 *
 * @extends {Observable<string>}
 */
export class WebsocketProvider extends Observable<string> {
  maxBackoffTime: number;
  bcChannel: string;
  url: string;
  roomname: string;
  doc: Y.Doc;
  _WS: typeof WebSocket;
  awareness: awarenessProtocol.Awareness;
  wsconnected: boolean;
  wsconnecting: boolean;
  bcconnected: boolean;
  wsUnsuccessfulReconnects: number;
  messageHandlers: IMessageHandler[];
  _synced: boolean;
  ws: WebSocket;
  wsLastMessageReceived: number;
  shouldConnect: boolean;
  _resyncInterval: NodeJS.Timer;
  _bcSubscriber: (data: ArrayBuffer) => void;
  _updateHandler: (update: Uint8Array, origin: any) => void;
  _awarenessUpdateHandler: (
    changes: { added: number[]; updated: number[]; removed: number[] },
    origin: any
  ) => void;
  _beforeUnloadHandler: () => void;
  _checkInterval: NodeJS.Timer;

  /**
   * @param {string} serverUrl
   * @param {string} roomname
   * @param {Y.Doc} doc
   * @param {object} [opts]
   * @param {boolean} [opts.connect]
   * @param {awarenessProtocol.Awareness} [opts.awareness]
   * @param {Object<string,string>} [opts.params]
   * @param {typeof WebSocket} [opts.WebSocketPolyfill] Optionally provide a WebSocket polyfill
   * @param {number} [opts.resyncInterval] Request server state every `resyncInterval` milliseconds
   * @param {number} [opts.maxBackoffTime] Maximum amount of time to wait before trying to reconnect (we try to reconnect using exponential backoff)
   */
  constructor(
    serverUrl: string,
    roomname: string,
    doc: Y.Doc,
    {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      WebSocketPolyfill = WebSocket,
      resyncInterval = -1,
      maxBackoffTime = 2500,
    } = {}
  ) {
    super();
    // ensure that url is always ends with /
    while (serverUrl[serverUrl.length - 1] === '/') {
      serverUrl = serverUrl.slice(0, serverUrl.length - 1);
    }
    const encodedParams = url.encodeQueryParams(params);
    this.maxBackoffTime = maxBackoffTime;
    this.bcChannel = serverUrl + '/' + roomname;
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
    this.bcconnected = false;
    this.wsUnsuccessfulReconnects = 0;
    this.messageHandlers = messageHandlers.slice();
    /**
     * @type {boolean}
     */
    this._synced = false;
    /**
     * @type {WebSocket?}
     */
    this.ws = null as any;
    this.wsLastMessageReceived = 0;
    /**
     * Whether to connect to other peers or not
     * @type {boolean}
     */
    this.shouldConnect = connect;

    /**
     * @type {number}
     */
    this._resyncInterval = 0 as any;
    if (resyncInterval > 0) {
      this._resyncInterval = /** @type {any} */ setInterval(() => {
        if (this.ws) {
          // resend sync step 1
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, MESSAGE_SYNC);
          syncProtocol.writeSyncStep1(encoder, doc);
          this.ws.send(encoding.toUint8Array(encoder));
        }
      }, resyncInterval);
    }

    /**
     * @param {ArrayBuffer} data
     * @param {any} origin
     */
    this._bcSubscriber = (data: ArrayBuffer) => {
      const encoder = readMessage(this, new Uint8Array(data), false);
      if (encoding.length(encoder) > 1) {
        bc.publish(this.bcChannel, encoding.toUint8Array(encoder));
      }
    };
    /**
     * Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)
     * @param {Uint8Array} update
     * @param {any} origin
     */
    this._updateHandler = (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.writeUpdate(encoder, update);
        broadcastMessage(this, encoding.toUint8Array(encoder));
      }
    };
    this.doc.on('update', this._updateHandler);
    /**
     * @param {any} changed
     * @param {any} origin
     */
    this._awarenessUpdateHandler = ({ added, updated, removed }) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      broadcastMessage(this, encoding.toUint8Array(encoder));
    };
    this._beforeUnloadHandler = () => {
      awarenessProtocol.removeAwarenessStates(
        this.awareness,
        [doc.clientID],
        'window unload'
      );
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this._beforeUnloadHandler);
    } else if (typeof process !== 'undefined') {
      process.on('exit', () => this._beforeUnloadHandler);
    }
    awareness.on('update', this._awarenessUpdateHandler);
    this._checkInterval = /** @type {any} */ setInterval(() => {
      if (
        this.wsconnected &&
        MESSAGE_RECONNECT_TIMEOUT <
          time.getUnixTime() - this.wsLastMessageReceived
      ) {
        // no message received in a long time - not even your own awareness
        // updates (which are updated every 15 seconds)
        /** @type {WebSocket} */ this.ws.close();
      }
    }, MESSAGE_RECONNECT_TIMEOUT / 10);
    if (connect) {
      this.connect();
    }
  }

  /**
   * @type {boolean}
   */
  get synced(): boolean {
    return this._synced;
  }

  set synced(state: boolean) {
    if (this._synced !== state) {
      this._synced = state;
      this.emit('synced', [state]);
      this.emit('sync', [state]);
    }
  }

  destroy() {
    if (this._resyncInterval !== (0 as any)) {
      clearInterval(this._resyncInterval);
    }
    clearInterval(this._checkInterval);
    this.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler);
    } else if (typeof process !== 'undefined') {
      process.off('exit', () => this._beforeUnloadHandler);
    }
    this.awareness.off('update', this._awarenessUpdateHandler);
    this.doc.off('update', this._updateHandler);
    super.destroy();
  }

  connectBc() {
    if (!this.bcconnected) {
      bc.subscribe(this.bcChannel, this._bcSubscriber);
      this.bcconnected = true;
    }
    // send sync step1 to bc
    // write sync step 1
    const encoderSync = encoding.createEncoder();
    encoding.writeVarUint(encoderSync, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(encoderSync, this.doc);
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderSync));
    // broadcast local state
    const encoderState = encoding.createEncoder();
    encoding.writeVarUint(encoderState, MESSAGE_SYNC);
    syncProtocol.writeSyncStep2(encoderState, this.doc);
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderState));
    // write queryAwareness
    const encoderAwarenessQuery = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessQuery, MESSAGE_QUERY_AWARENESS);
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessQuery));
    // broadcast local awareness state
    const encoderAwarenessState = encoding.createEncoder();
    encoding.writeVarUint(encoderAwarenessState, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID,
      ])
    );
    bc.publish(this.bcChannel, encoding.toUint8Array(encoderAwarenessState));
  }

  disconnectBc() {
    // broadcast message with local awareness state set to null (indicating disconnect)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        [this.doc.clientID],
        new Map()
      )
    );
    broadcastMessage(this, encoding.toUint8Array(encoder));
    if (this.bcconnected) {
      bc.unsubscribe(this.bcChannel, this._bcSubscriber);
      this.bcconnected = false;
    }
  }

  disconnect() {
    this.shouldConnect = false;
    this.disconnectBc();
    if (this.ws !== null) {
      this.ws.close();
    }
  }

  connect() {
    this.shouldConnect = true;
    if (!this.wsconnected && this.ws === null) {
      setupWS(this);
      this.connectBc();
    }
  }
}
