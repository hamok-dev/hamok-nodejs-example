import { HamokGrid } from "@hamok-dev/hamok-js-core";
import { TestStep, TestStorage } from "../common/types";
import { assertEquals } from "../common/utils";
import { GridContext } from "../contexts/GridsContext";

export function createGetFromStoragesTest<T extends { storages: TestStorage[] }>(key: number, expected: string): TestStep<T> {
	return {
		description: `get(${key}) returns ${expected} from all storages`,
		execute: async context => {
			const { storages } = context;
			for (let i = 0; i < storages.length; ++i) {
				const storage = storages[i];
				assertEquals(expected, await storage.get(key));
			}
		}
	}
}


export function createGetAllFromStoragesTest<T extends { storages: TestStorage[] }>(entries: Map<number, string>): TestStep<T> {
	return {
		description: `getAll( ${entries.size} entries ) retrieves all expected items`,
		execute: async context => {
			// console.warn("expected entries", entries);
			const { storages } = context;
			const keys = new Set<number>(entries.keys());
			for (let i = 0; i < storages.length; ++i) {
				const storage = storages[i];
				const actuals = await storage.getAll(keys);
				for (const [key, actual] of actuals.entries()) {
					// console.warn(i, entries.get(key), actual)
					assertEquals(entries.get(key), actual);
				}
				for (const [key, expected] of entries.entries()) {
					assertEquals(expected, entries.get(key));
				}
			}
		}
	}
}


export function createIsStoragesEmptyTest<T extends { storages: TestStorage[] }>(expected = true): TestStep<T> {
	return {
		description: `isEmpty() returns ${expected}`,
		execute: async context => {
			const { storages } = context;
			const isEmptyArray = await Promise.all(storages.map(storage => storage.isEmpty()));
			assertEquals(expected, ...isEmptyArray);
		}
	}
}


export function createIterateStoragesTest<T extends { storages: TestStorage[] }>(entries: Map<number, string>): TestStep<T> {
	return {
		description: `iterator() iterate through all items`,
		execute: async context => {
			const { storages } = context;
			for (let i = 0; i < storages.length; ++i) {
				const storage = storages[i];
				const iteratedItems = new Map<number, string>();
				for await (const [key, value] of storage) {
					iteratedItems.set(key, value);
				}
				for (const [key, expected] of entries) {
					assertEquals(expected, iteratedItems.get(key));
				}
			}
		}
	}
}

export function createCheckAllStoragesSizeTest<T extends { storages: TestStorage[] }>(expected = 0): TestStep<T> {
	return {
		description: `size() of storages are equal to ${expected}`,
		execute: async context => {
			const { storages } = context;
			const sizes = await Promise.all(storages.map(storage => storage.size()));
			assertEquals(expected, ...sizes);
		}
	}
}


export function createUpdateStoragesTest<T extends { storages: TestStorage[] } & GridContext>(key: number, value: string, storageIndex = 0, excludeStorageIndexes?: number[]): TestStep<T> {
	return {
		description: `update(${key}, ${value}) updates all storages`,
		execute: async context => {
			const { storages, grids } = context;
			const excludingIndexes = new Set<number>([...(excludeStorageIndexes ?? [])]);
			if (storages.length < 1) return;
			storages[storageIndex].set(key, value);
			// if (1 < storages.length) {
			// 	await Promise.all(grids.map(grid => grid.promiseCommitSync(false, 2000)))
			// }
			const promises: Promise<string | undefined>[] = [];
			let index = -1;
			for (const storage of storages) {
				if (excludingIndexes.has(++index)) continue;
				promises.push(storage.get(key))
			}
			const values = await Promise.all(promises);
			assertEquals(value, ...values);
		}
	}
}

export function createUpdateAllStoragesTest<T extends { storages: TestStorage[] } & GridContext>(entries: Map<number, string>, storageIndex = 0, excludeStorageIndexFromChecking = -1): TestStep<T> {
	return {
		description: `updateAll( ${entries.size} entries ) one stroage, updates all storages`,
		execute: async context => {
			const { storages, grids } = context;
			if (storages.length < 1) return;

			await storages[storageIndex].setAll(entries);

			if (1 < storages.length) {
				await Promise.all(grids.map(grid => grid.promiseCommitSync(false, 2000)))
			}
			const keys = new Set<number>(Array.from(entries.keys()));
			const retrievedEntries = await Promise.all(
				storages.filter((_v, storageIndex) => storageIndex !== excludeStorageIndexFromChecking).map(storage => storage.getAll(keys))
			);
			for (const [key, expected] of entries.entries()) {
				for (const actuals of retrievedEntries) {
					assertEquals(expected, actuals.get(key));
				}
			}
		}
	}
}

