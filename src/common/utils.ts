
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

export function createProvisions(numberOfMaps: number, numberOfItems: number): Map<number, string>[] {
	const result: Map<number, string>[] = [];
	for (let i = 0; i < numberOfMaps; ++i) {
		const map = new Map<number, string>();
		while (map.size < numberOfItems) {
			const item = Math.random();
			map.set(item, `${item}`);
		}
		result.push(map);
	}
	return result;
}
