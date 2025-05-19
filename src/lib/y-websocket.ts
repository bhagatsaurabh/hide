import * as time from "lib0/time";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { Doc } from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { Socket } from "socket.io-client";

import { FSSync } from "@/models/filesystem";
import { base64ToU8, u8ToBase64 } from "@/utils";
import { InSocketMessage } from "@/models/common";
import { TypedSocket } from "@/config/socket";

export const messageSync = 0;
export const messageQueryAwareness = 3;
export const messageAwareness = 1;

type MessageHandler = (
  encoder: encoding.Encoder,
  decoder: decoding.Decoder,
  provider: WebsocketProvider,
  emitSynced: boolean,
  type: number
) => void;
type AwarenessUpdate = { added: number[]; updated: number[]; removed: number[] };

const messageHandlers: MessageHandler[] = [];
const messageReconnectTimeout = 30000;
messageHandlers[messageSync] = (encoder, decoder, provider, _emitSynced, _messageType) => {
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.readSyncMessage(decoder, encoder, provider.doc, provider);
};
messageHandlers[messageQueryAwareness] = (encoder, _decoder, provider, _emitSynced, _messageType) => {
  encoding.writeVarUint(encoder, messageAwareness);
  encoding.writeVarUint8Array(
    encoder,
    awarenessProtocol.encodeAwarenessUpdate(provider.awareness, Array.from(provider.awareness.getStates().keys()))
  );
};
messageHandlers[messageAwareness] = (_encoder, decoder, provider, _emitSynced, _messageType) => {
  awarenessProtocol.applyAwarenessUpdate(provider.awareness, decoding.readVarUint8Array(decoder), provider);
};

export class WebsocketProvider {
  awareness: awarenessProtocol.Awareness;
  messageHandlers: MessageHandler[];
  wsLastMessageReceived: number;
  _resyncInterval: number;
  _checkInterval: number;
  private updateHandler: typeof this._updateHandler;
  private awarenessUpdateHandler: typeof this._awarenessUpdateHandler;

  constructor(
    public uuid: string,
    public socket: TypedSocket,
    public doc: Doc,
    public path: string,
    { awareness = new awarenessProtocol.Awareness(doc), resyncInterval = -1 } = {}
  ) {
    this.doc = doc;
    this.awareness = awareness;
    this.messageHandlers = messageHandlers.slice();
    this.wsLastMessageReceived = 0;
    this._resyncInterval = 0;
    if (resyncInterval > 0) {
      this._resyncInterval = setInterval(() => {
        if (this.socket.connected) {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.writeSyncStep1(encoder, doc);
          this.socket.emit("msg", {
            service: "env",
            action: "fs.sync",
            payload: {
              uuid: this.uuid,
              path: this.path,
              buf: u8ToBase64(encoding.toUint8Array(encoder)),
            },
          });
        }
      }, resyncInterval) as unknown as number;
    }

    this.updateHandler = this._updateHandler.bind(this);
    this.awarenessUpdateHandler = this._awarenessUpdateHandler.bind(this);
    this.doc.on("update", this.updateHandler);
    this.awareness.on("update", this.awarenessUpdateHandler);
    this._checkInterval = setInterval(() => {
      if (messageReconnectTimeout < time.getUnixTime() - this.wsLastMessageReceived) {
        this.close();
      }
    }, messageReconnectTimeout / 10) as unknown as number;
    this.setupWS();
  }

  _updateHandler(update: Uint8Array, origin: typeof this) {
    if (origin !== this) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      this.sendMessage(this.socket, encoding.toUint8Array(encoder));
    }
  }
  _awarenessUpdateHandler({ added, updated, removed }: AwarenessUpdate, _origin: unknown) {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients));
    this.sendMessage(this.socket, encoding.toUint8Array(encoder));
  }

  setupWS() {
    this.socket.on("disconnect", () => this.close());

    this.wsLastMessageReceived = time.getUnixTime();
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, this.doc);
    this.socket.emit("msg", {
      service: "env",
      action: "fs.sync",
      payload: {
        uuid: this.uuid,
        path: this.path,
        buf: u8ToBase64(encoding.toUint8Array(encoder)),
      },
    });
    if (this.awareness.getLocalState() !== null) {
      const encoderAwarenessState = encoding.createEncoder();
      encoding.writeVarUint(encoderAwarenessState, messageAwareness);
      encoding.writeVarUint8Array(
        encoderAwarenessState,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, [this.doc.clientID])
      );
      this.socket.emit("msg", {
        service: "env",
        action: "fs.sync",
        payload: {
          uuid: this.uuid,
          path: this.path,
          buf: u8ToBase64(encoding.toUint8Array(encoderAwarenessState)),
        },
      });
    }
    this.socket.on("fs", (msg: InSocketMessage<"fs">) => {
      if (msg.action !== "sync" || msg.payload.path !== this.path) return;

      this.wsLastMessageReceived = time.getUnixTime();
      const encoder = this.readMessage(msg.payload, true);
      if (encoding.length(encoder) > 1) {
        this.socket.emit("msg", {
          service: "env",
          action: "fs.sync",
          payload: {
            uuid: this.uuid,
            path: this.path,
            buf: u8ToBase64(encoding.toUint8Array(encoder)),
          },
        });
      }
    });
  }
  readMessage(data: FSSync, emitSynced: boolean) {
    const buf = base64ToU8(data.buf);
    const decoder = decoding.createDecoder(buf);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);
    const messageHandler = this.messageHandlers[messageType];
    if (messageHandler) {
      messageHandler(encoder, decoder, this, emitSynced, messageType);
    } else {
      console.error("Unable to compute message");
    }
    return encoder;
  }
  sendMessage(socket: TypedSocket, buf: Uint8Array) {
    socket.emit("msg", {
      service: "env",
      action: "fs.sync",
      payload: {
        uuid: this.uuid,
        path: this.path,
        buf: u8ToBase64(buf),
      },
    });
  }
  destroy() {
    if (this._resyncInterval !== 0) {
      clearInterval(this._resyncInterval);
    }
    clearInterval(this._checkInterval);
    this.close();
    this.awareness.off("update", this.awarenessUpdateHandler);
    this.doc.off("update", this.updateHandler);
  }
  close() {
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      Array.from(this.awareness.getStates().keys()).filter((client) => client !== this.doc.clientID),
      this
    );
  }
}
