import { TestContext } from "./types";

export async function combineContexts<SourceContext, TargetContext>(
	createSourceContext: () => Promise<TestContext<SourceContext>>,
	createTargetContext: (input: SourceContext) => Promise<TestContext<TargetContext>>
): Promise<TestContext<TargetContext>> {
	const { context: sourceContext, dispose: sourceDispose } = await createSourceContext();
	const { context, dispose: targetDispose } = await createTargetContext(sourceContext);
	const dispose = async () => {
		await targetDispose();
		await sourceDispose();
	}

	return {
		context,
		dispose
	}
}