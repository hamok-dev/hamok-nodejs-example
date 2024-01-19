import colors from 'colors';

export interface TestContext<TContext> {
	context: TContext,
	dispose(): Promise<void>
}

export interface TestSuite {
	title: string,
	launch(): Promise<void>
}


export interface TestScenario {
	scenario: string,
	play(): Promise<void>
}


export interface TestStep<TContext> {
	description: string;
	start(context: TContext): Promise<void>
}

export interface TestSpecification<TContext> {
	padding?: number;
	description: string;
	execute(context: TContext): Promise<void>;
}

export type TestAction<T> = (context: T) => Promise<void>;

export function createTestSpecification<T>(description: string, action: TestAction<T>): TestSpecification<T> {
	const baseTab = ' '.repeat(6);
	const result: TestSpecification<T> = {
		description, 
		execute: async (context: T) => {
			process.stdout.write(`${baseTab}${description.padEnd(result.padding ?? description.length + 2)} `);
			return new Promise((resolve, reject) => {
				action(context).then(() => {
					process.stdout.write(`${colors.bgGreen.black(' PASS ')}\n`);
					resolve();
				}).catch(err => {
					process.stdout.write(`${colors.bgRed.black(' FAIL ')}\n`);
					console.error(err);
					reject(err);
				});
			})
		}
	};

	return result;
}

export type UseContext<T> = (context: T) => Promise<(context: T) => Promise<void>>;

export function createTestStep<T>(description: string, useContext: UseContext<T>, ...specifications: TestSpecification<T>[]): TestStep<T> {
	const baseTab = ' '.repeat(4);
	let started = false;
	const start = async (context: T) => {
		if (started) {
			throw new Error(`TestSpecification (${description}) can be started only once`);
		}
		process.stdout.write(`${baseTab}${description}\n`);
		
		const specificationPadding = Math.max(10, ...specifications.map(o => o.description.length)) + 5;

		const changeBack = await useContext(context);
		let succeeded = true;
		for (const specification of specifications) {
			
			specification.padding = specificationPadding;
			succeeded = await specification.execute(context)
				.then(() => true)
				.catch(() => false)

			if (!succeeded) {
				break;
			}
		}
		await changeBack(context);
		if (!succeeded) {
			throw new Error(`Failed`);
		}
	}
	const result: TestStep<T> = {
		description,
		start,
	}
	return result;
}

export function createTestScenario<T>(scenario: string, contextCreator: () => Promise<TestContext<T>>, ...steps: TestStep<T>[]): TestScenario {
	const baseTab = ' '.repeat(2);
	const play = async () => {
		const testContext = await contextCreator();
		const { context, dispose } = testContext;
		let executed = false;

		process.stdout.write(`${baseTab}${scenario}\n`);

		for (const step of steps) {
			executed = await step.start(context)
				.then(() => true)
				.catch(() => false)
			if (!executed) {
				break;
			}
		}
		await dispose();
		if (!executed) {
			throw new Error(`Failed`);
		}
	}
	
	return {
		scenario,
		play,
	}
}

export function createTestSuite(title: string, ...scenarios: TestScenario[]): TestSuite {
	const launch = async (): Promise<void> => {
		
		process.stdout.write(`${title}\n`);

		for (const scenario of scenarios) {
			await scenario.play().catch(err => {
				process.stderr.write(`${err}`);
			})
		}
	};
	return {
		title,
		launch
	}
}
