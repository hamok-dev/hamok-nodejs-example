import { Storage } from "@hamok-dev/hamok-js-core";

export type TestStorage = Storage<number, string>;
export type TestMap = Map<number, string>;

export interface TestContext<TContext> {
	context: TContext,
	dispose(): Promise<void>
}

export interface TestSuite {
	scenario: string,
	launch(): Promise<void>;
	then<TNextContext>(
		scenario: string,
		contextCreator: () => Promise<TestContext<TNextContext>>, 
		...steps: TestStep<TNextContext>[]
	): TestSuite;
}

export interface TestStep<TContext> {
	hideDescription?: boolean;
	description: string;
	execute(context: TContext): Promise<void>
}
