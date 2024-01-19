import { assertEquals } from "../common/asserts";
import { TestAction } from "../common/test";
import { TestStorage } from "../common/types";

export function createCheckAllStoragesSizeAction<T extends { storages: TestStorage[] }>(expected = 0): TestAction<T> {
	return async (context: T) => {
		const { storages } = context;
		const sizes = await Promise.all(storages.map(storage => storage.size()));
		assertEquals(expected, ...sizes);
	};
}
