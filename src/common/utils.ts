
export function arrayTuppling<T extends any[]>(...arrays: { [K in keyof T]: Array<T[K]> }): Array<T> {
	if (arrays.length < 1) return [];
  
	const equalSizes = arrays.reduce((isEqual, array, index, arrays) => {
	  return isEqual && (index === 0 || array.length === arrays[index - 1].length);
	}, true);
  
	if (!equalSizes) {
	  throw new Error("Arrays to tupling must have equal number of items");
	}
  
	const elementsNum = arrays[0].length;
	const result: Array<T> = [];
  
	for (let i = 0; i < elementsNum; ++i) {
	  const tuple = ([] as unknown) as T;
	  for (let j = 0; j < arrays.length; ++j) {
		tuple[j] = arrays[j][i];
	  }
	  result.push(tuple);
	}
  
	return result;
}

export type AssertManyBase<T1, T2 extends T1, R> = (expected?: T1, ...actuals: (T2 | undefined)[]) => R;
export type AssertMany<T1, T2 extends T1> = AssertManyBase<T1, T2, void>;

export function createMessageAuxAssertEquals<T1, T2 extends T1>(messageSupplier: AssertManyBase<T1, T2, string>): AssertMany<T1, T2> {
	return (expected, ...actuals) => {
		if (actuals.length < 1) {
			if (expected === undefined) return;
			throw new Error(messageSupplier(expected, ...actuals));
		}
		for (const actual of actuals) {
			if (expected !== actual) {
				throw new Error(messageSupplier(expected, ...actuals));
			}
		}
	}
}

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