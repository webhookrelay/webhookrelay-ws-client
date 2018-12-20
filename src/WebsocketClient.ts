var WebSocket = require('universal-websocket-client');

import { SubscriptionMessage } from './Messages/WebhookRelayEvent';

export default class WebhookRelayClient {
    private _socket?: WebSocket;

    private _key: string = '';
    private _secret: string = '';
    private _buckets: string[] = [];

    private _handler!: (data: string) => void;

    private _connecting: boolean = false;
    private _manualDisconnect: boolean = false;
    private _connected: boolean = false;
    private _reconnectInterval: number = 1000 * 3;

    /** @private */
    constructor(private readonly key: string, secret: string, buckets: string[], handler: (data: string) => void) {
        this._key = key;
        this._secret = secret;
        this._buckets = buckets;
        this._handler = handler;
    }

    async connect() {
        return new Promise<void>((resolve, reject) => {
            if (this._connected) {
                resolve();
                return;
            }
            this._connecting = true;
            this._socket = new WebSocket('wss://my.webhookrelay.com/v1/socket');

            this._socket.onopen = (event: Event) => {
                this._connected = true;
                this._connecting = false;
                this._sendMessage({ action: 'auth', key: this._key, secret: this._secret });
                resolve();
            }

            this._socket.onmessage = (event: MessageEvent) => {                
                this._receiveMessage(event.data)
            }

            this._socket.onerror = (event: Event) => {
                console.log(`error event: ${event}`)
            }

            this._socket.onclose = (event: CloseEvent) => {
                this._socket = undefined;
                this._connected = false;
                this._connecting = false;
                if (this._manualDisconnect) {
                    // nothing to do, manual disconnect
                    return
                }
                console.log('connection closed, reconnecting..')
                setTimeout(async () => {
                    this._reconnect()
                }, this._reconnectInterval)
            }
        });
    }

    /**
     * Disconnects client
     */
    protected disconnect() {
        this._disconnect()
    }

    /**
	 * Checks whether the client is currently connecting to the server.
	 */
    protected get isConnecting() {
        return this._connecting;
    }

	/**
	 * Checks whether the client is currently connected to the server.
	 */
    protected get isConnected() {
        return this._connected;
    }

    private _disconnect() {
        if (this._socket) {
            this._manualDisconnect = true;
            this._socket.close();
        }
    }

    private async _reconnect() {
        this._disconnect();
        await this.connect();
    }

    private _sendMessage(obj: any) {
        const dataStr = JSON.stringify(obj);
        if (this._socket && this._connected) {
            this._socket.send(dataStr);
        }
    }

    private _receiveMessage(dataStr: string) {
        let msg = SubscriptionMessage.fromJSON(JSON.parse(dataStr));
        if (msg.getType() === 'status' && msg.getStatus() === 'authenticated') {
            this._sendMessage({ action: 'subscribe', buckets: this._buckets });
            return
        }

        switch (msg.getType()) {
            case 'status':
                if (msg.getStatus() === 'authenticated') {
                    this._sendMessage({ action: 'subscribe', buckets: this._buckets });
                }
                if (msg.getStatus() === 'subscribed') {
                    console.log('subscribed to webhook stream successfully')
                }

                if (msg.getStatus() === 'unauthorized') {
                    console.log(`authorization failed, key ${this._key}`)
                }

                // console.log(`error, status: ${msg.getStatus()}, message: ${msg.getMessage()}`)
                this._handler(dataStr)
                return
            case 'webhook':
                // raw payload
                this._handler(dataStr)
                return
            default:
                console.log(`unknown message type: ${msg.getType()}`)
                this._handler(dataStr)
                break;
        }
    }
}