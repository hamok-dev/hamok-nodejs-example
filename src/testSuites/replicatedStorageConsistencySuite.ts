import { HamokGridBuilderConfig } from "@hamok-dev/hamok-js-core";
import { createGridContext, GridContext } from "../contexts/GridsContext";
import { createReplicatedStorageContext, ReplicatedStorageContext } from "../contexts/ReplicatedStoragesContext";
import { createTestScenario, createTestSpecification, createTestStep, createTestSuite, TestSuite } from "../common/test";
import { createUpdateStoragesTestStep, createUpdateAllStoragesTestStep } from "../testSteps/updateStorageTestSteps";
import { createProvisions } from "../common/utils";
import { combineContexts, combineUseContexts, useContextNoChange } from "../contexts/helperContexts";
import { useDisconnectedRouterContext } from "../contexts/useDisconnectedRouterContext";
import { useUpdateAllStoragesContext } from "../contexts/useUpdateStoragesContext";
import { createGetAllFromStorageAction, createGetFromStorageAction } from "../testActions/getFromStorageActions";

const baseConfig: Partial<HamokGridBuilderConfig> = {
	logLevel: 'info',
	raftLogExpirationTimeInMs: 5000,
}

// const gridConfigs: Partial<HamokGridBuilderConfig>[] = [{
// 	...baseConfig,
// 	id: 'testgrid-1',
// }, {
// 	...baseConfig,
// 	id: 'testgrid-2',
// }, {
// 	...baseConfig,
// 	id: 'testgrid-3',
// 	// logLevel: 'trace',
// }];

// const baseEntries = createProvisions(1, 10)[0];
// const updatedEntries = new Map<number, string>(Array.from(baseEntries).map(entry => [entry[0], `${Math.random()}`]));
// const updatedEntries2 = new Map<number, string>(Array.from(updatedEntries).map(entry => [entry[0], 0.3 < Math.random() ? `${Math.random()}` : entry[1]]));
// const updatedEntries3 = new Map<number, string>(Array.from(updatedEntries2).map(entry => [entry[0], 0.3 < Math.random() ? `${Math.random()}` : entry[1]]));

export function createReplicatedStorageConsistencyTestSuite(gridConfigs: Partial<HamokGridBuilderConfig>[]): TestSuite {
	const nrOfEndpoints = gridConfigs.length;
	const key = 1;
	const value = 'value';
	const baseEntries = createProvisions(10, nrOfEndpoints);
	const entries = baseEntries[0];
	const result = createTestSuite(
		`Consistency of replicated storages for ${nrOfEndpoints} endpoints`,
		createTestScenario(
			`Given a fully connected grid with ${nrOfEndpoints} endpoints`,
			
			() => combineContexts<GridContext, ReplicatedStorageContext>(
				async () => createGridContext(...gridConfigs),
				async context => createReplicatedStorageContext(context),
			),
			
			// list of basic operations
			createUpdateStoragesTestStep<ReplicatedStorageContext>({
				key,
				value,
				promiseCommitSync: true,
				stepDescription: `When one storage is updated`,
				specDescription: `Then the value can be retrieved from all storages`
			}),
			createUpdateAllStoragesTestStep<ReplicatedStorageContext>({
				entries,
				promiseCommitSync: true,
				stepDescription: `When one storage is batch updated`,
				specDescription: `Then batch of entries can be retrieved from all storages`
			}),

			createTestStep<ReplicatedStorageContext>(
				`When endpoint ${gridConfigs[0].id!} disconnects from the grid`,
				combineUseContexts<ReplicatedStorageContext>(
					useUpdateAllStoragesContext<ReplicatedStorageContext>({
						entries,
					}),
					useDisconnectedRouterContext<ReplicatedStorageContext>(
						gridConfigs[0].id!
					)
				),

				
				
			),

			createTestStep<ReplicatedStorageContext>(
				`When endpoint ${gridConfigs[0].id!} reconnected to the grid`,
				useContextNoChange(),

				createTestSpecification(
					`Then `,
					createGetAllFromStorageAction({
						entries,
						excludingStorageIndexes: [0],
					}),
				)
			),

			// createTestStep<ReplicatedStorageContext>(
			// 	`When endpoint ${gridConfigs[0].id!} disconnects from the grid longer than logs retention period`,
			// 	() => combineContexts<ReplicatedStorageContext, ReplicatedStorageContext>(
			// 		async () => useUpdateAllStoragesContext({
			// 			entries,
			// 		}),
			// 		async context => useDisconnectedRouterContext(context, gridConfigs[0].id!)
			// 	),

			// ),

			createTestStep<ReplicatedStorageContext>(
				`When endpoint ${gridConfigs[0].id!} reconnected to the grid`,
				useContextNoChange(),

			),
		)
	);
	return result;
}


// export default createTestSuite<GridContext>({
// 		description: `Replicated Storage Tests for ${gridConfigs.length} grids`,
// 		baseIndent: 0,
// 		logDescription: true,
// 	},

