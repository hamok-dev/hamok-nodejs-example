import { HamokGridBuilderConfig } from "@hamok-dev/hamok-js-core";
import { combineContexts } from "./common/combineContexts";
import { createGridContext, GridContext } from "./contexts/GridsContext";
import { createTestSuite, TestSuiteContext } from "./common/createTestSuite";
import { createTestSuiteAsStep } from "./common/createTestStep";
import { provisionStorageContext } from "./contexts/ProvisionedStorageContext";
import { createSepratedStorageContext, SeparatedStorageContext } from "./contexts/SeparatedStoragesContext";

const gridConfigs: Partial<HamokGridBuilderConfig>[] = [{
	id: 'testgrid-1',
	// logLevel: 'debug',
}, {
	id: 'testgrid-2',
	// logLevel: 'debug',
}, {
	id: 'testgrid-3',
	// logLevel: 'debug',
}];


export default createTestSuite<GridContext>({
		description: `Separated Storage Tests`,
		baseIndent: 0,
		logDescription: true,
	},

	// context
	() => createGridContext(...gridConfigs),
	
	// test steps
	createTestSuiteAsStep({
			description: `Basic Operations`,
			baseIndent: 1,
			logDescription: true
		},
		createSepratedStorageContext,
		
		// sub steps
		// createGetEachFromGridTest(),
		// createGetAllFromGridTest(),
		// createEvictAndRestoreTest(),
		
		// createInsertAtomicTest(),
		// createInsertAllAtomicTest(),
		
	),

	// createTestSuiteAsStep({
	// 		description: `SubContext`,
	// 		baseIndent: (testScenarioContext.baseIndent ?? 0) + 1
	// 	},
	// 	createDisconnectedRouterContext,
		
	// 	// sub steps
	// )
);