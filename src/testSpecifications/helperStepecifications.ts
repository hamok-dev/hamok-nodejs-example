import { HamokGrid } from "@hamok-dev/hamok-js-core";
import { createTestSpecification, createTestStep, TestAction, UseContext } from "../common/test";


export function createTestSpecificationByUseContext<T>(
	description: string,
	useContext: UseContext<T>,
	...actions: TestAction<T>[]
) {
	return createTestSpecification<T>(
		description,
		async (context: T) => {
			const dispose = await useContext(context);
			return new Promise((resolve, reject) => {
				let promise = Promise.resolve<void>(undefined);
				for (const action of actions) {
					promise = promise.then(() => action(context));
				}
				promise.then(() => {
					dispose(context).then(resolve);
				}).catch(err => {
					dispose(context).then(() => reject(err));
				});
			});
		}
	)
}

export function createUseContextForTestSpecifications<T>(
	description: string,
	useContext: UseContext<T>,
	...actions: TestAction<T>[]
) {
	return createTestSpecification<T>(
		description,
		async (context: T) => {
			return new Promise(async (resolve, reject) => {
				let promise = Promise.resolve<void>(undefined);
				let error: any | undefined;
				for (const action of actions) {
					const dispose = await useContext(context);
					await action(context).catch(err => {
						error = err;
					});
					await dispose(context);
					if (error) {
						break;
					}
				}
				if (!error) {
					resolve();
				} else {
					reject(error);
				}
			});
		}
	)
}


