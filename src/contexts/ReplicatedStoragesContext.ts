
import { createCodec, ReplicatedStorage, ReplicatedStorageConfig, SeparatedStorage } from "@hamok-dev/hamok-js-core";
import { TestContext } from "../common/types";
import { GridContext } from "./GridsContext";

export type ReplicatedStorageContext = GridContext & {
	storages: ReplicatedStorage<number, string>[],
}


export async function createReplicatedStorageContext(
	input: GridContext, 
	providedConfig?: Partial<ReplicatedStorageConfig>
): Promise<TestContext<ReplicatedStorageContext>> {
	const config: Partial<ReplicatedStorageConfig> = Object.assign({
		storageId: 'replicated-test-storage',
	}, providedConfig ?? {});
	
	const strCodec = createCodec<string, Uint8Array>(
		input => Buffer.from(input, "utf-8"),
		input => Buffer.from(input).toString("utf-8")
	);
	
	const numCodec = createCodec<number, Uint8Array>(
		input => Buffer.from(`${input}`, "utf-8"),
		input => Number.parseFloat(Buffer.from(input).toString("utf-8"))
	);
	
	const { grids, router } = input;
	
	const storages: ReplicatedStorage<number, string>[] = [];
	for (const grid of grids) {
		const storage = grid.createReplicatedStorage<number, string>()
			.withKeyCodec(numCodec)
			.withValueCodec(strCodec)
			.withConfig(config)
			.build();
		storages.push(storage);
	}

	const dispose = async () => {
		if (storages.length < 1) return;
		const storageId = storages[0].id;
		await Promise.all(
			storages.map(storage => storage.clear())
		);
		await Promise.all(
			grids.map(grid => grid.removeStorageLink(storageId))
		);
		// await storages[0].insert(1, `key`);
	}

	const context: ReplicatedStorageContext = {
		grids,
		storages,
		router,
	}

	return {
		context,
		dispose
	}
}