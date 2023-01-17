import { EventEmitter, WebSocketServer, WebSocket } from "ws";
import * as http from 'http';
import { createLogger } from "@hamok-dev/hamok-js-core";
import * as url from "url";
// import * as Connections from "./Connections";

const logger = createLogger("Server");

// const httpRoutes = new EventEmitter();
// const PORT = config.getPort();
// let state: State = "idle";
// let httpServer: http.Server | undefined = undefined;
// let wsServer: WebSocketServer | undefined = undefined;
const SOCKET_TO_REMOTE_ENDPOINT_EVENT_NAME = "SOCKET_TO_REMOTE_ENDPOINT";
const STATE_CHANGED_EVENT_NAME = "STATE_CHANGED_EVENT_NAME";

type State = "idle" | "started" | "run" | "stopped" | "failed";
export type StateChangedEvent = {
    prevState: State,
    actualState: State,
}
export type StateChangedEventListener = (event: StateChangedEvent) => void;
export type SocketToRemoteEndpointListener = (ws: WebSocket, remoteEndpointId: string) => void;
export type HttpRouteListener = (request: http.IncomingMessage, response: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}) => void;


export class Server {
    public readonly port: number;
    private _httpRoutes = new EventEmitter();
    private _events = new EventEmitter();
    private _state: State = "idle";
    private _httpServer?: http.Server;
    private _wsServer?: WebSocketServer;
    
    public constructor(port: number) {
        this.port = port;
    }

    public get state(): State {
        return this._state;
    }

    public onWebSocketToRemoteEndpoint(listener: SocketToRemoteEndpointListener): this {
        this._events.on(SOCKET_TO_REMOTE_ENDPOINT_EVENT_NAME, listener);
        return this;
    }

    public offWebSocketToRemoteEndpoint(listener: SocketToRemoteEndpointListener): this {
        this._events.off(SOCKET_TO_REMOTE_ENDPOINT_EVENT_NAME, listener);
        return this;
    }

    public onHttpRoute(path: string, listener: HttpRouteListener): this {
        this._httpRoutes.on(path, listener);
        return this;
    }

    public offHttpRoute(path: string, listener: HttpRouteListener): this {
        this._httpRoutes.off(path, listener);
        return this;
    }

    public onStateChanged(listener: StateChangedEventListener): this {
        this._events.on(STATE_CHANGED_EVENT_NAME, listener);
        return this;
    }

    public offStateChanged(listener: StateChangedEventListener): this {
        this._events.off(STATE_CHANGED_EVENT_NAME, listener);
        return this;
    }

    public async start(): Promise<void> {
        this._setState("started");
        this._httpServer = await this._createHttpServer();
        this._wsServer = await this._createWsServer(this._httpServer!);
        await new Promise<void>(resolve => {
            this._httpServer!.listen(this.port, () => {
                logger.info(`Listening on ${this.port}`);
                resolve();
            });
        }).catch(err => {
            logger.error(`Error occurred while start servers`);
            this._abort();
            throw err;
        });
        this._setState("run");
    }

    public async stop(): Promise<void> {
        if (this.state !== "run") {
            logger.warn(`Attempted to stop a server in ${this.state} state. It must be in "run" state to perform stop.`);
            return;
        }
        this._setState("stopped");
        if (this._wsServer) {
            await new Promise<void>(resolve => {
                this._wsServer!.close(err => {
                    if (err) {
                        logger.warn(`Error while stopping websocket server`, err);
                    }
                    resolve();
                });
            }).catch(err => {
                logger.warn(`Error occurred while stopping websocket server`, err);
            });
            this._wsServer = undefined;
        }
        if (this._httpServer) {
            await new Promise<void>(resolve => {
                this._httpServer!.close(err => {
                    if (err) {
                        logger.warn(`Error while stopping http server server`, err);
                    }
                    resolve();
                });
            }).catch(err => {
                logger.warn(`Error occurred while stopping http server`, err);
            });
            this._httpServer = undefined;
        }
        this._setState("idle");
    }

    private async _createHttpServer(): Promise<http.Server> {
        const result = http.createServer({
            maxHeaderSize: 8192,
            insecureHTTPParser: false,
        });
        result.on('request', (request, response) => {
            const url = request?.url;
            if (url === undefined) {
                return;
            }
            // const parts = request!.url!.split("/");
            // const resource = parts.length < 2 ? undefined : parts[1];
            if (0 < this._httpRoutes.listenerCount(url)) {
                this._httpRoutes.emit(url, request, response);
            } else {
                logger.warn(`No http route for url ${url}`);
            }
        });
        result.on("error", err => {
            logger.error(`Server encountered an error`, err);
            this._abort();
            throw err;
        });
        return result;
    }

    private async _createWsServer(httpServer?: http.Server): Promise<WebSocketServer> {
        const wsServer = new WebSocketServer({
            server: httpServer,
        });
        // const sockets = new Map<string, WebSocket>();
        wsServer.on('connection', async (ws, req) => {
            // console.warn("\n\n", url.parse(req.url, true).query, "\n\n");
            // const query = url.parse(req.url, true).query;
            const query = req.url ? url.parse(req.url, true).query : {};
            logger.info(`Websocket connection is requested from ${req.socket.remoteAddress}, query:`, query);
            const remoteEndpointId = query.remoteEndpointId as string;
            if (!remoteEndpointId) {
                logger.warn(`No remoteEndpointId was in the query string connecting to this websserver`);
                return;
            }
            this._events.emit(SOCKET_TO_REMOTE_ENDPOINT_EVENT_NAME, ws, remoteEndpointId);
        });
        wsServer.on('error', error => {
            logger.error("Error occurred on websocket server", error);
            this._abort();
        });
        wsServer.on('headers', obj => {
            logger.info("Headers on websocket server", obj);
        });
        wsServer.once('close', () => {
            logger.info("Websocket Server is closed");
        });
        return wsServer;
    }

    private _setState(nextState: State) {
        const prevState = this._state;
        this._state = nextState;
        this._events.emit(STATE_CHANGED_EVENT_NAME, {
            prevState,
            actualState: nextState,
        })
    }

    private _abort(): void {
        this._wsServer?.close();
        this._wsServer = undefined;
        this._httpServer?.close();
        this._httpServer = undefined;
        this._setState("failed");
    }

}

