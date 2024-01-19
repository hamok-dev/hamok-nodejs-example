import { UseContext } from "../common/test";
import { GridContext } from "./GridsContext";

export function useDisconnectedRouterContext<T extends GridContext>(disconnnectingEndpointId: string): UseContext<T>  {
	return async (context) => {
		const { grids, router } = context;
		const selectedGrids = grids.filter(grid => grid.localEndpointId === disconnnectingEndpointId);
		if (selectedGrids.length !== 1) {
			throw new Error(`Cannot find grid ${disconnnectingEndpointId}`);
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
		return dispose;
	};
}
