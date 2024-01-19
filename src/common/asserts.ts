
export type AssertManyBase<T1, T2 extends T1, R> = (expected?: T1, ...actuals: (T2 | undefined)[]) => R;
export type AssertMany<T1, T2 extends T1> = AssertManyBase<T1, T2, void>;

export function assertEquals<T1, T2 extends T1>(expected?: T1, ...actuals: (T2 | undefined)[]) {
	if (actuals.length < 1) {
		if (expected === undefined) return;
		throw new Error(`Expected value: ${expected}, Actuals: ${actuals}`);
	}
	for (const actual of actuals) {
		if (expected !== actual) {
			throw new Error(`Expected value: ${expected}, Actual: ${actual}`);
		}
	}
	
}

export function assertNotEquals<T1, T2 extends T1>(expected?: T1, ...actuals: (T2 | undefined)[]) {
	if (actuals.length < 1) {
		if (expected !== undefined) return;
		throw new Error(`Expected value: ${expected} NOT equal to actuals: ${actuals}`);
	}
	for (const actual of actuals) {
		if (expected === actual) {
			throw new Error(`Expected value: ${expected} NOT equal to actuals: ${actuals}`);
		}
	}
}