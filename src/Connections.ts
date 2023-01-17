import { createLogger, Message } from "@hamok-dev/hamok-js-core";
import { WebSocket, EventEmitter, RawData } from "ws";

const logger = createLogger("Connections");
const CONNECTION_READY_EVENT_NAME = "CONNECTION_READY";
const HAMOK_MESSAGE_RECEIVED_EVENT_NAME = "hamokMessageReceived";

export type ConnectionListener = (remoteEndpointId: string) => void;
export type MessageListener = (message: Message) => void;

function convertUuidToBigInt(uuid: string): BigInt {
    
    // remove the dashes from the given uuid and convert to a hexadecimal BigNumber object
    const bn = BigInt(`0x${uuid.replace(/-/g, '')}`);
    // return the string representation of the BigNumber object as a decimal
    return bn;
};

export class Connections {
    private _emitter = new EventEmitter();
    private _connections = new Map<string, Connection>();
    private _localEndpointId: string;

    public constructor(localEndpointId: string) {
        this._localEndpointId = localEndpointId;
    }

    public logStatus() {
        const status = [`Status of connections`];
        for (const [remoteEndpointId, connection] of this._connections) {
            status.push(
                `\tTo: ${remoteEndpointId} Role: ${connection.role}`
            )
        }
        logger.info(`Local endpoint id: ${this._localEndpointId}`, status.join("\n"));
    }

    public onConnectionReady(listener: ConnectionListener): this {
        this._emitter.on(CONNECTION_READY_EVENT_NAME, listener);
        return this;
    }

    public offConnectionReady(listener: ConnectionListener): this {
        this._emitter.off(CONNECTION_READY_EVENT_NAME, listener);
        return this;
    }

    public onHamokMessageReceived(listener: MessageListener): this {
        this._emitter.on(HAMOK_MESSAGE_RECEIVED_EVENT_NAME, listener);
        return this;
    }

    public offHamokMessageReceived(listener: MessageListener): this {
        this._emitter.off(HAMOK_MESSAGE_RECEIVED_EVENT_NAME, listener);
        return this;
    }

    public async promiseNumberOfConnections(targetNum: number, timeoutInMs?: number): Promise<void> {
        if (targetNum <= this._connections.size) {
            return;
        }
        const started = Date.now();
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if (timeoutInMs && timeoutInMs < Date.now() - started) {
                    clearInterval(timer);
                    reject(`Timeout`);
                    return;
                }
                if (this._connections.size < targetNum) {
                    return;
                }
                clearInterval(timer);
                resolve();
            }, 500);
        });
    }

    public sendHamokMessage(message: Message) {
        // console.warn(`SEND HAMOK MESSAGE`, message);
        if (message.destinationId) {
            const connection = this._connections.get(message.destinationId);
            if (connection) {
                connection.sendHamokMessage(message);
                return;
            }
        }
        for (const connection of this._connections.values()) {
            connection.sendHamokMessage(message);
        }
    }

    public accept(remoteEndpointId: string, ws: WebSocket): void {
        const acceptor = new Acceptor(this._emitter, ws, remoteEndpointId);
        const localNum = convertUuidToBigInt(this._localEndpointId);
        const remoteNum = convertUuidToBigInt(acceptor.remoteEndpointId);
        logger.info(`localEndpointId ${this._localEndpointId} is ${localNum} and remoteEndpointId ${remoteEndpointId} is ${remoteNum}. We reject the attempt to connect to this endpoint if the localNum < remoteNum `)
        if (localNum < remoteNum) {
            this._sendRepeatedly(acceptor, {
                type: "close",
                code: 4242,
                message: "Let's close"
            });
            return;
        }
        logger.info(`Accepted socket to remote endpoint ${remoteEndpointId}`);
        this._sendRepeatedly(acceptor, {
            type: "hello",
            remoteEndpointId: this._localEndpointId
        });
        this._connections.set(acceptor.remoteEndpointId, acceptor);
        this._emitter.emit(CONNECTION_READY_EVENT_NAME, acceptor.remoteEndpointId);
        // add it to the connections and consider it ready
    }

    private _sendRepeatedly(connection: Connection, msg: ControlMessage, repeat = 3) {
        let sent = 0;
        const timer = setInterval(() => {
            connection.sendControlMessage(msg);
            if (repeat <= ++sent) {
                clearInterval(timer);
            }
        }, 1000);
    }

    public connect(hostname: string, port: number): void {
        const connector = new Connector(
            this._emitter,
            `ws://${hostname}:${port}?remoteEndpointId=${this._localEndpointId}`
        );
        connector.connect().then(() => {
            if (!connector.remoteEndpointId) {
                logger.warn(`Connection to ${connector.wsAddress} is accepted, but no remote endpoint id is found.`);
                return;
            }
            logger.info(`Connection to ${connector.remoteEndpointId} is accepted`);
            this._connections.set(connector.remoteEndpointId, connector);
            this._emitter.emit(CONNECTION_READY_EVENT_NAME, connector.remoteEndpointId);
        }).catch((err) => {
            logger.info(`Connection to ${connector.wsAddress} is rejected`, err);
        });
    }
}

type HelloFeedback = {
    type: "hello"
    remoteEndpointId: string,
};

