import { HamokGrid } from "@hamok-dev/hamok-js-core";
import { TestContext, UseContext } from "../common/test";

export function useContextNoChange<T>(): UseContext<T> {
	return async () => {
		return async () => {
			// empty
		}
	}
}

export async function combineContexts<SourceContext, TargetContext>(
	createSourceContext: () => Promise<TestContext<SourceContext>>,
	createTargetContext: (input: SourceContext) => Promise<TestContext<TargetContext>>
): Promise<TestContext<TargetContext>> {
	const { context: sourceContext, dispose: sourceDispose } = await createSourceContext();
	const { context, dispose: targetDispose } = await createTargetContext(sourceContext);
	const dispose = async () => {
		await targetDispose();
		await sourceDispose();
	}

	return {
		context,
		dispose
	}
}


export function useEnforcedSleepContext<T>(sleepInMs: number): UseContext<T> {
	return async () => {
		await new Promise(resolve => {
			setTimeout(resolve, sleepInMs);
		})
		return async () => {
			// empty
		}
	}
}

export function useSyncedStorageContext<T extends { grids: HamokGrid[] }>(settings: {
	excludedStorageIndexes?: number[], timeoutInMs?: number
}): UseContext<T> {
	const {
		excludedStorageIndexes = [],
		timeoutInMs = 3000,
	} = settings;
	const excludedIndexes = new Set(excludedStorageIndexes);
	return async (context) => {
		const { grids } = context;
		await Promise.all(grids
			.filter((_, index) => !excludedIndexes.has(index))
			.map(grid => grid.sync(timeoutInMs))
		);
		return async () => {
			// empty
		}
	}
}


export function useCommitSyncedStorageContext<T extends { grids: HamokGrid[] }>(settings: {
	excludedStorageIndexes?: number[], timeoutInMs?: number
}): UseContext<T> {
	const {
		excludedStorageIndexes = [],
		timeoutInMs = 3000,
	} = settings;
	const excludedIndexes = new Set(excludedStorageIndexes);
	return async (context) => {
		const { grids } = context;
		await Promise.all(grids
			.filter((_, index) => !excludedIndexes.has(index))
			.map(grid => grid.promiseCommitSync(false, timeoutInMs))
		);
		return async () => {
			// empty
		}
	}
}


export function usePromisedLeaderContext<T extends { grids: HamokGrid[] }>(settings: {
	excludedStorageIndexes?: number[], timeoutInMs?: number
}): UseContext<T> {
	const {
		excludedStorageIndexes = [],
		timeoutInMs = 3000,
	} = settings;
	const excludedIndexes = new Set(excludedStorageIndexes);
	return async (context) => {
		const { grids } = context;
		const timer = setTimeout(() => {
			throw new Error(`Expired timeout`);
		}, timeoutInMs);
		await Promise.all(grids.map((grid, index) => (!excludedIndexes.has(index) ? grid.promiseLeader() : Promise.resolve("not important")) ))
		clearTimeout(timer);
		return async () => {
			// empty
		}
	}
}

export function combineUseContexts<T>(
	...useContexts: UseContext<T>[]
): UseContext<T> {
	return async context => {
		const disposes: ((context: T) => Promise<void>)[] = [];
		for (const useContext of useContexts) {
			disposes.push(await useContext(context));
		}
		return async () => {
			for (const dispose of disposes.reverse()) {
				await dispose(context)
			}
		}
	}
}
