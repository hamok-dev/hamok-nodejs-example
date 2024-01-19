import { UseContext } from "../common/test";
import { TestStorage } from "../common/types";
import { GridContext } from "./GridsContext";


export function useDeleteFromStoragesContext<T extends { storages: TestStorage[] } & GridContext>(settings: {
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

export function useDeleteAllFromStoragesContext<T extends { storages: TestStorage[] } & GridContext>(settings: {
	keys: Set<number>, 
	storageIndex?: number,
	promiseCommitSync?: boolean,
}): UseContext<T> {
	const { keys, storageIndex = 0, promiseCommitSync = false } = settings;

	return async (context: T) => {
		const { storages, grids } = context;
		const dispose = async () => {
			
		};
		if (promiseCommitSync) {
			await Promise.all(grids.map(grid => grid.promiseCommitSync(false,  2000)));
		}

		await storages[storageIndex].deleteAll(keys);
		return dispose;
	}
}