export function createDeleteFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(key: number, storageIndex = 0): TestStep<T> {
	return {
		description: `delete(${key}) from one storage deletes from all storages`,
		execute: async context => {
			const { storages, grids } = context;
			if (storages.length < 1) return;
			storages[storageIndex].delete(key);
			if (1 < storages.length) {
				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
			}
			const values = await Promise.all(
				storages.map(storage => storage.get(key))
			);
			assertEquals(true, values.every(value => value === undefined));
		}
	}
}

export function createDeleteAllFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(keys: IterableIterator<number>, storageIndex = 0): TestStep<T> {
	return {
		description: `deleteAll( ${Array.from(keys).length} keys) delete key, value from all storages`,
		execute: async context => {
			const { storages, grids } = context;
			if (storages.length < 1) return;
			storages[storageIndex].deleteAll(new Set<number>(keys));
			if (1 < storages.length) {
				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
			}
			const entries = await Promise.all(
				storages.map(storage => storage.getAll(new Set<number>(keys)))
			);
			assertEquals(true, entries.every(map => map.size === 0));
		}
	}
}

export function createEvictFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(key: number, storageIndex = 0): TestStep<T> {
	return {
		description: `evict(${key}) evicts entry from all storages`,
		execute: async context => {
			const { storages, grids } = context;
			if (storages.length < 1) return;
			storages[storageIndex].evict(key);
			if (1 < storages.length) {
				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
			}
			const values = await Promise.all(
				storages.map(storage => storage.get(key))
			);
			assertEquals(true, values.every(value => value === undefined));
		}
	}
}

export function createEvictAllFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(keys: Set<number>, storageIndex = 0): TestStep<T> {
	return {
		description: `evictAll( ${keys.size} items ) evicts entries from all storages`,
		execute: async context => {
			const { storages, grids } = context;
			if (storages.length < 1) return;

			await storages[storageIndex].evictAll(keys);

			if (1 < storages.length) {
				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
			}
			const maps = await Promise.all(
				storages.map(storage => storage.getAll(keys))
			);
			assertEquals(0, ...maps.map(map => map.size));
		}
	}
}

export function createRestoreStoragesTest<T extends { storages: TestStorage[] }>(key: number, value: string, storageIndex = 0): TestStep<T> {
	return {
		description: `restore(${key}, ${value}) in all storage`,
		execute: async context => {
		  const { storages } = context;

		  await storages[storageIndex].restore(key, value);

		  const values = await Promise.all(storages.map(storage => storage.get(key)));
		  assertEquals(true, values.every(storedValue => storedValue === value));
		},
	  };
}


export function createRestoreAllStoragesTest<T extends { storages: TestStorage[] }>(entries: Map<number, string>, storageIndex = 0): TestStep<T> {
	return {
		description: `restoreAll( ${entries.size} entries ) to all storages`,
		execute: async context => {
		  const { storages } = context;

		  await storages[storageIndex].restoreAll(entries);

		  const keys = new Set<number>(entries.keys());
		  const maps = await Promise.all(storages.map(storage => storage.getAll(keys)));
		  assertEquals(entries.size, ...maps.map(map => map.size));
		},
	  };
}

export function createClearFromStorages<T extends { storages: TestStorage[] }>(storageIndex = 0): TestStep<T> {
	return {
		description: `clear() removes all items from all storages`,
		execute: async context => {
		  const { storages } = context;

		  await storages[storageIndex].clear();
		  
		  const keys = await Promise.all(storages.map(storage => storage.keys()));
		  assertEquals(true, keys.every(keySet => keySet.size === 0));
		},
	  };
}

export function createCheckKeysFromAllStorages<T extends { storages: TestStorage[] }>(storageIndex = 0): TestStep<T> {
	return {
		description: `keys() returns the key from all storages`,
		execute: async context => {
			const { storages } = context;
			if (storages.length < 1) return;
			const keys = new Set<number>(await storages[0].keys());
			assertEquals(await storages[storageIndex].size(), keys.size);
		}
	}
}
