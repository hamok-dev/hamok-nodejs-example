import { assertEquals } from "../common/asserts";
import { TestAction } from "../common/test";
import { TestStorage } from "../common/types";
import { GridContext } from "../contexts/GridsContext";
import { grid } from "../purgatory/HamokService";

export function createGetFromStorageAction<T extends { storages: TestStorage[] } & GridContext>(settings: {
	key: number,
	expectedValue?: string,
	excludingStorageIndexes?: number[],
	promiseCommitSync?: boolean,
}): TestAction<T> {
	const {
		key,
		expectedValue,
		excludingStorageIndexes = [],
		promiseCommitSync = false,
	} = settings;
	const excludingIndexes = new Set<number>(excludingStorageIndexes);
	return async (context: T) => {
		const { storages, grids } = context;
		if (promiseCommitSync) {
			await Promise.all(grids
				.filter((_, index) => !excludingIndexes.has(index))
				.map(grid => grid.promiseCommitSync(false, 2000))
			);
		}

		const actuals = await Promise.all(storages
			.filter((_, index) => !excludingIndexes.has(index))
			.map(storage => storage.get(key))
		);

		assertEquals(expectedValue, ...actuals);
	};
}

export function createGetAllFromStorageAction<T extends { storages: TestStorage[] } & GridContext>(settings: {
	entries: Map<number, string>,
	excludingStorageIndexes?: number[],
	promiseCommitSync?: boolean,
}): TestAction<T> {
	const {
		entries,
		excludingStorageIndexes = [],
		promiseCommitSync = false,
	} = settings;
	const keys = new Set(entries.keys());
	const excludingIndexes = new Set<number>(excludingStorageIndexes);
	return async (context: T) => {
		const { storages, grids } = context;
		if (promiseCommitSync) {
			await Promise.all(grids
				.filter((_, index) => !excludingIndexes.has(index))
				.map(grid => grid.promiseCommitSync(false, 2000))
			);
		}

		const actualsArray = await Promise.all(storages
			.filter((_, index) => !excludingIndexes.has(index))
			.map(storage => storage.getAll(keys))
		);
		for (const actuals of actualsArray) {
			for (const [key, actual] of actuals.entries()) {
				assertEquals(entries.get(key), actual);
			}
			for (const [key, expected] of entries.entries()) {
				assertEquals(expected, entries.get(key));
			}
		}
	};
}
