import replicatedStorageTest from './replicated_1';
import separatedStorageTest from './separated_1';

async function main() {
	let failed = false;
	// await separatedStorageTest.launch().catch(() => failed = true);
	await replicatedStorageTest.launch().catch(() => failed = true);

	process.exit(failed === false ? 0 : 1);
}

main();