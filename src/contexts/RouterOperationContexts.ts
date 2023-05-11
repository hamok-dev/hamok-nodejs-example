
import { createCodec, SeparatedStorage } from "@hamok-dev/hamok-js-core";
import { TestContext } from "../common/types";
import { GridContext } from "./GridsContext";


export async function createDisconnectedRouterContext<T extends GridContext>(context: T, disconnnectingEndpointId: string): Promise<TestContext<T>> {
	const { grids, router } = context;
	const selectedGrids = grids.filter(grid => grid.localEndpointId === disconnnectingEndpointId);
	if (selectedGrids.length !== 1) {
		throw new Error(`Cannot finc grid ${disconnnectingEndpointId}`);
	}
	const otherGrids = grids.filter(grid => grid.localEndpointId !== disconnnectingEndpointId);

	const selectedGrid = selectedGrids[0];
	otherGrids.forEach(otherGrid => {
		selectedGrid.removeRemoteEndpointId(otherGrid.localEndpointId);
		otherGrid.removeRemoteEndpointId(disconnnectingEndpointId);
	});
	
	router.disconnect(disconnnectingEndpointId);
	
	const dispose = async () => {
		otherGrids.forEach(otherGrid => {
			selectedGrid.addRemoteEndpointId(otherGrid.localEndpointId);
			otherGrid.addRemoteEndpointId(disconnnectingEndpointId);
		});
		router.reconnect(disconnnectingEndpointId);
	}

	return {
		context,
		dispose
	}
}