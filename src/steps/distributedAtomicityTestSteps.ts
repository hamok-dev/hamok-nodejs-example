import { TestStorage, TestStep } from "../common/types";
import { assertNotEquals, assertEquals } from "../common/utils";

export function createInsertAtomicTest<T extends { storages: TestStorage[] }>(key: number, value: string): TestStep<T> {
	return {
		description: `insert(${key}, ${value}) is atomic`,
		execute: async context => {
			const { storages } = context;
			const insertedItems = await Promise.all(
				storages.map(storage => storage.insert(key, value))
			);
			const notNullItems = insertedItems.filter(item => item !== undefined);
			
			assertNotEquals(0, notNullItems.length);
			
			if (storages.length < 3) {
				assertEquals(1, notNullItems.length);
			}
			const insertedItem = notNullItems[0];
			for (const item of notNullItems) {
				assertEquals(insertedItem, item);
			}
		}
	}
}

export function createInsertAllAtomicTest<T extends { storages: TestStorage[] }>(entries: Map<number, string>): TestStep<T> {
	return {
		description: `insertAll( ${entries.size} entries ) is atomic`,
		execute: async context => {
			const { storages } = context;
			const insertedMaps = await Promise.all(
				storages.map(storage => storage.insertAll(entries))
			);
			
			const notNullMaps = insertedMaps.filter(map => 0 < map.size);
			assertNotEquals(0, notNullMaps.length);

			if (storages.length < 3) {
				assertEquals(1, notNullMaps.length);
			}
			const insertedItem = notNullMaps[0].get(1000)!;
			for (const item of notNullMaps) {
				assertEquals(insertedItem, item.get(1000));
			}
		}
	}
}
