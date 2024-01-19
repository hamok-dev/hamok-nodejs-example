import { assertEquals } from "../common/asserts";
import { TestAction } from "../common/test";
import { TestStorage } from "../common/types";

export function createIsStoragesEmptyAction<T extends { storages: TestStorage[] }>(expected = true): TestAction<T> {
	return async (context: T) => {
		const { storages } = context;
		const isEmptyArray = await Promise.all(storages.map(storage => storage.isEmpty()));
		assertEquals(expected, ...isEmptyArray);
	};
}