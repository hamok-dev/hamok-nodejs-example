import { HamokGrid, HamokGridBuilderConfig } from "@hamok-dev/hamok-js-core";
import { Router } from "../common/Router";
import { TestContext } from "../common/types";

export type GridContext = {
	grids: HamokGrid[],
	router: Router,
}

export async function createGridContext(...configs: Partial<HamokGridBuilderConfig>[]): Promise<TestContext<GridContext>> {
	
	const grids = configs.map(config => HamokGrid.builder().withConfig(config).build());

	await Promise.all(
		grids.map(grid => grid.start())
	);

	const router = new Router();
	grids.forEach(grid => router.add(grid));
	
	if (1 < grids.length) {
		await new Promise<void>(resolve => {
			grids[0].onLeaderChanged(event => {
				if (event.actualLeaderId) {
					resolve();
				}
			})
		});
	}

	const dispose = async () => {
		const removeFromRouters = new Promise<void>((resolve) => {
			grids.forEach(grid => router.remove(grid.localEndpointId));
			resolve();
		});
		const promises = grids.map(grid => new Promise<void>(resolve => {
			grid.stop();
			resolve();
		}));
		await Promise.all([
			removeFromRouters,
			...promises
		]
			
		);
	};
	
	const context: GridContext = {
		grids,
		router,
	}
	return {
		context,
		dispose,
	}


}