type CloseCommand = {
    type: "close",
    code?: number,
    message?: string,
}

type ControlMessage = HelloFeedback | CloseCommand;

abstract class Connection {
    public abstract get role(): "connector" | "acceptor";
    public abstract get remoteEndpointId(): string | undefined;
    private _ws?: WebSocket;
    private _emitter: EventEmitter;

    public constructor(emitter: EventEmitter) {
        this._emitter = emitter;
    }

    public close() {
        this._ws?.close();
    }

    protected setupWs(ws: WebSocket): void {
        const messageListener = (data: RawData, isBinary: boolean) => {
            if (isBinary) {
                const message = Message.fromBinary(data as Buffer);
                // if (message.destinationId && message.destinationId.length < 3)
                //     logger.info(`HAMOK_RECEIVED_MESSAGE`, message);
                this._emitter.emit(HAMOK_MESSAGE_RECEIVED_EVENT_NAME, message);    
            } else {
                this._receiveControllMessage(data);
            }
        };
        ws.once("close", () => {
            ws.off("message", messageListener);
        });
        ws.on("message", messageListener);
        this._ws = ws;
    }

    public sendHamokMessage(message: Message): void {
        if (!this._ws) {
            logger.warn(`sendHamokMessage(): Attempted to send a message on a connection does not have a websocket`);
            return;
        }
        // if (message.destinationId && message.destinationId.length < 3)
        //     logger.info(`HAMOK_SENDING_MESSAGE`, message);
        this._ws.send(message.toBinary());
    }

    public sendControlMessage(message: ControlMessage): void {
        if (!this._ws) {
            logger.warn(`sendControlMessage(): Attempted to send a message on a connection does not have a websocket`);
            return;
        }
        this._ws.send(JSON.stringify(message));
    }

    private _receiveControllMessage(event: RawData): void {
        const data = event.toString() ?? "";
        logger.info(`Received Control message from endpoint ${this.remoteEndpointId}`, data);
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case "hello":
                    this._receiveHelloFeedback(message);
                    break;
                case "close":
                    this._receiveCloseCommand(message);
                    break;
                default:
                    logger.warn(`Unrecognized feedback message`, message);
            }
        } catch (err) {
            logger.error(`Error occurred while parsing feedback`, data);
        }
    }

    protected abstract _receiveHelloFeedback(feedback: HelloFeedback): void;
    protected abstract _receiveCloseCommand(command: CloseCommand): void;
}

class Connector extends Connection {
    public readonly role = "connector";
    public readonly wsAddress: string;
    private _remoteEndpointId?: string;
    private _resolve?: () => void;
    private _reject?: (err: any) => void;
    constructor(emitter: EventEmitter, wsAddress: string) {
        super(emitter);
        this.wsAddress = wsAddress;
    }

    public get remoteEndpointId(): string | undefined {
        return this._remoteEndpointId;
    }

    public async connect(): Promise<void> {
        logger.info(`Connecting to ${this.wsAddress}`);
        const ws = await this._connect(this.wsAddress);
        this.setupWs(ws);
        return new Promise<void>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = (err) => {
                this.close();
                reject(err);
            };
        }).finally(() => {
            this._resolve = undefined;
            this._reject = undefined
        });
        // logger.info(`Connected to ${this.wsAddress}`);
        // this._emitter.emit(CONNECTION_READY_EVENT_NAME, this.remoteEndpointId);
        // logger.info(`Connected socket make connection to ${this.remoteEndpointId} READY`);
    }

    private async _connect(wsAddress: string, tried?: number): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, reject) => {
            const websocket = new WebSocket(wsAddress);
            if (websocket.readyState === WebSocket.OPEN) {
                resolve(websocket);
                return;
            }
            websocket.once("open", () => {
                resolve(websocket);
            }).once("error", err => {
                reject(err);
            })
        }).catch(async err => {
            logger.warn(`Error while trying to connect to ${wsAddress}. Tried: ${tried ?? 0}`, err);
            await new Promise<void>(resolve => setTimeout(resolve, 5000));
            return this._connect(wsAddress, (tried ?? 0) + 1);
        });
    }

    protected _receiveHelloFeedback(feedback: HelloFeedback): void {
        if (!feedback.remoteEndpointId) {
            logger.warn(`Received hello feedback without remote endpoint id`);
            return;
        }
        if (!this._remoteEndpointId) {
            this._remoteEndpointId = feedback.remoteEndpointId;
        }
        if (this._resolve) {
            this._resolve();
        }
    }

    protected _receiveCloseCommand(command: CloseCommand): void {
        if (!this._reject) {
            logger.warn(`A Close command is received by a Connector, but there is no reject function to reject the connection`);
            return;
        }
        this._reject(command.message);
    }
}

class Acceptor extends Connection {
    readonly role = "acceptor";
    public readonly remoteEndpointId: string;
    // public readonly hostname: string;
    // public readonly port: number;

    constructor(emitter: EventEmitter, ws: WebSocket, remoteEndpointId: string) {
        super(emitter);
        this.remoteEndpointId = remoteEndpointId;
        this.setupWs(ws);
    }

    protected _receiveHelloFeedback(feedback: HelloFeedback): void {
        // not used here
    }

    protected _receiveCloseCommand(command: CloseCommand): void {
        // not used here
    }
}
