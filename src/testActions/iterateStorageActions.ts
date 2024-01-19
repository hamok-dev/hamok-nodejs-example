import { assertEquals } from "../common/asserts";
import { TestAction } from "../common/test";
import { TestStorage } from "../common/types";

export function createIterateStoragesAction<T extends { storages: TestStorage[] }>(entries: Map<number, string>): TestAction<T> {
	return async (context: T) => {
		const { storages } = context;
			for (let i = 0; i < storages.length; ++i) {
				const storage = storages[i];
				const iteratedItems = new Map<number, string>();
				for await (const [key, value] of storage) {
					iteratedItems.set(key, value);
				}
				for (const [key, expected] of entries) {
					assertEquals(expected, iteratedItems.get(key));
				}
			}
	};
}
