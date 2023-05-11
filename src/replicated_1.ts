import { HamokGridBuilderConfig, Storage } from "@hamok-dev/hamok-js-core";
import { combineContexts } from "./common/combineContexts";
import { createGridContext, GridContext } from "./contexts/GridsContext";
import { createTestSuite, TestSuiteContext } from "./common/createTestSuite";
import { createTestSuiteAsStep } from "./common/createTestStep";
import { provisionStorageContext } from "./contexts/ProvisionedStorageContext";
import { createReplicatedStorageContext, ReplicatedStorageContext } from "./contexts/ReplicatedStoragesContext";
import { createCommitSyncTestStep, createEnforcedWaitTestStep, createEnforceLeaderExists, createProvisions } from "./steps/helperTestSteps";
import { createDeleteAllFromStoragesTest, createDeleteFromStoragesTest, createEvictAllFromStoragesTest, createEvictFromStoragesTest, createGetAllFromStoragesTest, createGetFromStoragesTest, createRestoreStoragesTest, createUpdateAllStoragesTest, createUpdateStoragesTest } from "./steps/distributedOperationsTestSteps";
import { createInsertAllAtomicTest, createInsertAtomicTest } from "./steps/distributedAtomicityTestSteps";
import { createDisconnectedRouterContext } from "./contexts/RouterOperationContexts";

const baseConfig: Partial<HamokGridBuilderConfig> = {
	logLevel: 'info',
	raftLogExpirationTimeInMs: 5000,
}

const gridConfigs: Partial<HamokGridBuilderConfig>[] = [{
	...baseConfig,
	id: 'testgrid-1',
}, {
	...baseConfig,
	id: 'testgrid-2',
}, {
	...baseConfig,
	id: 'testgrid-3',
	// logLevel: 'trace',
}];

const map = createProvisions(1, 10)[0];
const updatedMap = new Map<number, string>(Array.from(map).map(entry => [entry[0], `${Math.random()}`]));
const updatedMap2 = new Map<number, string>(Array.from(map).map(entry => [entry[0], 0.3 < Math.random() ? `${Math.random()}` : entry[1]]));
const updatedMap3 = new Map<number, string>(Array.from(map).map(entry => [entry[0], 0.3 < Math.random() ? `${Math.random()}` : entry[1]]));

export default createTestSuite<GridContext>({
		description: `Replicated Storage Tests for ${gridConfigs.length} grids`,
		baseIndent: 0,
		logDescription: true,
	},

	// context
	() => createGridContext(...gridConfigs),
	
	// test steps
	// createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
	// 		description: `A Replicated Storage performs the basic operations on any grid`,
	// 		baseIndent: 1,
	// 		logDescription: true
	// 	},
	// 	context => createReplicatedStorageContext(context),

	// 	createUpdateStoragesTest(1, `value`),
	// 	createGetFromStoragesTest(1, `value`),
	// 	createInsertAtomicTest(2, `value2`),
	// 	createDeleteFromStoragesTest(1),
	// 	createEvictFromStoragesTest(2),
	// ),

	// createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
	// 		description: `A Replicated Storage performs batch operations on any grid`,
	// 		baseIndent: 1,
	// 		logDescription: true
	// 	},
	// 	context => createReplicatedStorageContext(context),

	// 	createUpdateAllStoragesTest(map),
	// 	createGetAllFromStoragesTest(map),
	// 	createDeleteAllFromStoragesTest(map.keys()),
	// 	createInsertAllAtomicTest(map),
	// 	createEvictAllFromStoragesTest(new Set<number>(map.keys())),
	// ),

	// createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
	// 		description: `Overriding values in one Replicated Storage overrides on all`,
	// 		baseIndent: 1,
	// 		logDescription: true
	// 	},
	// 	context => createReplicatedStorageContext(context),

	// 	createInsertAtomicTest(1, 'value'),
	// 	createUpdateStoragesTest(1, 'value2'),
	// 	createGetFromStoragesTest(1, 'value2'),

	// 	createInsertAllAtomicTest(map),
	// 	createUpdateAllStoragesTest(updatedMap),
	// 	createGetAllFromStoragesTest(updatedMap),
	// 	createDeleteAllFromStoragesTest(updatedMap.keys()),
	// ),

	createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
			description: `Syncing between Replicated Storage`,
			baseIndent: 1,
			logDescription: true
		},
		context => createReplicatedStorageContext(context),

		createUpdateAllStoragesTest(map),

		createTestSuiteAsStep<ReplicatedStorageContext, ReplicatedStorageContext>({
				description: `Disconnecting ${gridConfigs[0].id}`,
				baseIndent: 2,
				logDescription: true
			},
			context => createDisconnectedRouterContext(context, gridConfigs[0].id!),

			createEnforceLeaderExists(5000),

			// add 100 -> value to storage[0] and only to that while that storage is disconnected
			createUpdateStoragesTest(1000, `value`, 0, [1, 2]),

			createUpdateAllStoragesTest(updatedMap, 1, 0),
			createEnforcedWaitTestStep((baseConfig.raftLogExpirationTimeInMs ?? 5000) * 2),
			createUpdateAllStoragesTest(updatedMap2, 1, 0),
			createEnforcedWaitTestStep((baseConfig.raftLogExpirationTimeInMs ?? 5000) * 2),
			createUpdateAllStoragesTest(updatedMap3, 1, 0),
			createEnforcedWaitTestStep((baseConfig.raftLogExpirationTimeInMs ?? 5000) * 2),
		),
		createCommitSyncTestStep(),
		createEnforcedWaitTestStep(2000),
		createGetAllFromStoragesTest(updatedMap3),
		createGetFromStoragesTest(1000, `value`),
	),
	

	// createTestSuiteAsStep({
	// 		description: `SubContext`,
	// 		baseIndent: (testScenarioContext.baseIndent ?? 0) + 1
	// 	},
	// 	createDisconnectedRouterContext,
		
	// 	// sub steps
	// )
);