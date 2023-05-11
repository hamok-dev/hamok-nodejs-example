import { TestContext, TestStep, TestSuite } from "./types";
import colors from 'colors';
import { CodeGeneratorResponse_File } from "@bufbuild/protobuf";

export type TestSuiteContext = {
	description: string,
	baseIndent?: number,
	logDescription?: boolean,
}

export function createTestSuite<TContext>(
	testSuiteContext: TestSuiteContext,
	contextCreator: () => Promise<TestContext<TContext>>,
	...steps: TestStep<TContext>[]
): TestSuite {
	const { description: scenario , baseIndent, logDescription } = testSuiteContext;
	let nextLaunches: (() => Promise<void>)[] = [];
	let launched = false;
	const launch = async (): Promise<void> => {
		if (launched) {
			throw new Error(`Cannot launch a test suite twice`);
		}
		launched = true;
		const baseTab = '  '.repeat(baseIndent ?? 0);
		const baseSubTab = `${baseTab}  `;

		// print scenario
		if (logDescription) {
			console.log(baseTab, scenario);
		}
		
		let failed = false;
		const { context, dispose } = await contextCreator();
		const results: [string, boolean][] = [];
		const largestDesc = Math.max(10, ...steps.map(o => o.description.length)) + 5;
		for (let i = 0; i < steps.length; ++i) {
			const step = steps[i];
			// console.warn(`executing step`, step);
			// print description
			const next = await step.execute(context).then(() => {
				// print everything is fine
				// throw new Error(`skdjhasjkdsaj`);
				if (!step.hideDescription) {
					// results.push([step.description, true]);
					console.log(baseSubTab, step.description.padEnd(largestDesc), colors.bgGreen.black(' PASS '));
				}
				return true;
			}).catch(err => {
				// print error
				if (!step.hideDescription) {
					results.push([step.description, false]);
					// table.push([baseSubTab + step.description, colors.bgRed.black(' FAIL ')]);
					console.log(baseSubTab, step.description.padEnd(largestDesc), colors.bgRed.black(' FAIL '), err);
				}
				return false;
			});
			if (!next) {
				failed = true;
				break;
			}
		}
		// const largestDesc = Math.max(10, ...results.map(o => o[0].length)) + 5;
		// for (const [desc, passed] of results) {
		// 	console.log(
		// 		baseSubTab, 
		// 		desc.padEnd(largestDesc), 
		// 		passed ? colors.bgGreen.black(' PASS ') : colors.bgRed.black(' FAIL ')
		// 	);
		// }
		await dispose();
		if (failed) {
			throw new Error(`TestSuite ${scenario} is failed`);
		}
		if (0 < nextLaunches.length) {
			await Promise.all(nextLaunches);
		}
	}

	const then = <TNextContext>(
		nextScenario: string,
		nextContextCreator: () => Promise<TestContext<TNextContext>>, 
		...nextSteps: TestStep<TNextContext>[]
		): TestSuite => {
			const result =  createTestSuite<TNextContext>(
				{ description: nextScenario, baseIndent, logDescription },
				nextContextCreator, 
				...nextSteps
			);
			const addedSuiteLaunch = result.launch;
			nextLaunches.push(addedSuiteLaunch);
			
			// if we launch the set we launch the very start
			result.launch = launch;
			return result;
	};

	return {
		scenario,
		launch,
		then,
	}
}

