import * as broadcastChannel from 'lib0/broadcastchannel';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as math from 'lib0/math';
import { Observable } from 'lib0/observable';
import * as time from 'lib0/time';
import * as url from 'lib0/url';
import * as authProtocol from 'y-protocols/auth';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as Y from 'yjs';

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const MESSAGE_AUTH = 2;
const MESSAGE_QUERY_AWARENESS = 3;

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
  bcconnected: boolean; //  True if this instance is currently communicating to other browser-windows via BroadcastChannel.
  wsUnsuccessfulReconnects: number;

  private _synced: boolean; // True if this instance is currently connected and synced with the server.

  ws: WebSocket;
  wsLastMessageReceived: number;

  shouldConnect: boolean; // If false, the client will not try to reconnect.

  private readonly _resyncInterval: NodeJS.Timer;
  private readonly _checkInterval: NodeJS.Timer;

  constructor(
    serverUrl: string,
    roomname: string,
    doc: Y.Doc,
    {
      connect = true,
      awareness = new awarenessProtocol.Awareness(doc),
      params = {},
      WebSocketPolyfill = WebSocket, // Optionally provide a WebSocket polyfill
      resyncInterval = -1, // Request server state every `resyncInterval` milliseconds
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
    this.bcconnected = false;
    this.wsUnsuccessfulReconnects = 0;

    this._synced = false;

    this.ws = null as any;
    this.wsLastMessageReceived = 0;

    this.shouldConnect = connect;

    // Setup WebSocket resyncing

    this._resyncInterval = 0 as any;

    if (resyncInterval > 0) {
      this._resyncInterval = setInterval(() => {
        if (this.ws) {
          // Resend sync step 1

          const encoder = encoding.createEncoder();

          encoding.writeVarUint(encoder, MESSAGE_SYNC);
          syncProtocol.writeSyncStep1(encoder, doc);

          this.ws.send(encoding.toUint8Array(encoder));
        }
      }, resyncInterval);
    }

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
      window.addEventListener('beforeunload', this.handleUnload);
    } else if (typeof process !== 'undefined') {
      process.on('exit', this.handleUnload);
    }

    if (connect) {
      this.connect();
    }
  }
  connect() {
    this.shouldConnect = true;

    if (!this.wsconnected && this.ws === null) {
      this.setupWebSocket();
      this.connectBroadcastChannel();
    }
  }
  setupWebSocket() {
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

      if (encoding.length(encoder) > 1) {
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
        ),
        this
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

      // Always send sync step 1 when connected

      const encoder = encoding.createEncoder();

      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeSyncStep1(encoder, this.doc);

      websocket.send(encoding.toUint8Array(encoder));

      // Broadcast local awareness state

      if (this.awareness.getLocalState() !== null) {
        const encoderAwarenessState = encoding.createEncoder();

        encoding.writeVarUint(encoderAwarenessState, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoderAwarenessState,
          awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
            this.doc.clientID,
          ])
        );

        websocket.send(encoding.toUint8Array(encoderAwarenessState));
      }
    };

    this.emit('status', [
      {
        status: 'connecting',
      },
    ]);
  }
  connectBroadcastChannel() {
    if (!this.bcconnected) {
      broadcastChannel.subscribe(
        this.broadcastChannel,
        this.handleBroadcastChannelMessage
      );
      this.bcconnected = true;
    }

    // Send sync step 1 to broadcast channel
    // Write sync step 1

    const encoderSync = encoding.createEncoder();

    encoding.writeVarUint(encoderSync, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(encoderSync, this.doc);

    broadcastChannel.publish(
      this.broadcastChannel,
      encoding.toUint8Array(encoderSync)
    );

    // Broadcast local state

    const encoderState = encoding.createEncoder();

    encoding.writeVarUint(encoderState, MESSAGE_SYNC);
    syncProtocol.writeSyncStep2(encoderState, this.doc);

    broadcastChannel.publish(
      this.broadcastChannel,
      encoding.toUint8Array(encoderState)
    );

    // Broadcast local awareness state

    const encoderAwarenessState = encoding.createEncoder();

    encoding.writeVarUint(encoderAwarenessState, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoderAwarenessState,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
        this.doc.clientID,
      ])
    );

    broadcastChannel.publish(
      this.broadcastChannel,
      encoding.toUint8Array(encoderAwarenessState)
    );

    // Write query awareness

    const encoderAwarenessQuery = encoding.createEncoder();

    encoding.writeVarUint(encoderAwarenessQuery, MESSAGE_QUERY_AWARENESS);

    broadcastChannel.publish(
      this.broadcastChannel,
      encoding.toUint8Array(encoderAwarenessQuery)
    );
  }

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

  permissionDeniedHandler(y: any, reason: string) {
    console.warn(`Permission denied to access ${this.url}.\n${reason}`);
  }

  broadcastMessage(buf: ArrayBuffer) {
    if (this.wsconnected) {
      this.ws.send(buf);
    }

    if (this.bcconnected) {
      broadcastChannel.publish(this.broadcastChannel, buf);
    }
  }

  handleMessage(buf: Uint8Array, emitSynced: boolean) {
    const decoder = decoding.createDecoder(buf);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MESSAGE_SYNC:
        this.handleDocumentSyncMessage(encoder, decoder, emitSynced);
        break;
      case MESSAGE_AWARENESS:
        this.handleAwarenessSyncMessage(encoder, decoder);
        break;
      case MESSAGE_AUTH:
        this.handleAuthMessage(encoder, decoder);
        break;
      case MESSAGE_QUERY_AWARENESS:
        this.handleQueryAwarenessMessage(encoder);
        break;
      default:
        console.error('Unable to compute message');
    }

    return encoder;
  }
  handleDocumentSyncMessage(
    encoder: encoding.Encoder,
    decoder: decoding.Decoder,
    emitSynced: boolean
  ) {
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    const syncMessageType = syncProtocol.readSyncMessage(
      decoder,
      encoder,
      this.doc,
      this
    );

    if (
      emitSynced &&
      syncMessageType === syncProtocol.messageYjsSyncStep2 &&
      !this.synced
    ) {
      this.synced = true;
    }
  }
  handleAwarenessSyncMessage(
    encoder: encoding.Encoder,
    decoder: decoding.Decoder
  ) {
    awarenessProtocol.applyAwarenessUpdate(
      this.awareness,
      decoding.readVarUint8Array(decoder),
      this
    );
  }
  handleAuthMessage(encoder: encoding.Encoder, decoder: decoding.Decoder) {
    authProtocol.readAuthMessage(
      decoder,
      this.doc,
      this.permissionDeniedHandler
    );
  }
  handleQueryAwarenessMessage(encoder: encoding.Encoder) {
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        this.awareness,
        Array.from(this.awareness.getStates().keys())
      )
    );
  }

  disconnect() {
    this.shouldConnect = false;

    this.disconnectBroadcastChannel();

    if (this.ws !== null) {
      this.ws.close();
    }
  }
  disconnectBroadcastChannel() {
    // Broadcast message with local awareness state set to null (indicating disconnect)

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

    this.broadcastMessage(encoding.toUint8Array(encoder));

    if (this.bcconnected) {
      broadcastChannel.unsubscribe(
        this.broadcastChannel,
        this.handleBroadcastChannelMessage
      );
      this.bcconnected = false;
    }
  }

  destroy() {
    if (this._resyncInterval !== (0 as any)) {
      clearInterval(this._resyncInterval);
    }

    clearInterval(this._checkInterval);

    this.disconnect();

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleUnload);
    } else if (typeof process !== 'undefined') {
      process.off('exit', () => this.handleUnload);
    }

    this.awareness.off('update', this.handleAwarenessUpdate);
    this.doc.off('update', this.handleDocumentUpdate);

    super.destroy();
  }

  handleBroadcastChannelMessage = (...args: any) =>
    handleBroadcastChannelMessage.apply(this, args);
  handleDocumentUpdate = (...args: any) =>
    handleDocumentUpdate.apply(this, args);
  handleAwarenessUpdate = (...args: any) =>
    handleAwarenessUpdate.apply(this, args);
  handleUnload = (...args: any) => handleUnload.apply(this, args);
}

function handleBroadcastChannelMessage(
  this: WebsocketProvider,
  data: ArrayBuffer
) {
  const encoder = this.handleMessage(new Uint8Array(data), false);

  if (encoding.length(encoder) > 1) {
    broadcastChannel.publish(
      this.broadcastChannel,
      encoding.toUint8Array(encoder)
    );
  }
}

// Listens to Yjs updates and sends them to remote peers (ws and broadcastchannel)

function handleDocumentUpdate(this: WebsocketProvider, update: Uint8Array) {
  const encoder = encoding.createEncoder();

  encoding.writeVarUint(encoder, MESSAGE_SYNC);
  syncProtocol.writeUpdate(encoder, update);

  this.broadcastMessage(encoding.toUint8Array(encoder));
}

function handleAwarenessUpdate(
  this: WebsocketProvider,
  { added, updated, removed }: IAwarenessChanges
) {
  const changedClients = added.concat(updated).concat(removed);

  const encoder = encoding.createEncoder();

  encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
  );

  this.broadcastMessage(encoding.toUint8Array(encoder));
}

function handleUnload(this: WebsocketProvider) {
  awarenessProtocol.removeAwarenessStates(
    this.awareness,
    [this.doc.clientID],
    'window unload'
  );
}
