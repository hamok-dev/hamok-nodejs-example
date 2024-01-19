import { assertEquals } from "../common/asserts";
import { TestAction } from "../common/test";
import { TestStorage } from "../common/types";

export function createCheckKeysFromAllStoragesAction<T extends { storages: TestStorage[] }>(storageIndex = 0): TestAction<T> {
	return async (context: T) => {
		const { storages } = context;
		if (storages.length < 1) return;
		const keys = new Set<number>(await storages[0].keys());
		assertEquals(await storages[storageIndex].size(), keys.size);
	};
}
