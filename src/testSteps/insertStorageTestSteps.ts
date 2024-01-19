import { assertEquals, assertNotEquals } from "../common/asserts";
import { TestStep, createTestStep, createTestSpecification } from "../common/test";
import { TestStorage } from "../common/types";
import { GridContext } from "../contexts/GridsContext";

export function createAtomicInsertStoragesTestStep<T extends { storages: TestStorage[] } & GridContext>(
	settings: {
		key: number, 
		value: string, 
		storageIndex?: number, 
		excludeStorageIndexes?: number[],
		promiseCommitSync?: boolean,
		stepDescription?: string,
		specDescription?: string,
	}
): TestStep<T> {
	const { 
		key, 
		value, 
		storageIndex = 0,
		excludeStorageIndexes = [], 
		promiseCommitSync = false,
		specDescription,
		stepDescription,
	} = settings;
	const stepDesc = stepDescription ?? `When insert(${key}, ${value}) called on all storages[], excluding: ${excludeStorageIndexes.join(", ")} storages`;
	const specDesc = specDescription ?? `Then insert is atomic`;
	const excludingIndexes = new Set<number>(excludeStorageIndexes);
	return createTestStep<T>(
		stepDesc,
		async (context) => {
			const disposeChange = async () => {
				await storages[storageIndex].delete(key);
			}
			const { storages } = context;
			
			return disposeChange;
		},
		createTestSpecification<T>(
			specDesc,
			async (context) => {
				const { storages, grids } = context;
				
				if (1 < storages.length && promiseCommitSync) {
					await Promise.all(grids
						.filter((_grid, index) => !excludingIndexes.has(index))
						.map(grid => grid.promiseCommitSync(false, 5000))
					);
				}

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
				const promises: Promise<string | undefined>[] = storages
					.filter((_, index) => !excludingIndexes.has(index))
					.map(storage => storage.get(key));
				const values = await Promise.all(promises);
				assertEquals(value, ...values);
			}
		)
	);
}



export function createAtomicInsertAllStoragesTestStep<T extends { storages: TestStorage[] } & GridContext>(
	settings: {
		entries: Map<number, string>, 
		storageIndex?: number, 
		excludeStorageIndexes?: number[],
		promiseCommitSync?: boolean,
		stepDescription?: string,
		specDescription?: string,
	}
): TestStep<T> {
	const { 
		entries,
		storageIndex = 0,
		excludeStorageIndexes = [], 
		promiseCommitSync = false,
		specDescription,
		stepDescription,
	} = settings;
	const stepDesc = stepDescription ?? `When insertAll( ${entries.size} entries) called on all storages[], excluding: ${excludeStorageIndexes.join(", ")} storages`;
	const specDesc = specDescription ?? `Then insertAll is atomic`;
	const excludingIndexes = new Set<number>(excludeStorageIndexes);
	const keys = new Set(entries.keys());
	return createTestStep<T>(
		stepDesc,
		async (context) => {
			const disposeChange = async () => {
				await storages[storageIndex].deleteAll(keys);
			}
			const { storages } = context;
			
			return disposeChange;
		},
		createTestSpecification<T>(
			specDesc,
			async (context) => {
				const { storages, grids } = context;
				
				if (1 < storages.length && promiseCommitSync) {
					await Promise.all(grids
						.filter((_grid, index) => !excludingIndexes.has(index))
						.map(grid => grid.promiseCommitSync(false, 5000))
					);
				}
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
		)
	);
}
