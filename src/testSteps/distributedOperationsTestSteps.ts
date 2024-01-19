import { HamokGrid } from "@hamok-dev/hamok-js-core";
import { stringify } from "uuid";
import { createTestSpecification, createTestStep, TestStep } from "../common/test";
import { TestStorage } from "../common/types";
import { GridContext } from "../contexts/GridsContext";



// export function createGetFromStoragesTest<T extends { storages: TestStorage[] }>(key: number, expected: string): TestStep<T> {
// 	return {
// 		description: `get(${key}) returns ${expected} from all storages`,
// 		execute: async context => {
// 			const { storages } = context;
// 			for (let i = 0; i < storages.length; ++i) {
// 				const storage = storages[i];
// 				assertEquals(expected, await storage.get(key));
// 			}
// 		}
// 	}
// }


// export function createGetAllFromStoragesTest<T extends { storages: TestStorage[] }>(entries: Map<number, string>): TestStep<T> {
// 	return {
// 		description: `getAll( ${entries.size} entries ) retrieves all expected items`,
// 		execute: async context => {
// 			// console.warn("expected entries", entries);
// 			const { storages } = context;
// 			const keys = new Set<number>(entries.keys());
// 			for (let i = 0; i < storages.length; ++i) {
// 				const storage = storages[i];
// 				const actuals = await storage.getAll(keys);
// 				for (const [key, actual] of actuals.entries()) {
// 					// console.warn(i, entries.get(key), actual)
// 					assertEquals(entries.get(key), actual);
// 				}
// 				for (const [key, expected] of entries.entries()) {
// 					assertEquals(expected, entries.get(key));
// 				}
// 			}
// 		}
// 	}
// }


// export function createIsStoragesEmptyTest<T extends { storages: TestStorage[] }>(expected = true): TestStep<T> {
// 	return {
// 		description: `isEmpty() returns ${expected}`,
// 		execute: async context => {
// 			const { storages } = context;
// 			const isEmptyArray = await Promise.all(storages.map(storage => storage.isEmpty()));
// 			assertEquals(expected, ...isEmptyArray);
// 		}
// 	}
// }


// export function createIterateStoragesTest<T extends { storages: TestStorage[] }>(entries: Map<number, string>): TestStep<T> {
// 	return {
// 		description: `iterator() iterate through all items`,
// 		execute: async context => {
// 			const { storages } = context;
// 			for (let i = 0; i < storages.length; ++i) {
// 				const storage = storages[i];
// 				const iteratedItems = new Map<number, string>();
// 				for await (const [key, value] of storage) {
// 					iteratedItems.set(key, value);
// 				}
// 				for (const [key, expected] of entries) {
// 					assertEquals(expected, iteratedItems.get(key));
// 				}
// 			}
// 		}
// 	}
// }

// export function createCheckAllStoragesSizeTest<T extends { storages: TestStorage[] }>(expected = 0): TestStep<T> {
// 	return {
// 		description: `size() of storages are equal to ${expected}`,
// 		execute: async context => {
// 			const { storages } = context;
// 			const sizes = await Promise.all(storages.map(storage => storage.size()));
// 			assertEquals(expected, ...sizes);
// 		}
// 	}
// }


// export function createUpdateStoragesTestStep<T extends { storages: TestStorage[] } & GridContext>(
// 	settings: {
// 		key: number, 
// 		value: string, 
// 		storageIndex?: number, 
// 		excludeStorageIndexes?: number[],
// 	}
// ): TestStep<T> {
// 	const { key, value, storageIndex = 0, excludeStorageIndexes = [] } = settings;
// 	return createTestStep<T>(
// 		`When update(${key}, ${value}) called on storages[${storageIndex}], excluding: ${excludeStorageIndexes.join(", ")} storages`,
// 		async (context) => {

// 			return async (context) => {

// 			}
// 		},
// 		createTestSpecification<T>(
// 			`Then get(${key}) returns ${value} from all storages except: ${excludeStorageIndexes.join(", ")}`,
// 			async (context) => {

// 			}
// 		)
// 	);
// }