// 	// context
// 	() => createGridContext(...gridConfigs),
	
// 	// test steps
// 	createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
// 			description: `A Replicated Storage performs the basic operations on any grid`,
// 			baseIndent: 1,
// 			logDescription: true
// 		},
// 		context => createReplicatedStorageContext(context),

// 		createUpdateStoragesTest(1, `value`),
// 		createGetFromStoragesTest(1, `value`),
// 		createInsertAtomicTest(2, `value2`),
// 		createDeleteFromStoragesTest(1),
// 		createEvictFromStoragesTest(2),
// 	),

// 	createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
// 			description: `A Replicated Storage performs batch operations on any grid`,
// 			baseIndent: 1,
// 			logDescription: true
// 		},
// 		context => createReplicatedStorageContext(context),

// 		createUpdateAllStoragesTest(baseEntries),
// 		createGetAllFromStoragesTest(baseEntries),
// 		createDeleteAllFromStoragesTest(baseEntries.keys()),
// 		createInsertAllAtomicTest(baseEntries),
// 		createEvictAllFromStoragesTest(new Set<number>(baseEntries.keys())),
// 	),

// 	createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
// 			description: `Overriding values in one Replicated Storage overrides on all`,
// 			baseIndent: 1,
// 			logDescription: true
// 		},
// 		context => createReplicatedStorageContext(context),

// 		createInsertAtomicTest(1, 'value'),
// 		createUpdateStoragesTest(1, 'value2'),
// 		createGetFromStoragesTest(1, 'value2'),

// 		createInsertAllAtomicTest(baseEntries),
// 		createUpdateAllStoragesTest(updatedEntries),
// 		createGetAllFromStoragesTest(updatedEntries),
// 		createDeleteAllFromStoragesTest(updatedEntries.keys()),
// 	),

// 	createTestSuiteAsStep<GridContext, ReplicatedStorageContext>({
// 			description: `Syncing between Storages`,
// 			baseIndent: 1,
// 			logDescription: true
// 		},
// 		context => createReplicatedStorageContext(context),

// 		createUpdateAllStoragesTest(baseEntries),

// 		// Check if a disconnected storage got the entries after reconnecting

// 		createTestSuiteAsStep<ReplicatedStorageContext, ReplicatedStorageContext>({
// 				description: `Disconnecting ${gridConfigs[0].id} for less than ${baseConfig.raftLogExpirationTimeInMs}`,
// 				baseIndent: 2,
// 				logDescription: true
// 			},
// 			context => createDisconnectedRouterContext(context, gridConfigs[0].id!),

// 			createEnforceLeaderExists(5000),

// 			createUpdateAllStoragesTest(updatedEntries, 1, 0),
// 		),
// 		createCommitSyncTestStep(),
// 		createGetAllFromStoragesTest(updatedEntries),
// 		createEnforcedWaitTestStep(5000),


// 		// check ifstorage sync correctly syncing all storage after reconnecting
// 		createTestSuiteAsStep<ReplicatedStorageContext, ReplicatedStorageContext>({
// 				description: `Disconnecting ${gridConfigs[0].id} for more than ${baseConfig.raftLogExpirationTimeInMs}`,
// 				baseIndent: 2,
// 				logDescription: true
// 			},
// 			context => createDisconnectedRouterContext(context, gridConfigs[0].id!),

// 			// need a bit sleep, otherwise the updateStorage request a promiseCommitSync before the actual leader event is processed, but after the disconnect has happened,
// 			// and got stuck until griddispatcher throws timeout
// 			createEnforcedWaitTestStep(5000),
			
// 			// add 100 -> value to storage[0] and only to that while that storage is disconnected
// 			createUpdateStoragesTest(1000, `value`, 0, [1, 2]),
// 			createUpdateAllStoragesTest(updatedEntries, 1, 0),
// 			createEnforcedWaitTestStep((baseConfig.raftLogExpirationTimeInMs ?? 5000) * 2),
// 			createUpdateAllStoragesTest(updatedEntries2, 1, 0),
// 			createEnforcedWaitTestStep((baseConfig.raftLogExpirationTimeInMs ?? 5000) * 2),
// 			createUpdateAllStoragesTest(updatedEntries3, 1, 0),
// 			createEnforcedWaitTestStep((baseConfig.raftLogExpirationTimeInMs ?? 5000) * 2),
// 		),
// 		createCommitSyncTestStep(),
// 		createEnforcedWaitTestStep(2000),
// 		createGetAllFromStoragesTest(updatedEntries3),
// 		createGetFromStoragesTest(1000, `value`),
// 	),
	

// 	// createTestSuiteAsStep({
// 	// 		description: `SubContext`,
// 	// 		baseIndent: (testScenarioContext.baseIndent ?? 0) + 1
// 	// 	},
// 	// 	createDisconnectedRouterContext,
		
// 	// 	// sub steps
// 	// )
// );