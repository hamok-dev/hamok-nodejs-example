import { UseContext } from "../common/test";
import { TestStorage } from "../common/types";
import { GridContext } from "./GridsContext";

export function useUpdateStoragesContext<T extends { storages: TestStorage[] } & GridContext>(settings: {
	key: number, 
	value: string, 
	storageIndex?: number,
	changeBack?: boolean,
	promiseCommitSync?: boolean,
}): UseContext<T> {
	const { key, value, storageIndex = 0, changeBack = true, promiseCommitSync = false } = settings;

	return async (context: T) => {
		const { storages, grids } = context;
		const dispose = async () => {
			if (!changeBack) return;
			await storages[storageIndex].delete(key);
		};
		if (promiseCommitSync) {
			await Promise.all(grids.map(grid => grid.promiseCommitSync(false,  2000)));
		}

		await storages[storageIndex].set(key, value);
		return dispose;
	}
}

export function useUpdateAllStoragesContext<T extends { storages: TestStorage[] } & GridContext>(settings: {
	entries: Map<number, string>,
	storageIndex?: number,
	changeBack?: boolean,
	promiseCommitSync?: boolean,
}): UseContext<T> {
	const { entries, storageIndex = 0, changeBack = true, promiseCommitSync = false } = settings;

	return async (context: T) => {
		const { storages, grids } = context;
		const dispose = async <T>(context: T) => {
			if (!changeBack) return;
			const keys = new Set<number>(Array.from(entries.keys()));
			await storages[storageIndex].deleteAll(keys);
		};
		if (promiseCommitSync) {
			await Promise.all(grids.map(grid => grid.promiseCommitSync(false,  2000)));
		}
		await storages[storageIndex].setAll(entries);
		return dispose;
	}
}
