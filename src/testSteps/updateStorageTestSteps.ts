import { assertEquals } from "../common/asserts";
import { TestStep, createTestStep, createTestSpecification } from "../common/test";
import { TestStorage } from "../common/types";
import { GridContext } from "../contexts/GridsContext";

export function createUpdateStoragesTestStep<T extends { storages: TestStorage[] } & GridContext>(
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
	const stepDesc = stepDescription ?? `When update(${key}, ${value}) called on storages[${storageIndex}], excluding: ${excludeStorageIndexes.join(", ")} storages`;
	const specDesc = specDescription ?? `Then get(${key}) returns ${value} from all storages except: ${excludeStorageIndexes.join(", ")}`;
	const excludingIndexes = new Set<number>(excludeStorageIndexes);
	return createTestStep<T>(
		stepDesc,
		async (context) => {
			const disposeChange = async () => {
				await storages[storageIndex].delete(key);
			}
			const { storages } = context;
			
			if (storages.length < 1) return disposeChange;

			await storages[storageIndex].set(key, value);
			
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
	
				const promises: Promise<string | undefined>[] = storages
					.filter((_, index) => !excludingIndexes.has(index))
					.map(storage => storage.get(key));
				const values = await Promise.all(promises);
				assertEquals(value, ...values);
			}
		)
	);
}


export function createUpdateAllStoragesTestStep<T extends { storages: TestStorage[] } & GridContext>(
	settings: {
		entries: Map<number, string>,
		storageIndex?: number, 
		excludeStorageIndexes?: number[],
		promiseCommitSync?: boolean,
		specDescription?: string,
		stepDescription?: string,
	}
): TestStep<T> {
	const { 
		entries, 
		storageIndex = 0,
		excludeStorageIndexes = [], 
		promiseCommitSync = false,
		specDescription,
		stepDescription
	} = settings;
	const keys = new Set(entries.keys());
	const stepDesc = stepDescription ?? `When updateAll( ${entries.size} entries ) called on storages[${storageIndex}], excluding: ${excludeStorageIndexes.join(", ")} storages`;
	const specDesc = specDescription ?? `Then getAll( ${keys.size} entries) returns the expected values from all storages except: ${excludeStorageIndexes.join(", ")}`;
	const excludingIndexes = new Set<number>(excludeStorageIndexes);
	return createTestStep<T>(
		stepDesc,
		async (context) => {
			const disposeChange = async () => {
				await storages[storageIndex].deleteAll(keys);
			}
			const { storages } = context;
			
			if (storages.length < 1) return disposeChange;

			await storages[storageIndex].setAll(entries);
			
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
				const retrievedEntries = await Promise.all(
					storages
						.filter((_v, index) => excludingIndexes.has(index) === false)
						.map(storage => storage.getAll(keys))
				);
				for (const [key, expected] of entries.entries()) {
					for (const actuals of retrievedEntries) {
						assertEquals(expected, actuals.get(key));
					}
				}
			}
		)
	);
}