// export function createDeleteFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(key: number, storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `delete(${key}) from one storage deletes from all storages`,
// 		execute: async context => {
// 			const { storages, grids } = context;
// 			if (storages.length < 1) return;
// 			storages[storageIndex].delete(key);
// 			if (1 < storages.length) {
// 				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
// 			}
// 			const values = await Promise.all(
// 				storages.map(storage => storage.get(key))
// 			);
// 			assertEquals(true, values.every(value => value === undefined));
// 		}
// 	}
// }

// export function createDeleteAllFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(keys: IterableIterator<number>, storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `deleteAll( ${Array.from(keys).length} keys) delete key, value from all storages`,
// 		execute: async context => {
// 			const { storages, grids } = context;
// 			if (storages.length < 1) return;
// 			storages[storageIndex].deleteAll(new Set<number>(keys));
// 			if (1 < storages.length) {
// 				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
// 			}
// 			const entries = await Promise.all(
// 				storages.map(storage => storage.getAll(new Set<number>(keys)))
// 			);
// 			assertEquals(true, entries.every(map => map.size === 0));
// 		}
// 	}
// }

// export function createEvictFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(key: number, storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `evict(${key}) evicts entry from all storages`,
// 		execute: async context => {
// 			const { storages, grids } = context;
// 			if (storages.length < 1) return;
// 			storages[storageIndex].evict(key);
// 			if (1 < storages.length) {
// 				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
// 			}
// 			const values = await Promise.all(
// 				storages.map(storage => storage.get(key))
// 			);
// 			assertEquals(true, values.every(value => value === undefined));
// 		}
// 	}
// }

// export function createEvictAllFromStoragesTest<T extends { storages: TestStorage[] } & GridContext>(keys: Set<number>, storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `evictAll( ${keys.size} items ) evicts entries from all storages`,
// 		execute: async context => {
// 			const { storages, grids } = context;
// 			if (storages.length < 1) return;

// 			await storages[storageIndex].evictAll(keys);

// 			if (1 < storages.length) {
// 				await Promise.all(grids.map(grid => grid.promiseCommitSync()))
// 			}
// 			const maps = await Promise.all(
// 				storages.map(storage => storage.getAll(keys))
// 			);
// 			assertEquals(0, ...maps.map(map => map.size));
// 		}
// 	}
// }

// export function createRestoreStoragesTest<T extends { storages: TestStorage[] }>(key: number, value: string, storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `restore(${key}, ${value}) in all storage`,
// 		execute: async context => {
// 		  const { storages } = context;

// 		  await storages[storageIndex].restore(key, value);

// 		  const values = await Promise.all(storages.map(storage => storage.get(key)));
// 		  assertEquals(true, values.every(storedValue => storedValue === value));
// 		},
// 	  };
// }


// export function createRestoreAllStoragesTest<T extends { storages: TestStorage[] }>(entries: Map<number, string>, storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `restoreAll( ${entries.size} entries ) to all storages`,
// 		execute: async context => {
// 		  const { storages } = context;

// 		  await storages[storageIndex].restoreAll(entries);

// 		  const keys = new Set<number>(entries.keys());
// 		  const maps = await Promise.all(storages.map(storage => storage.getAll(keys)));
// 		  assertEquals(entries.size, ...maps.map(map => map.size));
// 		},
// 	  };
// }

// export function createClearFromStorages<T extends { storages: TestStorage[] }>(storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `clear() removes all items from all storages`,
// 		execute: async context => {
// 		  const { storages } = context;

// 		  await storages[storageIndex].clear();
		  
// 		  const keys = await Promise.all(storages.map(storage => storage.keys()));
// 		  assertEquals(true, keys.every(keySet => keySet.size === 0));
// 		},
// 	  };
// }

// export function createCheckKeysFromAllStorages<T extends { storages: TestStorage[] }>(storageIndex = 0): TestStep<T> {
// 	return {
// 		description: `keys() returns the key from all storages`,
// 		execute: async context => {
// 			const { storages } = context;
// 			if (storages.length < 1) return;
// 			const keys = new Set<number>(await storages[0].keys());
// 			assertEquals(await storages[storageIndex].size(), keys.size);
// 		}
// 	}
// }
