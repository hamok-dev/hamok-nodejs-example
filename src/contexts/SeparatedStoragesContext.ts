
import { createCodec, SeparatedStorage, SeparatedStorageConfig } from "@hamok-dev/hamok-js-core";
import { TestContext } from "../common/test";
import { GridContext } from "./GridsContext";

export type SeparatedStorageContext = GridContext & {
	storages: SeparatedStorage<number, string>[],
}


export async function createSepratedStorageContext(
	input: GridContext, 
	providedConfig?: Partial<SeparatedStorageConfig>
): Promise<TestContext<SeparatedStorageContext>> {
	const config: Partial<SeparatedStorageConfig> = Object.assign({
		storageId: 'separated-test-storage',
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
	
	const storages: SeparatedStorage<number, string>[] = [];
	for (const grid of grids) {
		const storage = grid.createSeparatedStorage<number, string>()
			.withKeyCodec(numCodec)
			.withValueCodec(strCodec)
			.withConfig(config)
			.build() as unknown as SeparatedStorage<number, string>;
		storages.push(storage);
	}

	const dispose = async () => {
		await Promise.all(
			storages.map(storage => storage.clear)
		)
	}

	const context: SeparatedStorageContext = {
		grids,
		storages,
		router,
	}

	return {
		context,
		dispose
	}
}