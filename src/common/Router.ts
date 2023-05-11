import { HamokGrid, Message } from "@hamok-dev/hamok-js-core";

export type RouterConfig = {
	minTickTimeInMs: number,
	maxTickTimeInMs: number,
	lossProbability: number,
}

export class Router {
	private _routes = new Map<string, {
		grid: HamokGrid,
		connected: boolean,
	}>();
	public readonly config: RouterConfig;

	private _closed = false;
	private _timer?: ReturnType<typeof setTimeout>;
	private _buffer: Message[] = [];
	public constructor(
		providedConfig?: Partial<RouterConfig>
	) {
		this.config = Object.assign({
			minTickTimeInMs: -1,
			maxTickTimeInMs: -1,
			lossProbability: -1,
		}, providedConfig ?? {});

		if (0 < this.config.minTickTimeInMs) {
			this._tick();
		}
	}

	public close() {
		if (this._closed) {
			return;
		}
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = undefined;
		}
		this._closed = true;
	}

	public add(grid: HamokGrid): void {
		// console.info(`Add Grid ${grid.localEndpointId} to Router`);
		for (const { grid: remoteGrid } of this._routes.values()) {
			if (grid.localEndpointId === remoteGrid.localEndpointId) continue;
			remoteGrid.addRemoteEndpointId(grid.localEndpointId);
			grid.addRemoteEndpointId(remoteGrid.localEndpointId);
		}
		this._routes.set(
			grid.localEndpointId, {
				grid,
				connected: true
			}
		);
		grid.transport.sender = message => this._send(message);
	}

	private _send(message: Message) {
		if (!this._timer) {
			this._dispatch(message);
			return;
		}
		this._buffer.push(message);
	}

	public remove(endpointId: string): void {
		// console.info(`Remove Grid ${endpointId} from Router`);
		const route = this._routes.get(endpointId);
		if (!route) return;
		const { grid } = route;
		this._routes.delete(endpointId);
		for (const { grid: remoteGrid } of this._routes.values()) {
			if (grid.localEndpointId === remoteGrid.localEndpointId) continue;
			remoteGrid.removeRemoteEndpointId(grid.localEndpointId);
			grid.removeRemoteEndpointId(remoteGrid.localEndpointId);
		}
		grid.transport.sender = undefined;
	}

	public reconnect(endpointId: string): boolean {
		const route = this._routes.get(endpointId);
		if (!route || route.connected) return false;
		route.connected = true;
		return true;
	}
	
	public disconnect(endpointId: string): boolean {
		const route = this._routes.get(endpointId);
		if (!route || !route.connected) return false;
		route.connected = false;
		return true;
	}

	private _tick() {
		this._buffer.forEach(message => this._dispatch(message));
		this._buffer = [];
		const nextTick = Math.random() * (this.config.maxTickTimeInMs - this.config.minTickTimeInMs) + this.config.minTickTimeInMs;
		this._timer = setTimeout(() => this._tick(), nextTick);
	}

	private _dispatch(message: Message) {
		if (0 < this.config.lossProbability) {
			if (Math.random() < this.config.lossProbability) {
				return;
			}
		}
		if (this._routes.get(message.sourceId ?? "notExists")?.connected === false) {
			return;
		}
		if (!message.destinationId || !this._routes.has(message.destinationId)) {
			for (const [endpointId, route] of this._routes.entries()) {
				if (message.sourceId === endpointId || route.connected === false) {
					continue;
				}
				route.grid.transport.receive(message);
			}
			return;
		}
		const target = this._routes.get(message.destinationId);
		if (!target || target.connected === false) {
			// console.warn(`cannot find target`, message.destinationId);
			return;
		}
		// console.log("dispatch3", message.sourceId, message.destinationId, message.type);
		target.grid.transport.receive(message);
	}
}
