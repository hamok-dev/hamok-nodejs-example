import { createReplicatedTestSuites } from "./replicatedStorageTests";
import { createReplicatedStorageConsistencyTestSuite } from "./testSuites/replicatedStorageConsistencySuite";

async function main() {
	let failed = false;
	for (const suite of createReplicatedTestSuites()) {
		await suite.launch();
	}
	// await separatedStorageTest.launch().catch(() => failed = true);
	// await replicatedStorageTest.launch().catch(() => failed = true);

	process.exit(failed === false ? 0 : 1);
}

main();