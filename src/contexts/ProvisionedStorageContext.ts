
import { HamokGrid, Storage } from "@hamok-dev/hamok-js-core";
import { TestContext, TestMap, TestStorage } from "../common/types";

export type ProvisionedStorageContext<TContext extends { storages: TestStorage[] }> = TContext & {
	addedItems: TestMap[]
}

export async function provisionStorageContext<TContext extends { storages: TestStorage[], grids: HamokGrid[] }>(
	context: TContext,
	addedItems?: TestMap[],
): Promise<TestContext<ProvisionedStorageContext<TContext>>> {

	const { storages, grids } = context;
	if (!addedItems) {
		addedItems = [];
		for (let i=0; i < storages.length; ++i) {
			const map = new Map<number, string>();
			for (let i = 0; i < 10; ++i) {
				const num = Math.random();
				map.set(num, `${num}`);
			}
			addedItems.push(map);
		}
	}
	for (let i = 0; i < storages.length; ++i) {
		const storage = storages[i];
		const map = addedItems[i];
		await storage.setAll(map);
	}

	if (1 < grids.length) {
		await Promise.all(grids.map(grid => grid.promiseCommitSync(3000)));
	}

	const dispose = async () => {

		for (let i=0; i < storages.length; ++i) {
			const storage = storages[i];
			const map = addedItems![i];
			await storage.deleteAll(new Set<number>(map.keys()));
		}
	}

	return {
		context: {
			...context,
			addedItems
		},
		dispose
	}
}