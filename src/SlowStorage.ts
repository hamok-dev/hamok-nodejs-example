import { SimpleStorageAbstract, StorageEvents } from "@hamok-dev/hamok-js-core";
import { Collections } from "../../hamok-js-core/node_modules/@hamok-dev/common/lib";

const sleep = (delayInMs: number) => new Promise(resolve => setTimeout(resolve, delayInMs));
const sleepInRange = (min: number, max: number) => {
    const value = Math.ceil(Math.random() * (max - min) + min);
    return sleep(value);
};

export class SlowStorage extends SimpleStorageAbstract<number, string> {
    private _entries = new Map<number, string>();
    public constructor(id: string) {
        super(id)
    }

    public async size(): Promise<number> {
        await sleepInRange(500, 1000);
        return this._entries.size;
    }

    public async isEmpty(): Promise<boolean> {
        await sleepInRange(500, 1000);
        return this._entries.size === 0;
    }
    
    public async keys(): Promise<ReadonlySet<number>> {
        await sleepInRange(500, 1000);
        return new Set<number>(this._entries.keys());
    }
    
    public async clear(): Promise<void> {
        await sleepInRange(500, 1000);
        this._entries.clear();
    }
    
    public async getAll(keys: ReadonlySet<number>): Promise<ReadonlyMap<number, string>> {
        await sleepInRange(2000, 5000);
        return Collections.collectEntriesByKeys(
            this._entries,
            keys
        );
    }
    
    protected async create(entries: ReadonlyMap<number, string>): Promise<void> {
        for (const [key, value] of entries) {
            this._entries.set(key, value);
        }
    }
    protected async update(entries: ReadonlyMap<number, string>): Promise<void> {
        for (const [key, value] of entries) {
            this._entries.set(key, value);
        }
    }
    protected async remove(keys: ReadonlySet<number>): Promise<void> {
        for (const key of keys) {
            this._entries.delete(key);
        }
    }
    
    public async *[Symbol.asyncIterator](): AsyncIterableIterator<[number, string]> {
        return this._entries.entries();
    }
}