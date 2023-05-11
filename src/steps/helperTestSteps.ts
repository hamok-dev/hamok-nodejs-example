import { HamokGrid } from "@hamok-dev/hamok-js-core";
import { TestStep } from "../common/types";

export function createCommitSyncTestStep<T extends { grids: HamokGrid[] }>(): TestStep<T> {
	return {
		description: `Enforce Commit Sync on all grids`,
		execute: async context => {
			const { grids } = context;
			await Promise.all(grids.map(grid => grid.promiseCommitSync(false, 3000)));
			await Promise.all(grids.map(grid => grid.sync()));
		}
	}
}

export function createEnforcedWaitTestStep<T>(waitingTimeInMs: number): TestStep<T> {
	return {
		description: `Enforce ${waitingTimeInMs}ms sleep`,
		// hideDescription: true,
		execute: async () => {
			await new Promise(resolve => setTimeout(resolve, waitingTimeInMs));
		}
	}
}

export function createEnforceLeaderExists<T extends { grids: HamokGrid[] }>(timeoutInMs: number, excludingStorageIndex?: number): TestStep<T> {
	return {
		description: `Enforce leader in grid or timeout in${timeoutInMs}ms`,
		// hideDescription: true,
		execute: async (context) => {
			const { grids } = context;
			const timer = setTimeout(() => {
				throw new Error(`Expired timeout`);
			}, timeoutInMs);
			await Promise.all(grids.map((grid, index) => ( index !== excludingStorageIndex ? grid.promiseLeader() : Promise.resolve("not important")) ))
			clearTimeout(timer);
		}
	}
}

export function createProvisions(numberOfMaps: number, numberOfItems: number): Map<number, string>[] {
	const result: Map<number, string>[] = [];
	for (let i = 0; i < numberOfMaps; ++i) {
		const map = new Map<number, string>();
		while (map.size < numberOfItems) {
			const item = Math.random();
			map.set(item, `${item}`);
		}
		result.push(map);
	}
	return result;
}
