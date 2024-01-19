
// export function createTestSuiteAsStep<TContext, TSubContext>(
// 	testSuiteContext: TestSuiteContext,
// 	contextCreator: (context: TContext) => Promise<TestContext<TSubContext>>,
// 	...steps: TestStep<TSubContext>[]
// ): TestStep<TContext> {
// 	const { description } = testSuiteContext;
// 	const execute =  async (context: TContext) => {
// 		const testSuite = createTestSuite<TSubContext>(
// 			testSuiteContext,
// 			() => contextCreator(context),
// 			...steps
// 		);
// 		await testSuite.launch();
// 	}
// 	return {
// 		execute,
// 		description,
// 		hideDescription: true,
// 	}
// }

// export function createTestStepFromSuite<TContext>(testSuite: TestSuite): TestStep<TContext> {
// 	const { scenario, launch } = testSuite;
// 	return {
// 		execute: launch,
// 		description: scenario,
// 	}
// }

// export function createTestStep<T>(description: string, execute: (context: T) => Promise<void>): TestStep<T> {
// 	return {
// 		description,
// 		execute
// 	}
// }