import { HamokGridBuilderConfig } from "@hamok-dev/hamok-js-core";
import { TestSuite } from "./common/test";
import { createSepratedStorageContext, SeparatedStorageContext } from "./contexts/SeparatedStoragesContext";
import { createReplicatedStorageConsistencyTestSuite } from "./testSuites/replicatedStorageConsistencySuite";

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

export function createReplicatedTestSuites(): TestSuite[] {
	return [
		createReplicatedStorageConsistencyTestSuite(gridConfigs)
	];
}