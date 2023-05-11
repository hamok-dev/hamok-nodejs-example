import { TestContext, TestStep, TestStorage, TestSuite } from "../common/types";
import { Storage } from "@hamok-dev/hamok-js-core";
import { createTestSuite, TestSuiteContext } from "../common/createTestSuite";
import { assertEquals } from "../common/utils";

// export type Context

export function createSingleStorageSmokeTestSuite<T extends { storage: TestStorage }>(context: T): TestSuite {
	const { storage } = context;

	const getAndSetTestStep: TestStep<T> = {
		description: `Get and Set from ${storage.id}`,
		execute: async () => {
			const expected = '1';
			storage.set(1, expected);
			assertEquals(expected, await storage.get(1));
		}
	};

	const getAndSetAllTestStep: TestStep<T> = {
		description: `GetAll and SetAll from ${storage.id}`,
		execute: async () => {
			const expected = '1';
			storage.setAll(new Map<number, string>([[1, expected]]));
			assertEquals(expected, await storage.get(1));
		}
	};

	const testSuiteContext: TestSuiteContext = {
		description: `Single Storage Smoke Test`,
		logDescription: true,
	}
	const testContext: TestContext<T> = {
		context,
		dispose: async () => {

		}
	};
	return createTestSuite<T>(
		testSuiteContext,
		async () => testContext,
		
		getAndSetTestStep,
		getAndSetAllTestStep
	)
}